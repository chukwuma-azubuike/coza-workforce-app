# Roast — User-defined digest hours and the two-pass at-risk warning · Implementation plan

**Status: built.** §9 records what changed on the way. Against [`10_FRONTEND_CHANGE_NOTES.md`](./10_FRONTEND_CHANGE_NOTES.md),
which the backend team merged and deployed ahead of this work.

The change notes describe six client tasks. Five are small. **One is not, and it is not the
one the notes flag as "the one change that is not just a new field"** — the reschedule from
15:00 to 16:00 and 19:00 collides with three existing invariants that the notes could not
have known about, because all three live on this side of the wire.

---

## 1. What the notes ask for, and what it actually costs

| #   | Ask                                  | Where                                                 | Cost                                                          |
| --- | ------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Two new preference fields            | `store/types`, service slice                          | Trivial — additive, always present on `GET`                   |
| 2   | Two hour pickers                     | `NotificationSettings.tsx`                            | Small — `HourPicker` already exists and is already right      |
| 3   | "Takes effect from your next digest" | copy                                                  | Trivial                                                       |
| 4   | Quiet-hours overlap warning          | new pure helper + settings                            | Small, one trap (§4)                                          |
| 5   | Surface the `400`                    | `patch` in settings                                   | Small — `IRoastValidationError` is already defined and unused |
| 6   | **At-risk → 16:00 _and_ 19:00**      | `use-local-date`, `use-streak`, `local-notifications` | **See §2**                                                    |

## 2. The reschedule is four changes, not one

### 2.1 The identifier is keyed by date alone

```ts
// utils/local-notifications.ts:60
export const streakRiskIdentifierFor = (localDate: string): string =>
    `${ROAST_IDENTIFIER_PREFIX}streak-risk:${localDate}`;
```

One notification per local date is baked into the key. Scheduling two would have the
second _replace_ the first — deterministic identifiers are load-bearing here, and this is
the one place that property works against us. The key has to carry the hour.

### 2.2 …which strands every warning already on every installed device — silently

This is the finding that matters most, and it is invisible from the backend side.

All three files are JavaScript, so this ships over the air. Every device that has already
run `syncAtRiskNotification` is holding a pending notification called
`roast-streak-risk:2026-08-30`, scheduled for 15:00. After the update, the app cancels
`roast-streak-risk:2026-08-30@16` and `@19`. **Nothing ever cancels the old one.** It is
not in the new key space, and the ping-cancel path — the mechanism whose entire job is
"the worker already engaged, do not warn them" — looks only at the new keys.

The result is a warning at the old hour, telling a worker who may well have engaged at
07:00 that their streak is about to end, with no code path anywhere that can stop it. It
fires once per upgraded device, and it is exactly the class of bug the change notes are
trying to prevent by asking for the reschedule in the first place.

Fix is three lines: cancel the legacy `streak-risk:<date>` identifier for today and
tomorrow on every sync. `cancelNotification` already swallows a miss, so this is a no-op on
a clean install and stays harmless forever. Cheap enough not to bother date-gating or
removing later.

### 2.3 The pending-notification reserve is now exactly full

```ts
// utils/local-notifications.ts:37
export const RESERVED_SLOTS = 4;
```

Its own comment: _"Four rather than one because the at-risk warning is rescheduled daily,
and a transient overlap between the outgoing and incoming schedule must not be what pushes
the app over the cliff."_

Today the ceiling is 2 pending at-risk notifications (today's + tomorrow's), leaving 2
slots of headroom. Doubling the passes takes the ceiling to **4** — today@16, today@19,
tomorrow@16, tomorrow@19 — consuming the reserve completely and leaving the transient
overlap the comment is about with nowhere to go.

Overflow does not land on the streak warning. It lands on **reminders**, past iOS's cap of
64, where the OS drops them with no error, no rejected promise and nothing in Sentry — the
failure the module header opens by calling _"the worst failure mode in this feature,
because it produces silence rather than a bug report."_

`RESERVED_SLOTS` → `6`. `REMINDER_BUDGET` goes 60 → 58, which costs a worker nothing they
will ever notice.

### 2.4 The same words twice

Both passes would call `ROAST_COPY.streak.atRisk(days)`:

> 🔥 **3 Days on! Keep the fire going**
> You haven't roasted your game today. Check in now to keep your streak.

Identical, three hours apart. The notes are clear that these catch different people — _"the
afternoon one catches the worker who has not engaged all day and the evening one catches
the worker who meant to and did not"_ — and a byte-identical repeat reads as a glitch
rather than a last call. The second pass needs its own voice and its own urgency; it is the
last thing the worker will hear before the streak goes.

## 3. What else moved that the notes do not mention

**`TOGGLES` line 44 is now wrong.** The streak switch is described as _"The afternoon nudge
when your streak is about to end."_ There are two nudges and one of them is not in the
afternoon. Small, but it is a promise on a settings screen.

**D-4's budget goes from three system notifications a day to four.** The at-risk warning
counts once in [`00_TECHNICAL_PRD.md §D-4`](./00_TECHNICAL_PRD.md) and now costs two. That
is a product decision the backend has already taken and shipped; recording it as an
amendment rather than re-opening it, but it should not go un-minuted — D-4 exists because
the opt-out rate is the guardrail, and the ceiling just rose 33%.

## 4. The quiet-hours check has one trap

The warning in `10 §2` needs to know whether a chosen hour falls inside the quiet window.
The obvious predicate is wrong:

```ts
hour >= start && hour < end; // ❌ says 23:00 is outside a 22:00 → 07:00 window
```

Quiet hours **wrap midnight**, and the wrapping case is the common one — a default of
22:00 → 07:00 is what most people set. A helper that gets this backwards warns on exactly
the configurations that do not need it and stays silent on every one that does:

```ts
export const isWithinQuietHours = (hour: number, start: number, end: number): boolean =>
    start === end ? false : start < end ? hour >= start && hour < end : hour >= start || hour < end;
```

`start === end` is an empty window, not a 24-hour one. Pure, no dates, no `dayjs` — worth
its own export because it is a one-line function with three ways to be subtly wrong.

The warning is advisory, per the notes: the server does not reject the combination, so
neither do we. A blocked save would make the _order_ in which the two settings are edited
matter, which is worse than the thing it prevents.

## 5. Ticket breakdown

| Ticket    | Change                                                                                   | Files                                                            |
| --------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **RE-D1** | `morningDigestHour` / `eveningDigestHour` on `IRoastNotificationPrefs`                   | `store/types/roast-engagement.ts`                                |
| **RE-D2** | `STREAK_AT_RISK_HOURS = [16, 19]`; `streakRiskTimeFor(date, hour)`; `isWithinQuietHours` | `hooks/roast-engagement/use-local-date.ts`                       |
| **RE-D3** | Identifier keyed by date **and hour**; legacy cancel; `RESERVED_SLOTS` 4 → 6             | `utils/local-notifications.ts`                                   |
| **RE-D4** | Schedule and cancel **both** passes; sweep the legacy identifier                         | `hooks/roast-engagement/use-streak.ts`                           |
| **RE-D5** | A distinct evening variant of the at-risk copy                                           | `constants/roast-copy.ts`                                        |
| **RE-D6** | Two hour pickers, effect-timing hint, quiet-hours warning, corrected streak toggle copy  | `views/roast-crm/notification-settings/NotificationSettings.tsx` |
| **RE-D7** | Surface the `400` inline rather than swallowing it                                       | same, + `patch`                                                  |
| **RE-D8** | Amend D-4, `01 §6`, `07_AS_BUILT`; README row                                            | docs                                                             |

## 6. Sequencing

RE-D1 → RE-D2 → RE-D3 → RE-D4 first, in that order: they are the correctness half, they
are the half that ships over the air to devices holding a stale schedule, and RE-D4 cannot
compile until RE-D2 and RE-D3 have moved. RE-D5 to RE-D7 are the settings screen and are
independent of each other. RE-D8 last.

## 7. What no automated check will catch

The scheduling half has no test runner in this repo and cannot be seen by `tsc`:

- That the legacy identifier is actually gone from an **upgraded** device — reproducible
  only by running the current build, letting it schedule, then loading the new one.
- That both passes cancel on a ping. A miss here warns a worker who already engaged, which
  is the failure that teaches people to mute the category.
- That the reserve holds. Only visible on an account with enough upcoming reminders to
  approach the cap.

## 8. Open questions

**Q-1 — does an unengaged worker get warned twice, or once?** `10 §3` says two passes catch
two different people, then says _"the server receipt is keyed on the local date, so nobody
is ever warned twice in a day."_ Those pull in opposite directions for the device, which
holds no receipt. Reading taken here: the receipt governs the **server's** stale-device
fallback so it cannot duplicate the device's local warning, and a worker who engages at no
point in the day does hear both passes — otherwise "two passes" describes nothing. Cheap
to get wrong in either direction, so worth one sentence from the backend author before
RE-D4 lands.

**Q-2 — should the two digest hours be validated against each other?** Nothing stops a
worker setting the morning digest to 21:00 and the evening to 06:00. The server accepts it.
Proposed: leave it. The labels are "morning" and "evening" but the fields are just hours,
and a worker on a night shift inverting them is using the feature correctly.

---

## 9. As built

All eight tickets landed. Nothing in §5 was dropped; two things moved.

**`scheduleStreakRisk` takes `isFinalPass`, not the hour, to pick its copy.** The hours
live in `use-local-date.ts` and `utils/local-notifications.ts` is imported _by_ that side
of the tree, so deriving the final pass inside the scheduler would have inverted the
dependency for a boolean. It also keeps the decision honest: the last pass is the last pass
whatever hour it is later moved to.

**The legacy sweep is unconditional, and runs before the early returns.** It has to happen
for a worker whose streak is 0 — who returns before any scheduling — and for one who has
already engaged today. Gating it on either would leave the stale 15:00 warning on exactly
the devices whose owners have done nothing wrong.

**`RESERVED_SLOTS` 4 → 6**, so `REMINDER_BUDGET` is 58. Four is now the _ceiling_ on
pending at-risk notifications rather than a reserve with headroom, and the overflow lands
on reminders, silently, past iOS's cap.

**The evening copy is its own voice**, `ROAST_COPY.streak.atRiskFinal` — _"🔥 Last call — 3
days on the line / Your streak ends at midnight. One check-in is all it takes."_

**On the settings screen**, the two pickers sit under a "When they arrive" card ahead of
quiet hours, so the reader meets the delivery times before the rule that can suppress them.
`HourRow` is extracted and used by all four hour fields — the quiet-hours rows lost their
bespoke markup rather than gaining a second copy of it. `messageFromError` prefers the
server's field-keyed `errors` map over the envelope `message`, which is what makes
`IRoastValidationError` — defined since the original spec and never once used — earn its
place.

The streak toggle's description was wrong the moment RE-D4 landed and now reads _"Two
nudges — afternoon and evening"_.

### Verification

- `npx tsc --noEmit --moduleResolution bundler` — clean across every touched file.
- `npx prettier --check` — clean.
- The repo has no test runner, so the scheduling half has no automated gate at all. §7
  stands: the upgrade sweep, the both-passes cancel and the reserve are device-only.

### Still open

**Q-1 is unanswered and the code takes the stated reading**: a worker who engages at no
point in the day hears both passes. If the backend author meant the device to warn once,
the change is one guard in `syncAtRiskNotification` — not a redesign.
