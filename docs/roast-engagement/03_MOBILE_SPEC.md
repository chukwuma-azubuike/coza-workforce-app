# Roast Engagement System — Mobile Specification

React Native / Expo implementation. Written against this repo's conventions: Expo Router
file-based routes with logic in `views/`, RTK Query one-service-per-resource, typed
`useAppSelector`/`useAppDispatch`, NativeWind for styling, Formik + Yup for forms.

Read [`01_ARCHITECTURE.md`](./01_ARCHITECTURE.md) first — several things below only make
sense given ADR-002 (local-first reminders) and ADR-005 (reuse the routing contract).

---

## 1. File map

```
app/roast-crm/
  (tabs)/today/index.tsx              NEW  → views/roast-crm/today
  (tabs)/notifications/index.tsx      EDIT  re-point at the Today feed (ADR-006)
  (stack)/reminders/index.tsx         NEW  → views/roast-crm/reminders
  (stack)/streak/index.tsx            NEW  → views/roast-crm/streak
  (stack)/notification-settings/index.tsx  NEW

views/roast-crm/
  today/
    Today.tsx                         the Task Feed — the app's answer to "what now"
    TaskRow.tsx                       one task, one primary action
    StreakHeader.tsx                  ember + day count + at-risk state
    EmptyToday.tsx                    "All roasted for today 🔥"
  reminders/
    Reminders.tsx                     Upcoming / Completed segmented list
    ReminderRow.tsx
    ReminderSheet.tsx                 create + edit, shared
    SnoozeSheet.tsx                   1h · this evening · tomorrow · custom
  streak/
    Streak.tsx                        current, longest, heatmap
    StreakCalendar.tsx
    StreakResetCard.tsx               the gentle acknowledgment (US-4.3)
  guests/profile/
    GuestRemindersCard.tsx            NEW  this guest's reminders, in the profile
    GuestHeader.tsx                   EDIT add the "Set reminder" action
  notification-settings/
    NotificationSettings.tsx          per-type toggles, quiet hours, hideGuestNames

store/
  services/roast-engagement.ts        NEW  tasks · reminders · streak · prefs
  services/roast-crm.ts               EDIT delete mockNotifications + mockNotificationRules
  actions/roast-engagement.ts         NEW  persisted slice: cached feed, outbox, streak

hooks/roast-engagement/
  use-engagement-ping.ts              NEW  foreground + qualifying-action pings
  use-reminder-scheduler.ts           NEW  the 64-slot budgeted local scheduler
  use-streak.ts                       NEW  streak state + at-risk local notification
  use-widget-snapshot.ts              NEW  writes the shared-storage snapshot
  use-roast-notification-actions.ts   NEW  mark-done / snooze from the tray

constants/
  notification-channels.ts            EDIT +3 channels, +3 categories
  notification-routes.ts              EDIT +4 routes (regenerate — see the file header)
  roast-copy.ts                       NEW  the copy registry (UX spec §8)

utils/
  local-notifications.ts              NEW  scheduling primitives + the slot budget
  widget-bridge.ts                    NEW  shared-storage write/clear
```

## 2. RTK Query service

`store/services/roast-engagement.ts` — a **separate service from `roast-crm.ts`**, on the
same base URL. Splitting it is deliberate: `roast-crm.ts` is 859 lines and carries
`keepUnusedDataFor: 48h`, which is right for zones and stages and badly wrong for a feed
that changes hourly.

```ts
export const roastEngagementApi = createApi({
    reducerPath: 'roastEngagement',

    // Same prepareHeaders as roastCrmApi — extract it rather than copy it.
    baseQuery: fetchUtils.roastBaseQuery,

    tagTypes: ['Task', 'Reminder', 'Streak', 'RoastPrefs'],

    refetchOnFocus: true,
    refetchOnReconnect: true,

    // The feed is a "what should I do right now" list. Serving a 48-hour-old one is
    // worse than a spinner, and the persisted slice already covers the offline case.
    keepUnusedDataFor: 300,

    endpoints: endpoint => ({
        getTodayTasks: endpoint.query<ITodayTasks, { tz: string }>({ /* ... */ }),
        getReminders:  endpoint.query<IPaged<IReminder>, IRemindersQuery>({ /* ... */ }),
        syncReminders: endpoint.query<IReminderSync, { since?: string; deviceId: string }>({ /* ... */ }),
        createReminder: endpoint.mutation<IReminder, ICreateReminder>({ /* ... */ }),
        updateReminder: endpoint.mutation<IReminder, IUpdateReminder>({ /* ... */ }),
        completeReminder: endpoint.mutation<IReminder, { _id: string; completedVia: string }>({ /* ... */ }),
        snoozeReminder: endpoint.mutation<IReminder, { _id: string; dueAt: string }>({ /* ... */ }),
        deleteReminder: endpoint.mutation<void, string>({ /* ... */ }),
        pingEngagement: endpoint.mutation<IStreakState, IEngagementPing>({ /* ... */ }),
        getStreak: endpoint.query<IStreakState, void>({ /* ... */ }),
        getStreakHistory: endpoint.query<IStreakHistory, { months: number }>({ /* ... */ }),
    }),
});
```

Register the reducer and middleware in `store/index.ts` alongside the others — a new
service that is not in the middleware list fails at runtime with a message that does not
say so.

**Optimistic updates are mandatory on `completeReminder` and `snoozeReminder`.** Both are
reached from a notification tray on a bad network; a spinner between tap and effect is the
difference between "done" and "did that work?". Use `onQueryStarted` with
`updateQueryData` and roll back on rejection.

## 3. State slice

`store/actions/roast-engagement.ts`, added to the redux-persist whitelist next to
`roastCRMState`:

```ts
interface IRoastEngagementState {
    /** Last successful /tasks/today, for offline render + widget snapshot. */
    cachedFeed: { tasks: RoastTask[]; counts: ITaskCounts; generatedAt: string } | null;

    /** Last known streak, so the header renders instantly on cold start. */
    streak: IStreakState | null;

    /**
     * Mutations made while offline, applied in order on reconnect.
     *
     * Reminder completions arrive here from the notification response handler, which
     * can run with no network and no UI. Losing one means a reminder the worker
     * already dismissed comes back — the single most corrosive bug this feature can
     * have, because it teaches them the button does not work.
     */
    outbox: Array<{ id: string; kind: 'COMPLETE' | 'SNOOZE' | 'CREATE' | 'DELETE'; payload: unknown; queuedAt: string }>;

    /** Local ids currently scheduled, keyed by reminder id — the scheduler's ledger. */
    scheduled: Record<string, { notificationId: string; dueAt: string }>;

    /** Local date of the last successful engagement ping. Gates the at-risk schedule. */
    lastPingLocalDate: string | null;
}
```

`reset()` on logout, exactly as `notificationsSlice` does — and for the same reason.
Guest names in `cachedFeed` must not rehydrate into the next user's session on a shared
campus handset.

## 4. The local scheduler and the 64-slot budget

`hooks/roast-engagement/use-reminder-scheduler.ts` + `utils/local-notifications.ts`.

**The constraint.** iOS allows an app **64 pending local notifications**. Past that it
silently drops — no error, no callback. Reminders, the daily at-risk warning, and anything
else scheduled locally share those 64. A worker with 80 upcoming reminders who schedules
naively loses notifications and never finds out.

**The design.**

```ts
const IOS_PENDING_LIMIT = 64;
const RESERVED_SLOTS = 4;   // at-risk warning + headroom
const REMINDER_BUDGET = IOS_PENDING_LIMIT - RESERVED_SLOTS;   // 60
```

On every foreground, on every reminder mutation, and after every `/reminders/sync`:

1. Fetch upcoming reminders, sorted by `dueAt` ascending.
2. Take the first `REMINDER_BUDGET`. **The nearest, never the furthest** — the next hour
   matters more than next month, and the tail is re-topped-up as the head fires.
3. Diff against `state.scheduled`:
   - present locally, absent or completed remotely → **cancel**
   - present remotely, absent locally → **schedule**
   - `dueAt` changed → **cancel then schedule** (never assume replace-in-place)
4. Write the resulting ledger back to `scheduled`.

Every schedule uses a **deterministic identifier**:

```ts
const identifierFor = (reminderId: string) => `roast-reminder:${reminderId}`;
```

so a duplicate schedule replaces rather than stacks, and a full re-sync after reinstall is
idempotent. Expo's `scheduleNotificationAsync` returns its own id; store both — the ledger
maps our key to theirs.

> **Android has no 64-slot cap** but does have doze. Use
> `SchedulableTriggerInputTypes.DATE` triggers and set
> `android.permission.SCHEDULE_EXACT_ALARM` expectations honestly: on Android 12+ exact
> alarms may be deferred by a few minutes under battery optimisation. A reminder that
> fires at 16:03 instead of 16:00 is acceptable; the UI must not promise more.

**Cancellation on logout** is part of `useAuth`'s teardown, not a separate concern:
`Notifications.getAllScheduledNotificationsAsync()` → cancel every identifier prefixed
`roast-`. Leaving them scheduled means the next user of the handset gets a stranger's
guest names on their lock screen.

## 5. Notification categories and tray actions

Registered once at launch, next to `setUpAndroidChannels` in
`components/NotificationsProvider.tsx`:

```ts
await Notifications.setNotificationCategoryAsync('ROAST_REMINDER', [
    {
        identifier: 'MARK_DONE',
        buttonTitle: 'Mark done',
        // iOS: complete without ever showing the app. Android ignores this and
        // launches — see D-8 for the v1 fallback and the v1.1 native receiver.
        options: { opensAppToForeground: false },
    },
    {
        identifier: 'SNOOZE_1H',
        buttonTitle: 'Snooze 1h',
        options: { opensAppToForeground: false },
    },
]);
```

The payload sets `categoryIdentifier: 'ROAST_REMINDER'` (iOS) / `categoryId` on the
content for Android.

**Handling the response** — `hooks/roast-engagement/use-roast-notification-actions.ts`,
mounted next to `useNotificationObserver`:

```
response.actionIdentifier === 'MARK_DONE'
  → optimistically mark complete in the slice
  → enqueue { kind: 'COMPLETE' } in the outbox
  → rebuild the widget snapshot
  → attempt the mutation; on failure the outbox retries on next foreground

response.actionIdentifier === 'SNOOZE_1H'
  → same shape, dueAt = now + 1h, reschedule locally

response.actionIdentifier === DEFAULT_ACTION_IDENTIFIER
  → fall through to useNotificationObserver's routing (ADR-005) — do not navigate here
```

⚠️ **Do not duplicate routing in this hook.** `useNotificationObserver` already handles
cold start vs. background vs. foreground, deduplicates by notification identifier, queues
targets across the auth boundary, and refuses to re-push the screen the user is already
on. Two hooks navigating from the same response is exactly the double-push bug that hook's
header comment documents having already fixed once.

## 6. Deep links

Add to `KNOWN_NOTIFICATION_ROUTES` in `constants/notification-routes.ts` **in the same
commit as the screens**:

```
'/roast-crm/today',
'/roast-crm/reminders',
'/roast-crm/streak',
'/roast-crm/notification-settings',
```

The file's header carries the regeneration command; run it rather than hand-editing, and
note that `'/roast-crm/guests/profile'` and `'/roast-crm/notifications'` are already
present. A route missing from this set fails soft — the user lands on the notification
centre — but that is a real papercut on the highest-traffic tap in the feature.

Params the payloads use (add to the param dictionary in
[`MOBILE_NOTIFICATION_INTEGRATION.md §10`](../MOBILE_NOTIFICATION_INTEGRATION.md)):

| Param | On | Meaning |
|---|---|---|
| `_id` | `/roast-crm/guests/profile` | Guest id — matches what `GuestProfile` already reads via `useLocalSearchParams` |
| `reminderId` | `/roast-crm/guests/profile` | Scrolls to and highlights that reminder (US-2.2) |
| `focus` | `/roast-crm/guests/profile` | `call` \| `note` — which action to bring into reach |
| `milestone` | `/roast-crm/streak` | The milestone number, so the celebration is specific |

## 7. Engagement pings

`hooks/roast-engagement/use-engagement-ping.ts`, mounted in `app/roast-crm/_layout.tsx`:

- **On authenticated foreground** (`AppState` `background|inactive → active`, plus mount)
  when `lastPingLocalDate !== todayLocalDate`.
- **After every qualifying action** — timeline created, reminder completed, stage changed,
  guest captured — with `qualifyingAction` set. These are cheap and idempotent server-side
  (§1.3's unique index), so fire and forget.

```ts
const localDate = dayjs().format('YYYY-MM-DD');            // dayjs is already a dep
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
```

On success: store `lastPingLocalDate`, cache the streak, **cancel today's at-risk local
notification**, and schedule tomorrow's if the streak is live. That cancel is what makes
the 15:00 warning correct for a worker who engaged at 06:00 and then lost signal.

## 8. The at-risk local notification

Scheduled by `use-streak.ts`, identifier `roast-streak-risk:<localDate>`:

- Scheduled for **15:00 local tomorrow** whenever a ping confirms a live streak.
- Cancelled the moment tomorrow's ping lands.
- Never scheduled when `current === 0` — US-4.2's "nothing to lose, no warning".
- Body pulled from the copy registry, with the day count interpolated at schedule time.
  A day count baked in a day early is off by one on the day it fires; schedule it with
  `current + 1`, which is what the streak *will* be.

## 9. Offline behaviour

| Action offline | What happens |
|---|---|
| Create a reminder | Temp id, scheduled locally immediately, queued in the outbox with an `Idempotency-Key` |
| Complete a reminder | Optimistic; local notification cancelled; outbox entry |
| Open Today | Renders `cachedFeed` with a "Last updated {relative}" line — never a blank screen |
| Engagement ping | Queued; the day is still earned on the server when it flushes, because `localDate` travels with the ping rather than being inferred from arrival time |

That last row is the subtle one and the reason `localDate` is a client-supplied field
rather than server-derived: a worker who engages at 22:00 with no signal and reconnects at
07:00 the next morning must be credited for **yesterday**, not today.

## 10. Traps specific to this codebase

- ⚠️ **No reanimated `entering` / `exiting` / `layout` props.** They trigger a native
  `dispatchGetDisplayList` NPE on Android under Fabric in this app. `useAnimatedStyle`
  transforms and opacity are a different subsystem and are safe — use those for the ember,
  the checkbox spring, and list transitions. Gate any LayoutAnimation to iOS if it is
  genuinely needed.
- **Lists use `@shopify/flash-list` v2** with `useInfiniteData` / `useFetchMoreData`, as
  the rest of the app does. The reminders list must not be a `ScrollView`.
- **`refetchOnFocus` needs the RN listeners** wired in `store/rn-listeners.ts` — they are,
  but a new service still has to opt in per-endpoint or per-service.
- **Date/time picking**: `react-native-date-picker` is already a dependency and is the
  better modal experience here; `@react-native-community/datetimepicker` is also present.
  Pick one for the reminder sheet and use it in both create and edit.
- **`GuestProfile` calls `useLocalSearchParams()` conditionally** today
  (`guestProps ?? useLocalSearchParams()`) — a hooks-order violation that happens to work
  because the branch is stable per mount. Adding a reminders card to that component is a
  good moment to fix it rather than build on it.
- **Strict TypeScript** (`noUnusedLocals`, `strictNullChecks`) — and there is no test
  runner or lint script in `package.json`. `yarn format` and the editor's ESLint are the
  only automated gates, so type strictness is doing more work here than usual.

## 11. Testing

There is no test runner configured. Two options, and the first is enough for v1:

1. **Add a minimal `jest` + `@testing-library/react-native` setup** for the three pieces
   whose failure is invisible: the scheduler diff (§4.3), the streak day-boundary helpers,
   and the copy registry's shape selection. These are pure functions; they need no native
   mocking.
2. Manual QA against the matrix in
   [`06_DELIVERY_PLAN.md §5`](./06_DELIVERY_PLAN.md#5-test-plan).

Whichever, the scheduler must be tested. It is the one component where a bug produces
*silence* — no crash, no error, no Sentry event, just notifications that never arrive.
