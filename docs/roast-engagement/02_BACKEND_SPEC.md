# Roast Engagement System — Backend Specification

Implements [`01_ARCHITECTURE.md`](./01_ARCHITECTURE.md). Written against the Roast CRM
API's existing conventions: Mongo-style `_id`, `IDefaultResponse<T>` envelopes
(`{ status, message, data }`), `Bearer` auth, and the `page`/`limit`/`total`/`pages`
pagination shape the client's `useInfiniteData` already reads.

---

## 1. Data models

### 1.1 `guests` — additive changes

```ts
{
  // ... existing fields
  callCadenceDays?: number | null,   // per-guest override; null = never call-nudge
  nextCallDueAt?: Date | null,       // DERIVED. lastContact + effective cadence
  lastNudgedAt?: Date | null,        // last time this guest appeared in any nudge
}
```

`nextCallDueAt` is **stored, not computed at query time** — the Morning Roast job scans
every worker's guests and needs an index, not a per-document calculation.

Effective cadence resolution ([D-5](./00_TECHNICAL_PRD.md#d-5--us-11-has-no-data-model--derive-cadence-from-assimilation-stage)):

```
callCadenceDays  if set (null means "never")
STAGE_DEFAULT_CADENCE[assimilationStage]  otherwise
```

```ts
const STAGE_DEFAULT_CADENCE = {
  INVITED: 2,
  ATTENDED: 4,
  BEING_DISCIPLED: 7,
  ASSIMILATED: null,   // no call nudges — the journey is complete
};
```

Recompute `nextCallDueAt` on: guest create, timeline entry create, assimilation stage
change, cadence override change. **Not** on a nightly sweep — it is a pure function of
three fields, and a sweep would mask a missing write.

> **Migration.** Backfill `nextCallDueAt` for all existing guests from `lastContact` (or
> `createdAt` where `lastContact` is null) before the Morning Roast job is enabled.
> Without the backfill the first digest nudges every worker about every guest at once.

### 1.2 `roast_reminders`

```ts
{
  _id: ObjectId,
  userId: ObjectId,          // owner. Not the guest's assignee — the person who set it
  guestId: ObjectId,
  campusId: ObjectId,        // denormalised for multi-tenant scoping
  note: string,              // ≤ 280 chars
  dueAt: Date,               // UTC instant
  timezone: string,          // IANA, as at creation — for correct display after travel
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED',
  completedAt?: Date | null,
  completedVia?: 'APP' | 'NOTIFICATION' | 'WIDGET',
  snoozedFrom?: Date | null, // the original dueAt, kept so history is honest
  snoozeCount: number,       // guard against infinite deferral
  createdAt: Date,
  updatedAt: Date,
}
```

Indexes: `{ userId: 1, status: 1, dueAt: 1 }` (the sync query),
`{ guestId: 1, dueAt: -1 }` (the guest's own reminder list).

`snoozedFrom` and `snoozeCount` exist because a reminder snoozed eleven times is a signal —
either the task is not real or the worker is stuck — and a UI that silently rewrites `dueAt`
destroys it.

### 1.3 `roast_engagement_days`

One document per user per engaged local date. A set, not a counter.

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  localDate: string,          // 'YYYY-MM-DD' as the DEVICE reckoned it
  timezone: string,           // IANA at the time of the first ping that day
  firstPingAt: Date,          // UTC instant — the 36h travel rule reads this
  lastPingAt: Date,
  qualifyingActions: Array<{  // recorded from day one, unused by v1 arithmetic (D-1)
    kind: 'TIMELINE' | 'REMINDER_COMPLETED' | 'STAGE_CHANGE' | 'GUEST_CAPTURED',
    at: Date,
    refId?: ObjectId,
  }>,
}
```

Unique index `{ userId: 1, localDate: 1 }`. **This index is the double-count guard**
(US-4.1) — not a check in application code, which would race two pings from two handsets.

### 1.4 `roast_streaks`

```ts
{
  _id: ObjectId,
  userId: ObjectId,            // unique
  current: number,
  longest: number,
  lastEngagedLocalDate: string | null,
  lastEngagedAt: Date | null,  // UTC instant of the most recent ping
  freezesBanked: number,       // D-9, v1.5. 0 until then
  freezesSpent: number,
  resetAcknowledgedAt: Date | null,  // gates the gentle reset card (US-4.3)
  milestonesAwarded: number[], // [7, 30] — so a milestone fires once, ever
  timezone: string,            // most recent, for the server-side stale-device fallback
  updatedAt: Date,
}
```

### 1.5 `roast_nudge_receipts`

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  dedupeKey: string,   // unique — see below
  kind: RoastTaskKind,
  sentAt: Date,
  expiresAt: Date,     // TTL index
}
```

Unique index on `{ dedupeKey: 1 }`. Every frequency guard in the source's notification
matrix collapses into a key format ([D-6](./00_TECHNICAL_PRD.md#d-6--frequency-guards--receipts-not-timestamps)):

| Guard | Key | TTL |
|---|---|---|
| One digest per day | `digest:morning:<userId>:<localDate>` | 7d |
| One evening prompt per day | `digest:evening:<userId>:<localDate>` | 7d |
| Once per interaction (note) | `note:<timelineId>` | 30d |
| Once per event (invite) | `invite:<eventId>:<userId>` | 30d |
| Once per change (progress) | `progress:<guestId>:<subStageId>` | 90d |
| Once a day, only if at risk | `streak-risk:<userId>:<localDate>` | 7d |
| Per milestone, ever | `milestone:<userId>:<n>` | none |

The insert is the guard: attempt it first, and treat a duplicate-key error as "already
sent, do nothing". A read-then-write check races the job's own retry.

### 1.6 `roast_notification_prefs`

Only if `INFRA-1` is not extensible in time. **Prefer extending the Workforce preference
model with Roast categories** — one preferences screen, one quiet-hours implementation.

```ts
{
  userId: ObjectId,
  callDue: boolean,          // default true
  followUp: boolean,         // default true
  invite: boolean,           // default true
  note: boolean,             // default true
  progress: boolean,         // default true
  reminders: boolean,        // default true — always-on in practice; see below
  streak: boolean,           // default true
  hideGuestNames: boolean,   // default false (D-10)
  followUpThresholdDays: number,  // default 5 (US-1.2's configurable N)
}
```

`reminders` is togglable in the model but **not exposed in v1's UI**: a custom reminder is
something the worker explicitly asked for at a named minute, and a global switch that
silently swallows it is a bug report waiting to happen. Deleting the reminder is the
disable action.

### 1.7 `roast_device_sync`

Supports the v1.1 stale-device fallback and nothing else.

```ts
{
  userId: ObjectId,
  deviceId: string,               // same value NotificationsProvider registers
  lastSyncAt: Date,
  scheduledThroughAt: Date | null, // furthest-future reminder this device has scheduled
  platform: 'ios' | 'android',
}
```

## 2. API surface

All routes are on the Roast CRM API, `Bearer`-authenticated, and return
`IDefaultResponse<T>`.

### 2.1 Task feed

```
GET  /tasks/today?tz=Africa/Lagos&horizonHours=24
     → { tasks: RoastTask[], counts: { due, overdue }, generatedAt }
GET  /tasks?from=&to=&kind=&page=&limit=
POST /tasks/:id/dismiss        // NOTE and PROGRESS only — US-1.4/1.5 dismissal
```

`/tasks/today` is the hot path: the Today screen, the widget snapshot, and the digest
composer all read it. It must be a single indexed query per kind, unioned — not five
round trips — and it must be **cheap enough to call on every app foreground**.

Response ordering is fixed server-side: `isOverdue desc, dueAt asc, kind` (kind as a
stable tiebreak so two surfaces never disagree on the "next action").

### 2.2 Reminders

```
POST   /reminders                 { guestId, dueAt, note, timezone }
GET    /reminders?status=UPCOMING&page=&limit=
GET    /reminders?guestId=<id>    // both statuses, for the guest profile
PATCH  /reminders/:id             { dueAt?, note? }
PATCH  /reminders/:id/complete    { completedVia }
PATCH  /reminders/:id/snooze      { dueAt }         // increments snoozeCount
DELETE /reminders/:id
GET    /reminders/sync?since=<ISO>&deviceId=<id>
```

**`POST` validation** — `dueAt` must be in the future *in the client's timezone*, with a
60-second grace for clock skew and round-trip latency. Reject with a field-level error the
client can render inline (US-2.1's "blocked with a clear inline message"), not a bare 400:

```json
{ "status": false, "message": "That time has already passed.",
  "errors": { "dueAt": "Pick a time later than now." } }
```

**`/reminders/sync`** is the client's scheduler input: everything created, updated,
completed or deleted since `since`, so the device can reconcile its local schedules with
one call. It also records `lastSyncAt` and `scheduledThroughAt` against `deviceId`. It
returns **tombstones** for deletions — a client that only receives live rows can never
learn to cancel a cancelled reminder's local notification.

```
{ upserts: Reminder[], tombstones: string[], serverTime: ISO }
```

**Idempotency on create.** Accept an `Idempotency-Key` header (the client's temp id).
A reminder created offline and flushed twice must not become two reminders.

### 2.3 Engagement & streaks

```
POST /engagement/ping     { localDate, timezone, source, qualifyingAction? }
     → { current, longest, isAtRisk, freezesBanked, wasReset, milestoneReached? }
GET  /streaks/me          → same shape + calendar
GET  /streaks/me/history?months=3
     → { days: Array<{ localDate, engaged: boolean, actions: number }> }
POST /streaks/me/acknowledge-reset
```

`POST /engagement/ping` is called on every authenticated foreground and after every
qualifying action. It is idempotent by construction (§1.3's unique index) and returns the
whole streak state so the caller never needs a follow-up `GET` — the same economy
`markNotificationsRead` already uses in the Workforce inbox, which returns the fresh
unread count rather than making the client re-fetch it.

`wasReset` drives the gentle reset acknowledgment (US-4.3). It stays `true` until
`/acknowledge-reset` is called, so a reset that happens while the app is closed is still
shown on next open.

### 2.4 Preferences

```
GET   /notification-preferences/me
PATCH /notification-preferences/me
```

Proxy to the Workforce preference service where possible; own the storage only if §1.6's
fallback applies.

### 2.5 Internal producer (Roast → Notification Service)

Not public. Service-to-service, signed, idempotent on `dedupeKey`.

```
POST /internal/notifications
{
  userId, category, priority, title, body,
  data: { type, url, content, dedupeKey },
  channelId,          // Android channel — see §6
  collapseId,         // replaces a prior notification of the same key in the tray
  badge               // recipient's fresh unread count
}
```

## 3. Scheduled jobs

All jobs are **timezone-bucketed**: users are grouped by their most recent IANA timezone
and the job runs once per bucket at that bucket's local hour. A single global 08:00 UTC
run would reach Lagos at 09:00 and Los Angeles at midnight.

| Job | Cadence | Does |
|---|---|---|
| `refreshTaskFeed` | hourly, per tz bucket | Recomputes `CALL_DUE` / `FOLLOW_UP` / `INVITE` / `PROGRESS` rows |
| `morningRoast` | 08:00 local | Composes and emits the digest (§4.1) |
| `eveningNotePrompt` | 20:00 local | Emits the note prompt for today's un-noted interactions |
| `streakRollover` | 00:15 local | Applies breaks and grace-day spends for yesterday (§5.3) |
| `staleDeviceReminders` | every 15 min | v1.1 — fallback push for reminders no device will fire (§4.4) |
| `atRiskSweep` | 15:00 local | v1.1 — at-risk push for users whose devices are stale |

> **Idempotency.** Every job asserts its receipt (§1.5) *before* it emits. A job re-run
> after a partial failure must be free. This is not optional: cron systems retry, and a
> duplicated 08:00 digest is the most visible failure this system can produce.

## 4. Digest composition

### 4.1 The Morning Roast

```
tasks := taskFeed(user, kinds=[CALL_DUE, FOLLOW_UP, INVITE, PROGRESS], dueBefore=endOfLocalDay)
tasks := filter(tasks, by user preferences)
if tasks is empty              → emit nothing (never "you have nothing to do")
if user has no assigned guests → emit nothing (PRD §3 suppression rule)
```

Copy is chosen by shape, not by concatenation:

| Shape | Title | Body |
|---|---|---|
| 1 task, `CALL_DUE` | `Emeka is due for a call today` | `He's been waiting to hear from you.` |
| 1 task, `FOLLOW_UP` | `Emeka needs a follow-up` | `5 days since you last spoke.` |
| 2–3 tasks | `3 guests need you today` | `Emeka, Ada and Tunde — tap to see what's due.` |
| 4+ tasks | `5 guests need you today` | `2 overdue. Start with Emeka.` |
| `hideGuestNames` on | `3 guests need you today` | `Tap to see what's due.` |

Deep link: `/roast-crm/notifications` (the Today feed) for multi-task digests;
`/roast-crm/guests/profile` with `{ _id }` for a single task, so a one-task digest lands
where the action is rather than on a list of one.

> Pronoun note: the source's example copy uses "he's" for Emeka. Guests carry `gender`, so
> the single-task variants can be gendered correctly — and must fall back to a neutral
> phrasing ("They've been waiting to hear from you") when `gender` is absent rather than
> guessing from the name.

### 4.2 The evening note prompt

Timelines created today by this user with an empty `notes`, excluding any with a
`note:<timelineId>` receipt. One notification; deep link to the interaction with the note
field focused.

### 4.3 The at-risk warning — server side

The device owns this (ADR-003 rationale, [`01_ARCHITECTURE.md §6`](./01_ARCHITECTURE.md#6-sequence--the-streak-day-boundary)).
The server only emits it for users whose `roast_device_sync.lastSyncAt` is older than 36
hours — i.e. nobody's device is going to fire it — and only when a streak is live and today
is unengaged.

Copy is fixed by the source and should live in a copy registry, not a template literal:

> **🔥 {n} Days on! Keep the fire going**
> You haven't roasted your game today. Check in now to keep your streak.

### 4.4 Fallback push for stale devices

v1.1. A reminder is eligible when `dueAt` is within the next 15 minutes and **no**
`roast_device_sync` row for that user has `scheduledThroughAt >= dueAt` and
`lastSyncAt` within 7 days. Emit with `collapseId = reminder:<id>` so that if a device
does fire locally, the tray shows one notification rather than two.

## 5. Streak engine

### 5.1 Ping

```
day := upsert(roast_engagement_days, { userId, localDate })   // unique index
if day was newly created:
    recomputeStreak(userId)
else:
    append qualifyingAction; return current state unchanged
```

### 5.2 Recompute

```
prev := streak.lastEngagedLocalDate
if prev is null                       → current = 1
else if localDate == prev             → unchanged            (US-4.1, no double count)
else if isNextLocalDay(prev, localDate) → current += 1
else if withinTravelGrace(streak.lastEngagedAt, now)  → current += 1     // D-2
else if freezesBanked > 0 and gap == 2 days           → current += 1; spend a freeze  // D-9
else                                  → current = 1; wasReset = true

longest = max(longest, current)
award milestone if current in [7, 30, 100] and not in milestonesAwarded
```

`withinTravelGrace(a, b) := (b - a) <= 36 hours`. The clause only ever *saves* a streak,
never breaks one early, so a bug in it is a generosity, not a loss.

### 5.3 Rollover

The nightly `streakRollover` job exists because a break is the absence of an event, and
absences do not trigger code. At 00:15 in each timezone bucket: for every user whose
`lastEngagedLocalDate` is more than one day behind yesterday, apply a freeze if one is
banked, otherwise set `current = 0` and leave `longest` untouched.

`current = 0`, not `1` — US-4.3 says the worker "starts fresh at day 1 on my **next**
engagement". Zero is an honest reading of "you are not on a streak right now".

### 5.4 Freezes (v1.5)

Earn one per 10 consecutive engaged days, cap 2 banked. Spent automatically by §5.2/§5.3.
Every spend emits a notification — a silent save reads as a bug and teaches nobody that
the mechanic exists.

## 6. Notification catalog

Register these with the Notification Service. Categories are new; the channel is new.

| # | `type` | Category | Priority | Channel | `url` | Params |
|---|---|---|---|---|---|---|
| 1 | `ROAST_DIGEST_MORNING` | `ROAST_ENGAGEMENT` | `NORMAL` | `roast-nudges` | `/roast-crm/notifications` | — |
| 2 | `ROAST_DIGEST_EVENING` | `ROAST_ENGAGEMENT` | `LOW` | `roast-nudges` | `/roast-crm/guests/profile` | `_id` |
| 3 | `ROAST_GUEST_DUE` | `ROAST_ENGAGEMENT` | `NORMAL` | `roast-nudges` | `/roast-crm/guests/profile` | `_id`, `focus=call` |
| 4 | `ROAST_REMINDER_DUE` | `ROAST_REMINDER` | `HIGH` | `roast-reminders` | `/roast-crm/guests/profile` | `_id`, `reminderId` |
| 5 | `ROAST_STREAK_AT_RISK` | `ROAST_STREAK` | `NORMAL` | `roast-streak` | `/roast-crm/streak` | — |
| 6 | `ROAST_STREAK_MILESTONE` | `ROAST_STREAK` | `LOW` | `roast-streak` | `/roast-crm/streak` | `milestone` |
| 7 | `ROAST_STREAK_SAVED` | `ROAST_STREAK` | `LOW` | `roast-streak` | `/roast-crm/streak` | — |

Three Android channels, not one — the split is the point, per the reasoning already in
`constants/notification-channels.ts`:

| Channel id | Name | Importance | Why separate |
|---|---|---|---|
| `roast-reminders` | Guest reminders | `HIGH` | The worker set these themselves; they must survive muting the nudges |
| `roast-nudges` | Roast nudges | `DEFAULT` | The digest — the one most likely to be lowered, and that must be possible without losing reminders |
| `roast-streak` | Streaks | `LOW` | Delightful, never important. Anyone should be able to silence it alone |

⚠️ Android freezes a channel's importance at creation and the client creates channels on
every launch (`setUpAndroidChannels`). These ids and importances are **one-shot decisions**
per install. Get them right before the first build ships.

## 7. Performance & scale

- `/tasks/today` is called on every foreground by every worker. Budget **< 150ms p95**.
  Compound indexes: `{ assignedToId: 1, nextCallDueAt: 1 }` and
  `{ assignedToId: 1, lastContact: 1 }`.
- The Morning Roast fans out over every worker in a timezone bucket. Batch in chunks,
  emit to the Notification Service in bulk, and make the whole job resumable from its
  receipts — a job that cannot resume will either skip workers or double-send them.
- `roast_engagement_days` grows one document per user per active day. At 5,000 workers ×
  365 days that is ~1.8M documents a year — trivial, but index it on
  `{ userId: 1, localDate: -1 }` for the heatmap query and do not scan it for the streak.

## 8. Observability

Per notification type: emitted, suppressed (and why: preference / quiet hours / receipt /
no-guests), delivered, opened, action-taken. Per job: duration, users processed, emit
count, failures.

Two alerts worth having on day one: **`morningRoast` emit count deviating >30% from the
7-day median** (a broken query silently nudging everyone or no-one), and **duplicate-key
rate on `roast_nudge_receipts` trending up** (a job retrying more than it should).
