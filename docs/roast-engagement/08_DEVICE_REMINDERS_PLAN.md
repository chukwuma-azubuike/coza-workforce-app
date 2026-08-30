# Roast — Mirroring a reminder onto the device · Implementation plan

**Status: built.** The plan below is kept as written; §7 records what was actually
decided and what changed on the way. Two questions in §3 are still open and are **not**
engineering questions — see D-1 and D-5.

A Roast reminder currently exists in two places: a row on the server, and a local
notification scheduled by `use-reminder-scheduler.ts`. Both are ours, and both are only as
loud as the notification tray allows. The proposal is a third, optional place — **the
phone's own Reminders app, calendar, or alarm clock** — chosen by the worker at the moment
they set the reminder.

The value is specific: a notification is a banner that can be swiped away and never seen
again, whereas an entry in Apple Reminders survives being dismissed, syncs to the worker's
other devices, and shows up in the app they already use to run their day. An alarm is
louder still, and gets through Do Not Disturb.

---

## 1. What the platforms actually allow

This is the constraint that shapes everything else, so it comes first.

| Target | iOS | Android | Expo module |
|---|---|---|---|
| **Reminders app** (a to-do with a due date) | ✅ EventKit `EKReminder` | ❌ no OS-level equivalent | `expo-calendar` — `createReminderAsync` is **iOS-only** |
| **Calendar event** with an alert | ✅ | ✅ | `expo-calendar` — `createEventAsync` with `alarms` |
| **Alarm clock** | ❌ **no API exists at all** | ⚠️ partial | `expo-intent-launcher` → `android.intent.action.SET_ALARM` |
| **Local notification** | ✅ | ✅ | `expo-notifications` — **already built** |

Three consequences fall straight out of that table:

**There is no iOS alarm.** Apple exposes no way to create one, from a third-party app, at
any privilege level. "Set an alarm" cannot be offered on iOS and no amount of work changes
that. The nearest equivalent — and it is a decent one — is a *time-sensitive* reminder in
the Reminders app.

**The Android alarm cannot hold a date.** `ACTION_SET_ALARM` takes `EXTRA_HOUR` and
`EXTRA_MINUTES` and, optionally, `EXTRA_DAYS` as a repeating weekday set. It has no
concept of "the 14th". A one-shot alarm fires at *the next occurrence of that time* — so a
reminder set for Saturday 10:00 on a Wednesday becomes an alarm that goes off on Thursday
morning. Offering the alarm option for anything due more than 24 hours out would therefore
be actively wrong, and the UI has to know that.

**The two platforms are not symmetric and should not pretend to be.** iOS gets Reminders;
Android gets an alarm; both get calendar. Forcing one shared vocabulary onto them produces
a menu where half the entries are greyed out on each platform.

### Neither module was installed

```
expo-calendar        ~15.0.8   ← added
expo-intent-launcher ~13.0.8   ← added
```

Both carry native code. **This feature cannot ship as an `eas update`** — it needs
`yarn prebuild` and a new binary through EAS, on both platforms, before a single line of
it is reachable. That is the single largest scheduling fact in this plan and it should
drive which release train the work targets.

---

## 2. Proposed shape

### 2.1 The choice

Two levels, because the right answer differs per worker and per reminder:

1. **A default**, in Notification settings → a new "Also add to" row. Off by default.
2. **A per-reminder override**, as a compact row at the bottom of the "When" section of
   `ReminderSheet`, pre-set to the default.

Only the second is strictly required, but a worker who wants every reminder in their
Reminders app should not have to say so every time — and one who wants it only
occasionally should not have to visit settings to get it.

The options offered, per platform, with anything inapplicable simply absent rather than
disabled:

| | iOS | Android |
|---|---|---|
| Just the notification *(default)* | ✅ | ✅ |
| Reminders app | ✅ | — |
| Calendar | ✅ | ✅ |
| Alarm | — | ✅ *only when due within 24h* |

### 2.2 One-way mirror, never a sync

**The device copy is a mirror, not a second source of truth.** Roast writes it, Roast
deletes it, and Roast never reads it back.

This is worth stating flatly because the opposite is the intuitive assumption and it is a
trap. If a worker ticks a reminder off in Apple Reminders, nothing should happen in Roast:
polling EventKit for completion means a background read of the user's entire reminders
store on a schedule, it cannot distinguish "done" from "deleted", and it would make the
streak — which is driven by qualifying actions on the server — dependent on a device store
we do not control. The mirror is a nudge. The reminder is the record.

What *does* propagate, in one direction only:

| In Roast | On the device |
|---|---|
| Create | Create the mirror |
| Edit time or note | Delete and re-create *(EventKit ids are not stable across edits in a way worth relying on)* |
| Complete | Delete the mirror |
| Delete | Delete the mirror |
| Sign out | **Delete every mirror** — see §4 |

### 2.3 Where the external ids live

A parallel ledger in the persisted slice, beside `scheduled`:

```ts
export interface IMirrorRecord {
    /** Which store it went to. */
    provider: 'IOS_REMINDERS' | 'CALENDAR' | 'ANDROID_ALARM';
    /** The EventKit / CalendarProvider id. Absent for alarms — see below. */
    externalId?: string;
    /** Needed to delete a calendar event; the id alone is not enough on Android. */
    calendarId?: string;
    /** What it was mirrored *for*, so an edit is detected the same way `contentKey` works. */
    contentKey: string;
}

mirrored: Record<string, IMirrorRecord>;   // keyed by reminder _id
```

Device-local, exactly like `scheduled`, and for the same reason: it describes this
handset's state, not the reminder's. It never goes to the server.

**The alarm is the exception and is fire-and-forget.** `ACTION_SET_ALARM` hands the user
off to the Clock app and returns nothing identifying — there is no id, and no API to
delete an alarm we created. A mirrored alarm therefore cannot be cleaned up on complete,
on delete, or on sign-out. That asymmetry is the strongest argument for treating the alarm
as a separate, later phase (§6).

---

## 3. Decisions needed before any code

| # | Decision | Recommendation |
|---|---|---|
| **D-1** | Does guest data leaving the app sandbox need governance sign-off? | **Yes — ask first.** See §4; this is the real blocker, not the code. |
| **D-2** | Ship the Android alarm at all, given it cannot hold a date and cannot be cleaned up? | **Not in phase one.** Offer it only for same-day reminders, in a later phase, if asked for. |
| **D-3** | Calendar on iOS *as well as* Reminders, or Reminders only? | **Reminders only on iOS.** A follow-up call is a task, not an appointment; putting it on the calendar as a zero-length event clutters the day view. |
| **D-4** | Which Android calendar to write to, given `getDefaultCalendarAsync` is iOS-only? | First calendar where `allowsModifications && isPrimary`; if none, ask once and remember. |
| **D-5** | Are the Play Store calendar-permission declarations acceptable? | Needs confirmation from whoever owns the listing. `READ_CALENDAR`/`WRITE_CALENDAR` are dangerous permissions and prompt a review questionnaire. |

---

## 4. The risk that matters

> **Mirroring moves guest names out of the app's sandbox and into a store the app cannot
> fully clean up.**

`cancelAllRoastNotifications` exists because a schedule left behind on a shared campus
handset puts a stranger's guest names on the next worker's lock screen. That reasoning
applies here with more force, because the mirror does not stay on the handset:

- An iOS reminder in the default list **syncs to iCloud**, and from there to the worker's
  Mac, iPad, and icloud.com. Deleting the Roast install does not delete it.
- A calendar event on a **work Google account** propagates to that organisation's servers
  and may be visible to anyone the calendar is shared with.
- An Android alarm **cannot be deleted by us at all.**

None of this makes the feature wrong — the worker is opting in, on their own device, to
put their own work in their own tools. It does mean:

1. The sign-out teardown must delete every mirror it can, and must run *before* the
   session is cleared, alongside `cancelAllRoastNotifications`.
2. The mirrored text should be **the note plus the guest's first name only** — never a
   phone number, never a full name, never assimilation stage.
3. D-1 is a real question for whoever owns data governance, and it should be asked before
   the first line of code, not after the build is in review.

Secondary risks:

| Risk | Handling |
|---|---|
| Permission denied at the OS prompt | Fall through silently to notification-only. Never block the save; the reminder itself already succeeded. |
| Double-nagging (our notification *and* theirs) | It is opt-in and it is the point. Do not suppress our own notification — it is the one that carries Mark done / Call. |
| Mirror write fails (offline, revoked, no writable calendar) | Best-effort, never surfaced as a save failure. Retry on the next reconcile, like the scheduler does. |
| Worker edits the mirror instead of the reminder | Accepted, and documented in the row's helper text: *"Changes there won't reach Roast."* |

---

## 5. Ticket breakdown

Sized in engineer-days, mobile only. No backend work at all — the server never learns that
a mirror exists.

| Ticket | Work | Est. |
|---|---|---|
| **RE-D1** | Add `expo-calendar`; config plugin with the four usage strings (`NSRemindersFullAccessUsageDescription`, `NSCalendarsFullAccessUsageDescription`, and the pre-iOS-17 pair). Prebuild, dev build on both platforms, confirm the prompts read correctly. | 1 |
| **RE-D2** | `utils/device-mirror.ts` — the provider abstraction: `createMirror`, `deleteMirror`, `availableProviders()`. Pure of React, mirroring how `local-notifications.ts` is structured, so the provider logic is testable without a device. | 2 |
| **RE-D3** | `mirrored` ledger in the roast-engagement slice + selectors + the sign-out teardown hook into `useAuth`. | 1 |
| **RE-D4** | Permission flow: request lazily, on the first mirror the worker actually asks for — never at launch. Denied state remembered so it asks once, not every save. | 1 |
| **RE-D5** | `ReminderSheet` — the "Also add to" row under "When", with per-platform options and the ≤24h rule if D-2 lands. | 1.5 |
| **RE-D6** | The default in Notification settings, persisted with the other Roast prefs. | 0.5 |
| **RE-D7** | Mirror reconcile: create on save, delete on complete/delete, delete-and-recreate on edit. Driven off the same reminder list the scheduler reconciles from, so the two stay in step. | 2 |
| **RE-D8** | *(gated on D-2)* Android alarm via `expo-intent-launcher`, same-day only, with the fire-and-forget caveat in the UI. | 1.5 |
| **RE-D9** | Docs: `07_AS_BUILT.md` §, plus the privacy note in the store listing if D-5 requires it. | 0.5 |

**~10 days without the alarm, ~11.5 with it**, plus one native build cycle on each
platform before any of it can be tested on a device.

## 6. Suggested sequencing

1. **Ask D-1 and D-5 now.** They gate everything and neither is an engineering question.
2. **RE-D1 alone, into the next scheduled build.** Getting the native dependency into a
   binary is the long pole; nothing else can be tested until it lands.
3. **RE-D2 → RE-D4 → RE-D7** — the machinery, behind no UI. Verifiable with a debug button.
4. **RE-D5, RE-D6** — the surface.
5. **RE-D8** last, or never, depending on D-2.

The honest summary: on iOS this is a genuinely good feature and the platform supports it
properly. On Android the calendar half works and the alarm half is a compromise the UI has
to apologise for. Ship the iOS half confidently, the Android calendar alongside it, and
treat the alarm as optional.


---

## 7. As built

Everything in §5 shipped. What the plan left open, and how it was answered:

| Decision | Answer | Where |
|---|---|---|
| **D-1** — governance sign-off for guest names leaving the sandbox | ⚠️ **Still open.** The code is written so the answer can be "no" cheaply: the whole feature is off unless a worker turns it on, and the default is `null`. | — |
| **D-2** — ship the Android alarm | **Yes, inside a 24-hour horizon.** `availableProviders(dueAt)` simply does not return it for anything further out, so the UI cannot offer a date the intent could not honour. | `utils/device-mirror.ts` |
| **D-3** — Calendar on iOS as well as Reminders | **No.** iOS is offered Reminders only. One line in `availableProviders` reverses it. | `utils/device-mirror.ts` |
| **D-4** — which Android calendar | Primary if the device names one, else the first that accepts a write, else `null` and the option quietly fails. | `writableEventCalendarId` |
| **D-5** — Play Store permission declaration | ⚠️ **Still open.** Note that `expo-calendar`'s plugin adds **`READ_CALENDAR` as well as `WRITE_CALENDAR`**, unconditionally. Roast only ever writes; the read permission is the plugin's, not ours, and the declaration has to account for it anyway. | `app.json` |

### Deviations from the plan as written

**The default preference is device-local, not on `IRoastNotificationPrefs`.** The plan put
it in Notification settings without saying where it is stored. It went into the persisted
`roastEngagementState` slice instead: the available providers differ by platform, so a
synced preference would put "Reminders" — an iOS-only concept — onto the same worker's
Android handset, where it means nothing. No backend change was needed for any of this.

**`hideGuestNames` is honoured.** Not in the plan, and it should have been. A calendar
event titled with a guest's name breaks that promise more thoroughly than a notification
does, because it is still there tomorrow and on their laptop. Mirrors made under that
setting are titled "Roast follow-up".

**Mirrors carry a `createdAt`, and the reconcile ignores anything under two minutes old.**
Not foreseen. A mirror is written against the reminder's real id the moment the server
returns it, but the cached reminder list is still holding the *optimistic* row under a
temporary id until the refetch lands — and a reconcile in that window sees a ledger entry
with no matching reminder and correctly concludes the reminder is gone. It would have
deleted the mirror a second after writing it. `MIRROR_SETTLE_MS` closes that window.

**`useReminderMirror` is split in two.** `useMirrorTarget` is the write half and has no
effects, so a screen can call it; `useReminderMirror` adds the reconcile and is mounted
once from `useRoastEngagement`, beside the notification scheduler. Mounting the whole hook
per sheet would have run a reconcile loop for every sheet on screen.

### What still cannot be done, and is not a bug

- **An Android alarm cannot be deleted by us, ever.** `ACTION_SET_ALARM` returns nothing
  identifying and Android exposes no API to list or remove one. It survives completing the
  reminder, deleting it, and signing out. The sheet says so in as many words rather than
  implying a cleanup that will not happen.
- **There is no iOS alarm.** Apple exposes no API at any privilege level.
- **Nothing reads back.** Ticking the item off in Apple Reminders does not complete the
  Roast reminder, by design — see §2.2.

### Release note

⚠️ **This needs a new binary.** Both modules are native, so it cannot reach anyone through
`eas update`. Until a build carrying them is installed, `availableProviders()` still
returns options and the writes will fail — silently and harmlessly, to `null` — so a stale
dev client will show the row and appear to do nothing.
