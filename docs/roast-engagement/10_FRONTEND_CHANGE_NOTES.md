# Frontend change notes — user-defined digest hours

Amends [`00_TECHNICAL_PRD.md §D-4`](./00_TECHNICAL_PRD.md), [`01_ARCHITECTURE.md §6`](./01_ARCHITECTURE.md)
and [`02_BACKEND_SPEC.md §3`](./02_BACKEND_SPEC.md). Backend is merged and deployed ahead
of the mobile work — every change below is additive and the app keeps working untouched.

---

## 1. Two new notification preferences

`GET` and `PATCH /notification-preferences/me` gained two fields:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `morningDigestHour` | integer 0–23 | `8` | Local hour the composed morning digest arrives |
| `eveningDigestHour` | integer 0–23 | `19` | Local hour the evening note prompt arrives |

Hours only — minutes are not stored and not honoured. Use an hour picker, not a time
picker, or you are promising a precision the server does not have.

```http
PATCH /notification-preferences/me
{ "morningDigestHour": 6, "eveningDigestHour": 21 }
```

Out of range returns `400` with `"morningDigestHour must be an hour between 0 and 23."`
Both fields are always present on `GET`, including for accounts whose preference document
predates this change — nothing needs a migration or a null check.

**The evening default moved from 20:00 to 19:00.** Only the default: nobody who has
already set an hour is affected, because until now nobody could.

## 2. Settings screen

Add the two pickers to the notifications settings screen. Two things are worth designing
for rather than discovering in support:

**Changing the hour does not re-send today's digest.** The dedupe receipt is keyed on the
user and the local date, not on the hour. A worker who receives the 08:00 digest and then
moves the setting to 20:00 gets nothing more today, and the new hour takes effect tomorrow.
A worker who moves it *before* their old hour comes round gets it at the new hour today.
Say so in the UI — "takes effect from your next digest" — or it reads as a broken setting.

**Quiet hours silently win.** If the chosen hour falls inside an enabled quiet-hours
window, the inbox row is still written and the bell still updates, but the push is held.
Warn at the point of choosing rather than letting the worker find out by not being
notified: *"Quiet hours are on from 22:00 — a digest at 23:00 won't push."* The server
does not reject the combination, deliberately: rejecting it makes the order in which the
two settings are edited matter, which is worse.

## 3. The at-risk local notification — reschedule required

**This is the one change that is not just a new field.**

The device owns the at-risk warning; the server only covers workers whose devices have all
gone stale. The hours have changed:

| | Before | Now |
|---|---|---|
| At-risk local notification | 15:00 | **16:00 and 19:00** |

On the engagement ping's cancel-then-reschedule pair
([`01_ARCHITECTURE.md §6`](./01_ARCHITECTURE.md)):

- Cancel **both** of today's at-risk local notifications, not one.
- Schedule **both** of tomorrow's, if the streak is live.

A device still running the old single-15:00 schedule will warn at the wrong time and will
leave the server's stale-device fallback as the only correct path. Two passes because the
afternoon one catches the worker who has not engaged all day and the evening one catches
the worker who meant to and did not; the server receipt is keyed on the local date, so
nobody is ever warned twice in a day.

These hours are **not** user-configurable and should not be exposed as a setting. It is a
deadline warning, and a deadline the worker can move the warning away from is not much of
a warning.

## 4. Delivery is on the quarter hour, not the minute

Digests are evaluated by a tick every 15 minutes per timezone bucket, so a digest set to
08:00 arrives between 08:00 and 08:15. Do not write copy that promises an exact minute,
and do not build a countdown against it.

Zones whose offset is not a whole hour (Asia/Kolkata at +5:30, Asia/Kathmandu at +5:45)
are handled — the tick acts on the local turn of the hour, not the UTC one.

## 5. Nothing else moved

- No new endpoints, no changed response shapes, no changed notification `type` values.
- `GET /tasks/today`, `GET /tasks`, reminders, streaks and the inbox are untouched.
- Custom reminders are still delivered by the device from its own schedule and are still
  exempt from every digest hour and quiet-hours rule — the worker asked for those by name,
  at that minute.

## 6. Checklist

- [ ] `morningDigestHour` / `eveningDigestHour` read from `GET /notification-preferences/me`
- [ ] Two hour pickers in notification settings, wired to `PATCH`
- [ ] "Takes effect from your next digest" copy
- [ ] Quiet-hours overlap warning at the point of choosing
- [ ] 400 validation surfaced rather than swallowed
- [ ] At-risk local notification rescheduled to **16:00 and 19:00**
- [ ] Engagement ping cancels **both** at-risk notifications
- [ ] No copy promising an exact delivery minute
