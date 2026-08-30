# Roast Engagement — As Built

What actually shipped, and every place it differs from documents 00–06.

Those documents were written before the backend existed and before the native targets were
attempted. Most of their reasoning held. The places it did not are recorded here rather
than edited into them, so the original decisions and the reasons they changed both stay
readable.

**Read this alongside [`03_MOBILE_SPEC.md`](./03_MOBILE_SPEC.md) and
[`04_WIDGET_SPEC.md`](./04_WIDGET_SPEC.md), which describe intent. This describes the code.**

---

## 1. Status

Every mobile and native ticket in [`06_DELIVERY_PLAN.md §3`](./06_DELIVERY_PLAN.md) is
complete: `RE-M1`–`RE-M17` and `RE-N1`–`RE-N6`, with the one partial noted in §4 below.

| Phase | Commit     | Contents                                                                        |
| ----- | ---------- | ------------------------------------------------------------------------------- |
| 0–2   | `11b76cb0` | Service, slice, scheduler, reminders, outbox, engagement pings, streak plumbing |
| —     | _(same)_   | Contract alignment against the live API — see §2                                |
| 3     | `0b791629` | Today feed, streak screen, notification settings, tab change, mock deletion     |
| 4     | `8767f413` | Android widget, iOS WidgetKit extension, App Group bridge, completion queue     |
| 4     | `faa7222a` | iOS 16 floor for the widget target; EAS team-id plumbing                        |

## 2. API contract — where the specs were wrong

The backend was built from `02_BACKEND_SPEC.md` and follows it closely, but seven details
differ. Verified against `coza-app-evangeleon`'s swagger and service implementations, not
against the spec. **The server won every disagreement.**

| #   | Documented                                 | Actual                                                   |
| --- | ------------------------------------------ | -------------------------------------------------------- |
| 1   | `ENGAGEMENT_SOURCE.FOREGROUND` / `.ACTION` | `APP_FOREGROUND` / `QUALIFYING_ACTION`                   |
| 2   | `qualifyingAction` with a sibling `refId`  | **nested** `{ kind, refId, at }`                         |
| 3   | `IRoastReminder.guestFirstName`            | **no guest name at all**                                 |
| 4   | `GET /reminders` returns an array          | `{ data, pagination }`                                   |
| 5   | `counts: { due, overdue }`                 | `+ total`; the feed also returns `timezone`, `localDate` |
| 6   | `GET /streaks/me` takes no params          | requires `tz`                                            |
| 7   | `updatedAt` always present                 | optional — only set on mutation                          |

Two of these fail **silently**, which is why they are called out rather than listed:

- **#2.** A flattened `refId` is not rejected. The ping succeeds, the streak day still
  counts, and the qualifying-action history records nothing — which is precisely the data
  `D-1` is accumulating to justify tightening the streak rule in v1.5.
- **#3.** Reminders come back as raw documents with no populate, and the local scheduler
  composes notification bodies from them. Left alone, every scheduled reminder would have
  rendered `undefined` on a lock screen with the app closed.

Also picked up from the implementation, and now encoded in `store/types/roast-engagement.ts`:

- `MAX_SNOOZE_COUNT` is **10**, reachable, and returns a field-level error on `dueAt`.
- Task ids are **composite** (`note:652b…`), not document ids. `reminderId` is separate.
- Only `NOTE` and `PROGRESS` are dismissible — `DISMISSIBLE_TASK_KINDS`.
- A repeated `Idempotency-Key` returns **200**, not 201. A 200 means "already existed".
- `hideGuestNames` **omits** `guestFirstName` rather than blanking it.
- `/reminders/sync` is a mutation, not a query — it writes device state server-side.

### Open ask for the backend

`GET /reminders` and `/reminders/sync` return no guest name, so `useGuestNameIndex` joins
against the cached guest list on device. That works in the app and **cannot work in the
widget**, which runs outside the sandbox with no guest cache.

A denormalised `guestFirstName` on the reminder document, written at create the way
`campusId` already is, removes a client-side join from three surfaces and is the only way a
reminder can render on a home screen. Worth doing before reminders appear in the widget's
item list.

## 3. Mobile deviations

**One route, not two.** The file map lists both a new `(tabs)/today` and a re-pointed
`(tabs)/notifications`. That is two routes to one screen, which is the thing
[ADR-006](./01_ARCHITECTURE.md) argues against. `/roast-crm/notifications` renders the Task
Feed and the tab is labelled "Today"; the path is unchanged so `KNOWN_NOTIFICATION_ROUTES`
and every deep link already in flight keep working.

**Skia confetti, not Lottie.** `05_UX_SPEC.md §6` calls for a Lottie milestone burst. There
is no confetti asset in `assets/json`, and the ember and heatmap have already paid for the
canvas — so the burst is ~26 Skia particles off one shared progress value. One rendering
technology across the feature was worth more than a marginally prettier animation.

**Quiet hours use an hour list, not a time picker.** `quietHoursStart` and `quietHoursEnd`
are integers 0–23 on the wire. A spinner that lets somebody choose 22:30 and stores 22:00
is a control that lies about what it did.

**`celebratedMilestones` was added to the persisted slice.** The server's
`milestoneReached` is non-null only on the single response that crosses the threshold, so a
worker who hits 30 days with the app closed would never see the celebration. Tracking what
has been _shown_ against `milestonesAwarded` is what lets it wait for them.

**`useGuestNameIndex` also carries `phoneNumber`.** A task has a `guestId` and a composed
sentence, never a number. Without it the primary action on a `CALL_DUE` row degrades from
"call this person" to "open the profile and look".

**"Set reminder" lives on `GuestRemindersCard`, not `GuestHeader`** — next to the list it
adds to, rather than in a header that already carries four actions.

**Five tray actions, not two, and two categories rather than one.** `03_MOBILE_SPEC.md`
specifies Mark done and Snooze. Call, WhatsApp and Text were added on top, and they lead:
reaching the guest is why the reminder exists, and it is the one thing with no faster route
than the tray. Because a category is registered once for the whole app and cannot hide a
button per-notification, the three contact actions live in a second category
(`ROAST_REMINDER_CONTACT`) that is only named on reminders whose guest has a number —
otherwise "Call" would be offered for a guest there is no way to call.

⚠️ **Both platforms truncate, and the ordering is the mitigation.** Android renders the
first three actions and drops the rest; iOS shows the first four when expanded. So Snooze
is iOS-and-in-app only, and Mark done is iOS-and-in-app only on a guest with a number. Both
remain on the reminder row, the Today feed and the widget. Re-ordering the array in
`setUpRoastNotificationCategories` is the whole of the change if that trade-off looks wrong.

**The schedule ledger stores a content key, not just `dueAt`.** `IScheduledRecord.contentKey`
covers the note, the guest's first name and their number as well as the time. Diffing on
`dueAt` alone meant the *first* version scheduled was permanent: the guest list resolves
after the reminder list does, so the notification kept the nameless, numberless body it was
first given, and an edited note never reached the OS either. Entries persisted by earlier
builds have no key, mismatch once, and are rescheduled — which is how an existing install
picks up the new buttons.

## 4. Widget deviations

> The widget's **visual** design was reworked after first release — type scale, per-kind
> glyphs, row cards, the streak capsule, a conditional footer, and the note under each row.
> [`09_WIDGET_UI_PLAN.md`](./09_WIDGET_UI_PLAN.md) carries the diagnosis, the design and its
> own as-built. The items below are the structural decisions, which are unchanged.

**The note under each row was in the snapshot from the start and rendered by neither
platform.** `subtitle` was populated by `buildWidgetSnapshot`, redacted correctly under
`hideGuestNames`, and decoded by `Snapshot.swift` — the widget was holding the most
informative string it had and dropping it. Rendering it needed no backend work and no
contract change.

**Medium only.** `systemMedium` / 4x2, per the reduced-scope ladder in
[`04_WIDGET_SPEC.md §9`](./04_WIDGET_SPEC.md). The snapshot still carries six items where
medium shows two, so small and large are a view change, not a data change.

**The iOS widget requires iOS 16, not 15.1.** `AppIntents` does not exist before iOS 16 and
`@bacons/apple-targets` exposes no build-settings escape hatch to weak-link it. Linked as
required against a 15.1 target, dyld cannot load the extension on iOS 15 at all — the
widget never appears, and nothing is logged. The floor moved to where the framework exists.
iOS 15 devices keep the entire app and lose only the widget. The `@available(iOS 17)` gate
and its deep-link fallback still matter, for iOS 16.

**`RE-N2` is half-delivered.** Widget completion runs headless and never opens the app.
Notification **tray** actions on Android still launch it — `D-8`'s accepted deferral.
`react-native-android-widget` ships its own receiver, so there was no single receiver to
build once and share; wiring `expo-notifications` into that path is separate work and stays
in v1.5.

**The iOS timeline can only re-evaluate the items it holds.** `Provider.projected` recomputes
`isOverdue` for the six items in the snapshot. A seventh task tipping overdue is invisible
until the app writes again. The alternative is waking the widget to recount, which is the
exact refresh-budget spend the timeline design exists to avoid.

**No `RoastAppGroup` Info.plist key.** `SnapshotStore.appGroup` derives the group by
stripping `.roastwidget` from the extension's own bundle id, mirroring `roastAppGroupFor()`
in `app.config.js`. One fewer place the staging/production suffix has to be maintained by
hand — and that suffix going stale is what makes a staging widget render production guest
names.

**Completions cross contexts through a plain queue.** An Android headless task and an iOS
App Intent both have no store to dispatch into, so they append to
`utils/widget-completion-queue.ts` (AsyncStorage on Android, the App Group on iOS) and the
app adopts them into the real outbox on next foreground. Both enqueue _before_ attempting
anything, because a completion lost between the tap and the request is the one bug that
teaches a worker the button does not work.

## 5. Build and release

- **`EXPO_APPLE_TEAM_ID` is set on all three EAS profiles.** `.easignore` excludes every
  `.env*` file, so a team id that lives only in `.env.local` reaches a local `prebuild` and
  never reaches an EAS builder.
- **`targets/` and `modules/` are in `fingerprint.config.js`'s `extraSources`.** They are
  compiled into the binary but sit outside the gitignored `android/` and `ios/`. Without
  them a Swift-only change does not move the fingerprint and EAS reuses a cached build —
  which presents as "my widget fix did nothing", with no error anywhere.
- **Widget changes cannot ship via `eas update`.** They are native code in the binary. Plan
  them into a version bump, never a patch channel.
