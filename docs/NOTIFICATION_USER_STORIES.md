# COZA Global Attendance — Notification System User Stories

> Product specification for a unified, role-aware, multi-channel notification system.
> Scope: every role, department, and entity in the platform. Written from the user's
> perspective, grounded in the existing codebase (Expo push, SendGrid email, cron jobs,
> the `Notification` model, the report review pipeline, tickets, permissions, scoring,
> services, CGWC, sister churches, audit logs, worker-status computation, and multi-tenancy).
>
> **Verified against `cozapp_v3`.** Every ⚙️ (shipped) and every gap in §18 is anchored to a
> file and line. §3 is the experience bar — read it before writing or reviewing any story.
> The mobile-side contract lives in `MOBILE_NOTIFICATION_INTEGRATION.md`.

## 0. What changed in this revision

The first version of this document was written against a snapshot of the codebase. Since then
the platform has grown — a real report state machine with headless-department handling, audit
logging across 21 controllers, worker-status computation, GSP dashboard and group/workforce
endpoints — and parts of the notification system itself have shipped. This revision re-verifies
every claim against the code.

**Now shipped (was listed as missing):**
- `PATCH /notification/read-all/:userId` and `GET /notification/unread-count/:userId`.
- `verifyToken` on all four inbox routes.
- `markNotificationAsRead` matches broadcast rows (though see 18.2 — the fix introduced a worse problem).
- Audit logging across the platform, including notification broadcasts and every report transition.

**Now known to be less implemented than claimed:**
- CGWC instant messages are stored but **never pushed**.
- Campus tickets and both contest flows are **email-only** — no push, no inbox row.
- `sendClockOutSummaryPN` is dead code.
- The report pipeline emits **no notifications at all** — `transitionReport` audits and returns.

**Newly documented:**
- §3 — the experience standards every notification must meet (interruption budget, voice, anti-fatigue, trust, metrics).
- Headless departments, `awaitingRole`, and the polymorphic `reportId`+`reportType` pairing throughout §8 and §19.
- The **real** wire contract — `data.url` + `data.content._id`, which shipped long ago and which §19.1 now builds on instead of proposing a `deepLink` scheme that never existed.
- Gaps 18.3 (unauthenticated send endpoints, inbox ownership), 18.10 (payload constants, dropped images), 18.11 (unused receipts, stubbed `DeviceNotRegistered`), 18.16 (no indexes, no retention), plus INFRA-12/13 and REP-10, ADM-6.

---

## 1. How to read this document

Each user story follows a consistent shape:

- **ID** — `EPIC-N` for traceability.
- **Story** — `As a <persona>, I want <capability>, so that <benefit>.`
- **Trigger** — the system event/state-change that fires it (mapped to real code where it exists).
- **Channels** — Push (Expo) · In-app (`Notification` model) · Email (SendGrid) · SMS (Termii) · Digest.
- **Priority** — P0 (must-have / safety / compliance), P1 (high value), P2 (nice-to-have).
- **Acceptance Criteria (AC)** — testable conditions.
- **Deep link** — where tapping the notification lands the user.

Channel legend used in tables: 🔔 Push · 📥 In-app · ✉️ Email · 📱 SMS · 📊 Digest.

⚙️ marks an event with **some** implementation today. It never means "done" — §18 lists what
each shipped path is still missing. 📱 SMS is aspirational: there is no SMS provider wired up.

**Reality check on channels.** Push and email are today two disconnected pipelines. Push writes
an inbox row (only on success — §18.1); email writes nothing. Every story below assumes the
INFRA-3 persistence fix lands first: **one notification record per event per recipient, written
before any delivery is attempted**, with push and email as fan-out from it. Without that
foundation the stories are unbuildable as written.

---

## 2. Personas (every role + special actors)

| Persona | Role code(s) | Scope | Primary notification interest |
|---|---|---|---|
| **Worker** | `WORKER_ROLE` | Self (1 primary + secondary depts) | Own attendance, permissions, tickets, scores, services |
| **HOD / AHOD** | `HOD_ROLE`, `AHOD_ROLE` | Own department | Team attendance, permission approvals, report drafting/submission, team tickets |
| **Group Head (GH)** | `GROUP_HEAD_ROLE` | A group of departments | Report review queue, group attendance health, group tickets/permissions |
| **Campus Pastor (CP)** | `CAMPUS_PASTOR_ROLE` | One campus | Campus report approvals, dormant-worker alerts, campus KPIs |
| **Campus Coordinator** | `CAMPUS_COORDINATOR_ROLE` | One campus (ops) | Operational alerts, service readiness, attendance anomalies |
| **QC / M&E Officer** | `QC_ROLE` | Cross-department (audit) | Ticket lifecycle, contests, data-quality/compliance flags |
| **GSP (Global Senior Pastor)** | `GSP_ROLE` | Global | Final report approvals, org-wide rollups |
| **Super Admin** | `SUPER_ADMIN_ROLE` | System | Excluded from broadcasts; system/critical alerts only |
| **Global Admin** | `GLOBAL_ADMIN_ROLE` | System / tenants | User/role/tenant operations, bulk-action outcomes, system health |
| **Delegate** | (CGWC participant) | CGWC event | Registration, session reminders, scoring, certificates |
| **Sister Church Worker** | `SisterChurchWorker` | Partner church | Sister-service schedules, attendance confirmations |

> **Constraint from code:** `SUPER_ADMIN` is explicitly excluded from general broadcasts
> (`notificationController.js`). `groupId` is only meaningful for `GROUP_HEAD_ROLE`. HOD/AHOD
> actions are department-scoped; GH is group-scoped; CP is campus-scoped; GSP is global.

---

## 3. Experience standards (the bar every notification must clear)

A notification is an interruption the user did not ask for. It earns its place only if it is
**timely, true, specific, and actionable**. These standards are acceptance criteria for every
story in §6–§17 — a story that satisfies its own ACs but violates this section is not done.

### 3.1 The five questions every notification must answer

Before shipping any notification type, answer all five. If any answer is weak, the notification
should be a digest entry or nothing at all.

1. **What happened?** — a specific event, not a category. "Chidi Okeke requested permission for Sun 24 Aug" beats "You have a new permission request".
2. **Why am I getting this?** — the recipient's relationship to the event must be obvious from the copy (your department, your report, your ticket).
3. **What do I do?** — one primary action, named. If there is nothing to do, it is informational and must not interrupt.
4. **What if I ignore it?** — if the answer is "nothing", it should not be a push.
5. **How do I stop it?** — every non-safety category is togglable (INFRA-1).

### 3.2 Anatomy

| Element | Rule |
|---|---|
| **Title** | ≤ 40 chars. Names the event **and** its object. Never bare exclamations — today's `"Clock In!"`, `"Ticket Issued!"` are placeholders to be replaced. |
| **Body** | ≤ 120 chars, readable in a collapsed tray row. Leads with the specific fact, not a greeting. |
| **Name use** | Address the recipient by first name at most once, in body, never in title. |
| **Numbers** | Always concrete: "8 of 14 clocked in", never "some of your team". |
| **Time** | Relative for the near term ("in 20 minutes"), absolute past two days ("Sun 24 Aug, 8:30am"). |
| **Action** | A verb the recipient controls: Review · Approve · Clock in · Contest · Resubmit. |
| **Target** | Lands on the actionable state, with the primary action already on screen (§19). |

### 3.3 Voice

COZA's existing copy is warm ("We celebrate you!") and that voice should stay — but warmth must
not displace information, and it must not be used to soften consequences.

- **Warmth, then substance.** Celebration belongs in outcomes ("Report approved — well done"), not in problems.
- **Never celebratory about a sanction.** `"you've just been issued a ticket. We celebrate you."` reads as sarcasm to someone being disciplined. Disciplinary copy is neutral, factual, and states the recourse: what, why, by when, how to contest.
- **No blame in reminders.** A clock-in reminder is a service, not a warning.
- **Say the real thing.** No "an event occurred", no "click here", no notification whose body only repeats the title.
- **One language register across channels.** The same event should not be cheerful in push and bureaucratic in email.

**Every string shipping today, rewritten to the standard.** These are the actual `title` /
`body` values in `config/pushNotifications.js`. Use this table as the acceptance target for the
copy-registry work (INFRA-13).

| Type | Today | Should be |
|---|---|---|
| `CLOCK_IN` | *Clock In!* — "…it's time to clock-in! Running late?, submit a permission request now." | *Clock-in open — Sunday 1st Service* — "Clock-in closes at 8:20am. Running late? Request permission." |
| `CLOCK_OUT` | *Clock Out!* — "…it's time to clock-out." | *Don't forget to clock out* — "Sunday 1st Service ended. Clock out to complete today's record." |
| `CLOCK_IN_SUMMARY` | *Clock In Summary!* — "…N workers in your department have clocked in for today's service." | *Ushery Board: 9 of 14 clocked in* — "5 workers haven't clocked in for Sunday 1st Service." |
| `CLOCK_OUT_SUMMARY` | *Clock Out Summary!* — "…see summary of your team's attendance today." | *Ushery Board attendance is complete* — "12 on time, 2 late, 0 absent for Sunday 1st Service." |
| `SERVICE_REPORT` | *Service Report!* — "…send in your report, submit immediately" | *Attendance Report due for Sunday 1st Service* — "Ushery Board's report is due by 6pm today." |
| `PERMISSION_CREATED` | *Permission Request* — "…your permission has been submitted and sent to your HOD for review. We celebrate you!" | *Permission request sent* — "With your HOD for review. You'll hear back before Sun 24 Aug." |
| `PERMISSION_SUBMITTED` | *Permission Request* — "…just submitted a permission request." | *Chidi Okeke requested permission* — "Sun 24 Aug, Ushery Board. Tap to approve or decline." |
| `PERMISSION_STATUS` | *Permission Approved* — "…your permission request has been approved!" | *Permission approved — Sun 24 Aug* — "Approved by Pst. Ada Nwosu. You're excused from Sunday 1st Service." |
| `INDIVIDUAL_TICKET_ISSUED` | *Ticket Issued!* — "…you've just been issued a ticket. We celebrate you." | *A ticket was issued to you* — "Lateness, Sun 17 Aug. You can contest it until Sun 24 Aug." |
| `DEPARTMENT_TICKET_ISSUED` | *Ticket Issued!* — "…your department has just been issued a ticket. We celebrate you." | *Ushery Board received a ticket* — "Incomplete report, Sun 17 Aug. Contest closes Sun 24 Aug." |
| `NOTIFY_PASTOR_TICKET_ISSUED` | *Ticket Issued!* — "Celebrate you! &lt;name&gt; has just been issued a ticket." | *Ticket issued — Chidi Okeke* — "Lateness, Ushery Board, Sun 17 Aug. For your oversight." |
| `NOTIFY_QC_TICKET_ISSUED` | *Ticket Issued!* — "QC/M&E, kindly go to COZA Worker's app to view ticket issued" | *New ticket to review* — "Chidi Okeke, lateness, Ushery Board, Sun 17 Aug." |
| `RETRACT_TICKET_ISSUED` | *Ticket Retracted!* — "…a ticket issued to you has been retracted. We celebrate you." | *Your ticket was withdrawn* — "The lateness ticket for Sun 17 Aug no longer stands. Your record is clear." |
| `NOTIFY_QC_RETRACTED_TICKET_ISSUED` | *Ticket Retracted!* — "QC/M&E, kindly go to COZA Worker's app to view retracted tickets" | *Ticket retracted — Chidi Okeke* — "Lateness, Sun 17 Aug, withdrawn by Pst. Ada Nwosu." |

Three patterns to carry into every new type: **the title names the object**, **the body carries
the fact and the deadline**, and **nobody is told to "go to the app"** — they are already in it
when they tap.

### 3.4 Interruption budget

Every recipient has a daily budget. Spend it deliberately.

| Tier | Definition | Delivery |
|---|---|---|
| **P0 — Act now** | Time-boxed action with a real deadline, or a safety/security event | Push + inbox, sound, bypasses quiet hours (safety only) |
| **P1 — Should know** | Something changed that affects the user's work today | Push + inbox, no sound, quiet-hours deferred |
| **P2 — Ambient** | Useful context, no action | Inbox only, rolled into a digest |

Ceilings, enforced by the pipeline:
- **≤ 5 pushes per user per day** for P1/P2 combined; overflow collapses into one digest.
- **≤ 1 push per event per recipient**, ever (INFRA-5 dedupe key). Recurring crons update a live notification instead of stacking new ones.
- **No push between 21:00 and 06:00** campus-local except P0 safety (INFRA-2).
- **Leaders get rollups, not per-worker events.** An HOD of 40 never receives 40 clock-in notifications.

### 3.5 Anti-fatigue

- **Escalate, don't repeat.** A second reminder for the same item must add information (time remaining, who else is blocked) or go to a different person. Identical repeats train users to dismiss.
- **Suppress on satisfaction.** The moment the user clocks in, submits, or approves, every pending reminder for that item is cancelled — including one already queued.
- **Batch by nature.** Score updates, rank changes, and summaries are digest-native; they should never arrive individually.
- **Silence is a feature.** A quiet week means the system had nothing worth saying. Do not manufacture engagement.

### 3.6 Trust & safety

- **Never a secret in a payload or a link.** OTPs for verification, reset, and deletion travel only over their own channel, and the notification points at the flow, not the code.
- **No sensitive detail in a lock-screen preview.** Disciplinary, welfare, child-safety, and status-change notifications name the object, not the substance ("A ticket was issued to you" — not the offence).
- **Correct recipients, always.** Recipient queries are scoped by department, group, campus, and tenant (INFRA-8). A notification delivered to the wrong leader is a data breach, not a bug.
- **Never announce a sanction to peers.** Disciplinary events go to the subject and their oversight chain only.
- **Say when it is automated.** Cron-driven items say so, so no one thinks a person is watching them.

### 3.7 Failure is part of the UX

- The user must be able to find, in the app, anything the system tried to tell them — **regardless of whether push or email succeeded** (INFRA-3).
- Push permission denied, no device registered, invalid token: the inbox still receives everything, and the app explains once what is being missed.
- If a deep target is gone or the user lost access, land on the nearest permitted parent with a one-line explanation — never a blank screen, never a raw error.
- No user-facing notification for an internal failure. Delivery failures go to Global Admin observability (INFRA-7), not to the person who was supposed to be notified.

### 3.8 Measuring it

A notification system is judged on outcomes, not sends.

| Metric | Target | Why |
|---|---|---|
| Tap-through per type | ≥ 25% for P0 | Below that, the type is noise or badly targeted |
| Time-to-action after an approval notification | ↓ over time | The point of the notification |
| Report on-time submission rate | ↑ after REP-6 | Proves the reminder works |
| Per-category opt-out rate | ≤ 10% | Above that, the category is over-firing |
| Push delivery success | ≥ 98% | Token hygiene (INFRA-11) |
| Inbox rows without a matching delivery attempt | trends to 0 | Persistence health (INFRA-3) |

Every type ships with its metric defined; a type that misses its target for two consecutive
months is re-scoped, downgraded to digest, or retired.

---

## 4. Notification event catalog (master map)

The catalog below is the single source of truth for *what can fire*. User stories in
§6–§17 expand each with personas, ACs, and deep links.

**Legend:** ⚙️ = a code path exists today · ⚠️ = a code path exists but is broken, disabled, or
misleading · *(no mark)* = specified, not built. The complete set of push types actually
emitted today is 15, all defined in `config/pushNotifications.js` plus the two
`notificationController` endpoints — everything else in this table is aspiration.

| Domain | Event | Default recipients | Channels | Note |
|---|---|---|---|---|
| Attendance | Clock-in window opening ⚙️ | Worker | 🔔📥 | *cron re-fires every 10 min across the window — needs dedupe* |
| Attendance | Clock-out reminder ⚙️ | Worker | 🔔📥 | |
| Attendance | Clock-in confirmed / status (on-time/late) | Worker | 📥 | |
| Attendance | Team clock-in summary ⚙️ | HOD/AHOD | 🔔📥 | |
| Attendance | Team clock-out summary ⚠️ | HOD/AHOD | 🔔📥 | *`sendClockOutSummaryPN` is defined but its only call site is commented out (`cron-services.js:205`) — dead code* |
| Attendance | Marked absent ⚠️ | Worker, HOD | 🔔📥 | *`markAbsentUsersJob` writes the absence and notifies no one* |
| Attendance | Geofence/QR clock-in failure | Worker | 📥 | |
| Permissions | Request submitted ⚙️ | Requester + approver (dept HOD/AHOD; Campus Pastors when the requester is HOD/AHOD) | 🔔✉️📥 | |
| Permissions | Approved / rejected ⚙️ | Requester | 🔔✉️📥 | |
| Permissions | Pending-approval reminder (SLA) | Approver | 🔔📥 | |
| Permissions | Permission expiring / expired | Requester | 📥 | |
| Reports | HOD/AHOD submitted → GH | GH | 🔔📥 | |
| Reports | GH approved → CP | CP | 🔔📥 | |
| Reports | CP approved → GSP | GSP | 🔔📥 | |
| Reports | GSP approved (final) | HOD + chain | 🔔📥✉️ | |
| Reports | Change requested (any tier) | Previous actor | 🔔📥 | |
| Reports | Report overdue / not submitted ⚠️ | HOD, then GH/CP | 🔔📥📊 | *`SERVICE_REPORT` cron exists but the copy is generic and `POST /report/viewed` misfires it (§18.8)* |
| Reports | Stuck in review (SLA breach) | Current reviewer + escalation | 🔔📥 | |
| Tickets | Ticket issued (individual) ⚙️ | Worker | 🔔✉️📥 | |
| Tickets | Ticket issued (department) ⚙️ | Dept head | 🔔✉️📥 | |
| Tickets | Ticket issued (campus) ⚠️ | Campus | ✉️📥 | *email only — no push, no inbox row* |
| Tickets | Ticket → QC / Pastor notice ⚙️ | QC, Pastor | 🔔📥 | |
| Tickets | Ticket retracted ⚙️ | Worker, QC | 🔔📥 | |
| Tickets | Contest filed / replied ⚠️ | QC ↔ Worker | 🔔✉️📥 | *email only — no push, no inbox row* |
| Scoring | Score posted for service | Worker | 📥 | |
| Scoring | Rank change / leaderboard | Worker, HOD | 📥📊 | |
| Scoring | Delegate session points (CGWC) | Delegate | 📥 | |
| Services | New service scheduled | Affected workers/leaders | 🔔📥 | |
| Services | Service changed / cancelled | Affected workers/leaders | 🔔📥 | |
| User lifecycle | Verify email OTP ⚙️ | User | ✉️ | |
| User lifecycle | Account approved/activated | User | 🔔✉️📥 | |
| User lifecycle | Password reset OTP ⚙️ | User | ✉️📱 | |
| User lifecycle | Password changed ⚙️ | User | ✉️📥 | |
| User lifecycle | Account deletion OTP ⚙️ | User | ✉️ | |
| User lifecycle | QR code issued ⚙️ | Worker | ✉️ | |
| User lifecycle | Status change (Inactive/Dormant/Blacklisted) | Worker, CP/HOD | 🔔📥✉️ | |
| User lifecycle | Dormant-worker monthly report ⚠️ | CP | ✉️📊 | *cron disabled; manual trigger exists: `POST /api/user-status/notify-pastors`* |
| User lifecycle | Department/campus transfer | Worker, old+new HOD | 🔔📥 | |
| CGWC | Event announced / registration open | Workers | 🔔✉️📥 | |
| CGWC | Registration confirmed / closing | Delegate | 🔔📥 | |
| CGWC | Session reminder / instant message ⚠️ | Delegate | 🔔📥 | *`createInstantMessage` stores the row and never pushes it* |
| CGWC | Feedback request | Delegate | 📥✉️ | |
| Sister church | Sister service scheduled | Sister workers | 🔔📥 | |
| Admin/System | Bulk operation outcome | Global Admin | 📥✉️ | |
| Admin/System | Tenant/sub-tenant change | Global Admin | 📥 | |
| Admin/System | Delivery failure / token invalidation | Global Admin | 📥📊 | |
| Broadcast | Org/campus/department announcement ⚠️ | Target audience | 🔔✉️📥 | *global-only today, and the endpoint is unauthenticated (§18.3)* |
| Reports | Campus report readiness rollup | CP, Campus Coordinator | 📥📊 | *`GET /gh/campus/:campusId/reports` exists; no notification hangs off it* |
| Workforce | Monthly worker-status computed | CP, HOD | 📥📊 | *`userStatusComputationService` runs; `initializeJobs()` is commented out in `server.js`* |
| Admin/System | Audit-log anomaly (bulk delete, role change) | QC, Global Admin | 📥✉️ | *audit logs are now written by 21 controllers — nothing watches them* |

---

## 5. Cross-cutting infrastructure stories (the "system" persona)

These make the whole thing world-class. Most are still **missing today**; where something has
shipped since this doc was first written it is called out inline. INFRA-3 is the keystone —
nothing else in this document is trustworthy until persistence is fixed.

### INFRA-1 — Notification preferences per channel & category
**Story:** As any user, I want to control which notification categories reach me on which
channels (push/email/SMS), so that I only get what's relevant and don't get fatigued.
- **Channels:** settings surface; affects all.
- **Priority:** P0
- **AC:**
  - A `NotificationPreference` document exists per user with per-category × per-channel toggles.
  - Defaults are sensible per role (e.g., approvers default-on for review events).
  - **Safety/compliance categories cannot be disabled** (OTP, account security, blacklist, child-safety incidents).
  - Sending pipeline checks preferences before dispatch and records the decision.
  - No preference record → fall back to role defaults (no silent drop).

### INFRA-2 — Quiet hours & timezone awareness
**Story:** As a user, I want non-urgent notifications to respect quiet hours and my campus
timezone (Africa/Lagos by default), so that I'm not woken for low-priority items.
- **Priority:** P1
- **AC:**
  - P2/P1 notifications queued during quiet hours deliver at the next allowed window.
  - P0 (safety/security) bypass quiet hours.
  - All scheduling uses the campus timezone, consistent with existing cron (`Africa/Lagos`).

### INFRA-3 — In-app notification center (read/unread, filter, paginate)
**Story:** As a user, I want a single in-app inbox of all my notifications with read/unread
state and category filters, so that I never lose an actionable item.
- **Priority:** P0
- **Shipped since first draft:** `PATCH /notification/read-all/:userId` and
  `GET /notification/unread-count/:userId` now exist, all four inbox routes enforce
  `verifyToken`, and `markNotificationAsRead` now matches broadcast rows.
- **AC:**
  - Extends the existing `Notification` model + inbox endpoints (`controllers/notificationController.js`).
  - Unread badge count ✅, mark-all-read ✅, pagination ✅, **filter by category ❌** (no category field on the row yet).
  - Each item carries its own routing target (`url` / `content`) and is idempotent per event — **not true today**, see below.

#### Notification persistence model (must-fix foundation)
The in-app inbox is only trustworthy if every notifiable event is **durably recorded
regardless of delivery outcome**. Today persistence is best-effort and push-coupled.
Current behaviour (from code) and required fixes:

1. **Write-first, decoupled from push success.**
   - *Today:* `saveNotificationToDatabase` runs only when `userId && results.successful > 0`
     (`services/expoPushNotificationService.js:284`). A user with no active device token, a
     revoked OS permission, or any transient Expo failure gets **no stored record** and can
     never see it in-app. The inbox is therefore a log of successful pushes, not of events.
   - *Required:* Persist the `Notification` row **first** (source of truth), then attempt
     push/email as independent delivery steps whose outcomes are recorded on the row.
     Delivery failure must never suppress the record.

2. **Persist the routing target.**
   - *Today:* the save writes only `title`, `message`, `type` (`expoPushNotificationService.js:469-476`).
     The push `data.url` and `data.content._id` are dropped, so the same notification routes
     precisely when tapped from the tray and lands nowhere useful when tapped in the inbox.
   - *Required:* Add `url`, `entityType`, `entityId`, and `category` to the schema and populate
     them on every write. Keep `url`/`content` as the wire contract — mobile already consumes it.

3. **Per-user read state for broadcasts.**
   - *Today:* a broadcast is one document with `userId: null`. `markNotificationAsRead` and
     `markAllNotificationsAsRead` now match it and set `isRead: true` on that **shared** row
     (`controllers/notificationController.js:252, 290`) — so one user reading a broadcast marks
     it read for **every** user, and `getUnreadNotificationCount` is wrong for everyone else.
     This is a regression in kind, not a fix: the earlier behaviour failed closed, this one
     silently corrupts other users' state.
   - *Required:* A read-receipt collection keyed by `(userId, notificationId)`, or fan-out per
     recipient. Unread counts must be per-user and correct.

4. **Capture email/SMS-only events in the inbox.**
   - *Today:* SendGrid emails (permission decisions, ticket emails, password reset, OTPs)
     create no `Notification` record, so those events never appear in-app.
   - *Required:* All user-facing notifications write an inbox row (mark security/OTP items
     as non-actionable/system where a deep-link isn't appropriate). Pure-secret payloads
     (raw OTP codes) are referenced, not stored verbatim.

5. **Tenant scoping on persistence & retrieval.**
   - *Today:* notification queries are not tenant-scoped.
   - *Required:* Stamp `subTenantId`/`tenantId` on each row and filter reads accordingly (see INFRA-8).

6. **Ownership check on read.**
   - *Today:* `getUserNotifications` reads `:userId` from the path and never compares it to the
     authenticated caller. Any valid token can read any user's inbox.
   - *Required:* Assert `req.user.userId === req.params.userId`, or drop the path param and
     serve the caller's own inbox.

7. **Retention & indexing.**
   - *Today:* rows accumulate forever; the schema has no index on `userId` or `createdAt`, so
     inbox reads are collection scans that get slower every service.
   - *Required:* Compound index on `(userId, createdAt)` and `(userId, isRead)`; a retention
     policy (suggest: 12 months, then archive) agreed with QC for audit purposes.

### INFRA-4 — Channel fallback & escalation
**Story:** As the system, I want to fall back from push → in-app → email when a higher
channel fails or goes unread, so that critical actions aren't missed.
- **Priority:** P1
- **AC:**
  - Invalid/expired Expo tokens are detected (already marked inactive) and trigger email fallback for P0 items.
  - Unacknowledged approval requests escalate to the next tier after a configurable SLA (see REP/PERM SLA stories).

### INFRA-5 — Deduplication & idempotency
**Story:** As a user, I don't want duplicate notifications for the same event, even if a
cron job or retry runs twice.
- **Priority:** P0
- **AC:**
  - Each notification has a deterministic dedupe key (event-type + entity-id + recipient + period).
  - Re-fires within a window are suppressed; cron jobs (every 10 min) never double-send (e.g., `PNStatus` gating on `CampusService`).

### INFRA-6 — Batching & digests
**Story:** As a leader, I want high-frequency events (clock-ins, score updates) batched into
summaries instead of one-per-event, so that my inbox stays useful.
- **Priority:** P1
- **AC:**
  - Configurable digest cadence (real-time / hourly / daily / weekly) per category.
  - Existing clock-in/out summaries become the canonical batched pattern; extend to reports overdue, ticket activity.

### INFRA-7 — Delivery tracking & observability
**Story:** As a Global Admin, I want to see delivery status (sent/delivered/failed/read) per
notification, so that I can trust the system and debug gaps.
- **Priority:** P1
- **AC:**
  - Persist Expo receipts (already fetched) and email status; expose per-notification status.
  - Dashboard of failure rates and invalid-token cleanup; alert on spikes.

### INFRA-8 — Multi-tenant isolation
**Story:** As a Global Admin of a sub-tenant, I want notifications scoped to my tenant's
users, so that no cross-tenant leakage occurs.
- **Priority:** P0
- **AC:**
  - All recipient queries filter by `subTenantId`/`tenantId`.
  - Broadcasts are tenant-scoped by default; cross-tenant requires explicit super-admin action.

### INFRA-9 — Localization & templating
**Story:** As a user, I want notification copy from versioned templates (and future
localization), so that messaging is consistent and maintainable.
- **Priority:** P2
- **AC:** Centralized template registry (extends `config/emailTemplate` + push copy); variables validated; preview in admin.

### INFRA-10 — Audit trail for notifications
**Story:** As QC/Global Admin, I want every notification dispatch logged to the audit trail,
so that we have compliance-grade traceability.
- **Priority:** P1
- **Shipped since first draft:** audit logging is now broadly in place — 21 controllers call
  `createAuditLogs`, including `notificationController` for broadcasts and mark-read, and
  `gHController.transitionReport` for every report state change (`NOTIFICATION_CATEGORY`,
  `REPORT_CATEGORY` and friends are configured per category).
- **Still missing:** the *dispatch* itself is unaudited — pushes sent from
  `config/pushNotifications.js` (clock-in, tickets, permissions) write no audit entry, and
  neither do failures. `pushGenericNotification` audits nothing at all.
- **AC:** Every send **and every failure** writes an `AuditLog` row naming type, recipient
  count, channel, and outcome. Audit rows are never a substitute for the delivery record in
  INFRA-7 — they answer "who caused this", not "did it arrive".

### INFRA-11 — Device & token lifecycle
**Story:** As a worker who switches phones, I want notifications to follow my active device,
so that I keep receiving them without duplicates on dead devices.
- **Priority:** P1
- **Today:** upsert by `(userId, deviceId)` ✅ · multi-device ✅ · malformed tokens deactivated
  on send ✅ · logout deletes by `(userId, expoPushToken)` ✅.
- **Still missing:** the `DeviceNotRegistered` branch is an **empty stub**
  (`expoPushNotificationService.js:271`), so a token from an uninstalled app stays active
  forever and every send to it counts as a failure. Receipts are fetched by
  `handlePushNotificationReceipts` but **nothing calls it**, so asynchronous delivery failures
  are never observed.
- **AC:** Act on `DeviceNotRegistered` at both ticket and receipt stage; schedule the receipt
  sweep ~15 min after each send batch; purge tokens inactive for 90 days; align logout on
  `deviceId` so a rotated token can't orphan a device.

### INFRA-12 — Real-time in-app delivery
**Story:** As a user with the app open, I want the inbox and badge to update the moment
something happens, so that I don't have to pull to refresh.
- **Priority:** P2
- **Today:** `socket.io` is a dependency but is **not initialised anywhere** — the inbox is
  pull-only.
- **AC:** Authenticated socket channel per user; new-notification and read-state events pushed
  live; the REST inbox remains the source of truth and the fallback. Real-time must never be
  the *only* path — a dropped socket cannot lose a notification.

### INFRA-13 — Notification copy registry
**Story:** As a product owner, I want every notification's title and body to live in one
reviewed registry, so that voice (§3.3) is consistent and copy can be fixed without a
controller change.
- **Priority:** P1
- **Today:** push copy is hard-coded inline across `config/pushNotifications.js`; email copy is
  ~60 hand-written HTML templates in a single 7,300-line file
  (`config/emailTemplate/email.template.js`), many of them one-off event blasts.
- **AC:** One registry keyed by `type`, holding title, body, channel variants, priority, and
  category; variables validated at build time; §3.2/§3.3 enforced by review; email templates
  composed from shared partials rather than copy-pasted.

---

## 6. Epic — Attendance & Clock-in/out

### ATT-1 — Clock-in window opening reminder ⚙️
**Story:** As a worker, I want a reminder shortly before clock-in opens for my service, so
that I arrive and clock in on time.
- **Trigger:** Cron `campusServiceClockInJob`, **every 10 minutes** across the clock-in window (`CLOCK_IN_BUFFER`, default 20 min).
- **Channels:** 🔔📥 · **Priority:** P0
- **AC:**
  - Only for workers with no attendance yet for that `CampusService` **and** no approved permission — both filters exist today.
  - **Dedupe is the open work.** The job re-runs every 10 minutes, so a worker who is late can receive the same push repeatedly. One notification per worker per service, updated in place as the window narrows ("clock-in closes in 5 minutes"), never restacked (§3.5).
  - Lands on the clock-in screen with the CTA ready and a "request permission" shortcut.

### ATT-2 — Clock-in confirmation & status
**Story:** As a worker, I want immediate confirmation of my clock-in and whether I'm on-time
or late, so that I know my standing for the service.
- **Trigger:** Successful clock-in (geofenced or QR).
- **Channels:** 📥 · **Priority:** P1
- **AC:** States ON_TIME / LATE relative to `workersLateStartTime` (or `leadersLateStartTime` for leaders); shows captured score impact; only on successful record.

### ATT-3 — Clock-in/geofence/QR failure
**Story:** As a worker, I want to be told why a clock-in failed (out of range, window closed,
invalid QR), so that I can correct it immediately.
- **Trigger:** Failed clock-in attempt.
- **Channels:** 📥 · **Priority:** P1
- **AC:** Distinct messages for out-of-geofence (with distance), window-not-open/closed, duplicate, invalid QR; never marks attendance.

### ATT-4 — Clock-out reminder ⚙️
**Story:** As a worker, I want a reminder to clock out after service, so that my attendance
record is complete and my score isn't penalized.
- **Trigger:** Cron `campusServiceClockOutJob` (post-service buffer).
- **Channels:** 🔔📥 · **Priority:** P1
- **AC:** Only to workers clocked-in but not out; suppressed once clocked out (dedupe).

### ATT-5 — Marked absent ⚠️
**Story:** As a worker, I want to know when I've been marked absent for a service so I can
file a late permission/appeal if warranted.
- **Trigger:** `markAbsentUsersJob` (runs every 2 hours; today it writes the absence, guarded by `Service.absenceProcessed`, and notifies nobody).
- **Channels:** 🔔📥 · **Priority:** P1
- **AC:** Fires only after absence is finalized and no valid permission exists; links to appeal/permission flow; one per service (dedupe).

### ATT-6 — Team clock-in summary ⚙️
**Story:** As an HOD/AHOD, I want a summary of how many of my team have clocked in shortly
after service start, so that I can follow up on no-shows.
- **Trigger:** Cron `campusServiceClockInSummaryJob`, every 10 minutes after service time.
- **Channels:** 🔔📥 · **Priority:** P1
- **AC:** Body carries **both** numbers — "9 of 14 clocked in" — today's copy gives only the clocked-in count, which tells a leader nothing about who is missing. Lands on the roster filtered to not-clocked-in. One per service, updated in place, not one per cron tick (§3.4).

### ATT-7 — Team clock-out summary ⚠️
**Story:** As an HOD/AHOD, I want an end-of-service attendance summary, so that I can confirm
the day's record before reporting.
- **Trigger:** `sendClockOutSummaryPN` exists in `config/pushNotifications.js` but its only call site is commented out (`cron-services.js:205`) — the copy ("see summary of your team's attendance today") also carries no numbers, so it needs rewriting before it is re-enabled.
- **Channels:** 🔔📥 · **Priority:** P2 · **AC:** On-time / late / absent counts **in the body**; links to report drafting; suppressed when the department had no scheduled duty.

### ATT-8 — Attendance anomaly alert (Campus Coordinator)
**Story:** As a Campus Coordinator, I want an alert when a department's attendance is
abnormally low for a service, so that I can intervene operationally.
- **Trigger:** Post-service computation: department attendance below configurable threshold.
- **Channels:** 🔔📥 · **Priority:** P2 · **AC:** Threshold configurable per campus; batched into one alert listing affected departments (digest).

### ATT-9 — Late-leader alert
**Story:** As a Campus Pastor, I want to be alerted when department leaders themselves clock
in late (stricter `leadersLateStartTime`), so that I can address leadership punctuality.
- **Channels:** 📥📊 · **Priority:** P2 · **AC:** Weekly digest by default; respects preferences.

---

## 7. Epic — Permissions / Leave Requests

### PERM-1 — Request submitted (to requester) ⚙️
**Story:** As a worker, I want confirmation that my permission request was submitted and is
pending, so that I know it's in the queue.
- **Channels:** 🔔✉️📥 · **Priority:** P1 · **AC:** Shows category, date range, current approval stage (HOD vs CP based on role).

### PERM-2 — Request routed to approver ⚙️
**Story:** As an HOD/AHOD (or CP for leaders), I want to be notified when a worker in my
scope submits a permission request, so that I can review it promptly.
- **Trigger:** `sendPNForApproval` / `SendPermissionToHODForApproval` / `sendToExecutivePastorForApproval`.
- **Channels:** 🔔✉️📥 · **Priority:** P0
- **AC:** Routed by requester role/dept; department-boundary enforced (HOD only sees own dept); deep-links to approve/reject.

### PERM-3 — Approved / rejected (to requester) ⚙️
**Story:** As a worker, I want to be told when my permission is approved or rejected (with
reason), so that I know whether I'm exempt from attendance.
- **Channels:** 🔔✉️📥 · **Priority:** P0 · **AC:** Rejection includes reviewer comment; approval shows covered date range; links to the permission.

### PERM-4 — Pending-approval SLA reminder
**Story:** As an approver, I want a reminder if a permission request is still pending after
an SLA window, so that workers aren't left waiting.
- **Channels:** 🔔📥 · **Priority:** P1 · **AC:** Configurable SLA; escalates to next tier (HOD→CP) if unaddressed; dedupe per request/day.

### PERM-5 — Permission expiring / expired
**Story:** As a worker, I want a heads-up before my approved permission ends, so that I
resume attendance and avoid being marked absent.
- **Channels:** 📥 · **Priority:** P2 · **AC:** Fires the day before `endDate`; one per permission.

### PERM-6 — Group-scope visibility (Group Head)
**Story:** As a Group Head, I want a digest of permission activity across my group's
departments, so that I have oversight without per-request noise.
- **Channels:** 📊📥 · **Priority:** P2 · **AC:** Scoped to GH's group departments; daily digest; respects preferences.

---

## 8. Epic — Reports (review pipeline)

> Pipeline: `DRAFT → HOD_SUBMITTED → GH_APPROVED → CP_APPROVED → GSP_APPROVED`, with
> `*_CHANGE_REQUESTED` loops. The state machine and its guards live in `utils/reportModels.js`;
> one endpoint drives all of it: `POST /gh/reports/:reportId/transition`
> (`gHController.transitionReport`, `controllers/gHController.js:210`).
>
> **Nothing in this epic is implemented.** `transitionReport` writes an audit log and returns —
> no notification of any kind fires on any transition. Every story below is a wiring task at
> that one call site, which is what makes this epic the highest-leverage work in the document.
>
> Four properties of the real machine that every story must respect:
>
> **1. Submitter = HOD *or* AHOD.** `HOD_SUBMITTED` is authorized for both roles, and review
> history records them distinctly (`actorRole` ∈ `HOD | AHOD | GH | CP | GSP`). "Submitter"
> means whichever actually filed or resubmitted — notifications must name and route to the
> **actual** submitter, resolved from `reviewHistory`, never to the department HOD by default.
>
> **2. Headless departments skip the GH tier.** When a department has no active Group Head
> (`isHeadlessDepartment`), extra transitions are legal: `HOD_SUBMITTED → CP_APPROVED |
> CP_CHANGE_REQUESTED`, and `CP_CHANGE_REQUESTED → HOD_SUBMITTED`. A REP-1 notification
> addressed to "your Group Head" is wrong for these departments, and routing a submission to a
> GH who does not exist means the report silently stalls. **Every recipient resolution in this
> epic must branch on headlessness.**
>
> **3. `awaitingRole` is computed server-side.** The transition response returns
> `HOD | GROUP_HEAD | CAMPUS_PASTOR | GSP | null` (`computeAwaitingRole`). Notifications and
> queue badges derive from it; nobody re-derives the next actor independently.
>
> **4. Reports are polymorphic.** Twelve collections, one per `reportType`; a `reportId` is only
> meaningful **paired with its `reportType`**. Every report notification carries both. A
> department's type comes from `Departments.reportType`, falling back to the name map.

### REP-1 — Submitted for review
**Story:** As the next reviewer, I want to be notified when an HOD **or AHOD** submits a
department report, so that I can review it without polling.
- **Trigger:** transition → `HOD_SUBMITTED` (by HOD or AHOD).
- **Channels:** 🔔📥 · **Priority:** P0
- **AC:**
  - Routed by `awaitingRole`: the **Group Head of the report's group**, or — for a headless
    department — **every Campus Pastor on the report's campus**. Never both.
  - Body names department, report type, and the actual submitter: *"Grace Umeh (AHOD, Ushery Board) submitted the Attendance Report for Sun 24 Aug."*
  - Carries `reportId` + `reportType`; lands on the review screen with approve / request-changes on screen.
  - Resubmissions are labelled **Resubmitted** and, where a change was requested, name the reviewer whose comment was addressed.
  - One notification per submission per reviewer — a resubmission loop must not re-notify for the original.

### REP-2 — Approved → escalates to Campus Pastor
**Story:** As a Campus Pastor, I want notice when a GH approves a report in my campus, so
that I can give campus-level sign-off.
- **Trigger:** transition → `GH_APPROVED`, **or** `HOD_SUBMITTED` on a headless department.
- **Channels:** 🔔📥 · **Priority:** P0
- **AC:** Scoped to the report's campus; queue badge increments; the submitter also gets an
  inbox-only "moved to campus review" entry (no push — P2 ambient, §3.4). For the headless
  path the copy says the report came **straight from the department**, so the CP isn't left
  wondering who reviewed it first.

### REP-3 — Approved → escalates to GSP
**Story:** As the GSP, I want notice when a CP approves a report, so that I can do final
approval.
- **Trigger:** transition → `CP_APPROVED`. · **Channels:** 🔔📥 · **Priority:** P0 · **AC:** Global queue; supports filter by campus/department/type.

### REP-4 — Change requested (down-chain)
**Story:** As the previous actor (the submitting HOD/AHOD, GH, or CP), I want to be notified when
the next reviewer requests changes (with the required comment), so that I can act on the feedback.
- **Trigger:** transition → `GH_CHANGE_REQUESTED` / `CP_CHANGE_REQUESTED` / `GSP_CHANGE_REQUESTED`.
- **Channels:** 🔔📥 · **Priority:** P0
- **AC:**
  - Includes the reviewer's comment verbatim — the API enforces **≥ 20 characters** on every change-request transition, so there is always something to show.
  - Lands on the **editable** report scrolled to the comment, marked "action required".
  - Recipient is resolved from `reviewHistory`, not from role: `GH_CHANGE_REQUESTED` → the actual submitter (HOD **or** AHOD); `CP_CHANGE_REQUESTED` → the GH who approved it, or the submitter when the department is headless; `GSP_CHANGE_REQUESTED` → the CP who approved it.
  - Ends any pending REP-7 SLA nudge for that report — the ball has changed hands.

### REP-5 — Final approval (GSP_APPROVED)
**Story:** As the submitting HOD/AHOD (and the review chain), I want confirmation when a report is
finally approved, so that everyone knows it's closed.
- **Channels:** 🔔📥✉️ · **Priority:** P1 · **AC:** Notifies the submitter (HOD/AHOD); optional summary to GH/CP; archived state reflected in inbox.

### REP-6 — Report overdue / not submitted
**Story:** As an HOD/AHOD, I want a reminder when my department's report for a completed service
hasn't been submitted, so that the chain isn't blocked.
- **Trigger:** Service ended + no report for required type/department after buffer (extends `sendReport`).
- **Channels:** 🔔📥 · **Priority:** P0
- **AC:**
  - Only for departments that actually own that report type (`Departments.reportType`), and only where the department has active users — report generation already skips empty departments, and reminders must too.
  - Names the service, the report type, and the deadline; lands on the drafting screen for that exact report.
  - Escalates to GH (or CP when headless) if still missing after the SLA — **as a digest of all missing reports**, never one push per department (§3.4).
  - Cancelled the moment the report reaches `HOD_SUBMITTED` (§3.5).
  - Replaces today's generic `SERVICE_REPORT` copy, which says only "send in your report, submit immediately" and names nothing.

### REP-7 — Stuck-in-review SLA
**Story:** As the current reviewer, I want a nudge when a report sits in my queue past the
SLA, and as the next tier, I want visibility if it stalls, so that approvals keep moving.
- **Channels:** 🔔📥 · **Priority:** P1 · **AC:** Per-tier SLA; escalation to higher tier; dedupe per report/day.

### REP-8 — Department-specific report cues
**Story:** As an HOD/AHOD of a reporting department, I want report prompts tailored to my
department's report type, so that I file the right report.
- **Channels:** 🔔📥 · **Priority:** P2
- **AC:** Mapping honored — Ushery→AttendanceReport, Children Ministry→ChildCareReport,
  PCU→GuestReport, Traffic & Security→SecurityReport, Transfer→TransferReport, Programme
  Coordination→ServiceReport, Welfare→WelfareReport, Witty Inventions→WittyReport,
  PRU→PruReport, Protocol→ProtocolReport, Internship→InternshipReport.

### REP-9 — Incident report raised
**Story:** As a Campus Pastor / QC, I want immediate notice when any department files an
incident report, so that urgent issues get attention.
- **Trigger:** `IncidentReport` created (`reportController.createIncidentReport`). · **Channels:** 🔔📥✉️ · **Priority:** P0
- **AC:** Bypasses quiet hours and preferences; routes to campus leadership + QC; the
  lock-screen preview names the department and campus but **not** the incident's substance
  (§3.6); email carries the detail.

### REP-10 — Campus report readiness (Campus Pastor / Coordinator)
**Story:** As a Campus Pastor, I want one pre-service-close view of which departments on my
campus have filed, which are in review, and which are missing, so that I chase the right people
once instead of tracking twelve collections.
- **Trigger:** service end + buffer; data already available via `GET /gh/campus/:campusId/reports`,
  which surfaces headless `HOD_SUBMITTED` reports awaiting CP action.
- **Channels:** 📥📊 · **Priority:** P1
- **AC:** One digest per campus per service; groups by `awaitingRole` so the CP sees what is
  *theirs* to act on separately from what is with the GH or the HOD; taps into the campus report
  summary filtered to the blocking set; suppressed entirely when nothing is outstanding (§3.5).

---

## 9. Epic — Tickets (QC / disciplinary)

### TKT-1 — Individual ticket issued ⚙️
**Story:** As a worker, I want to be notified when a ticket is issued against me (with reason
and category), so that I can respond or contest.
- **Channels:** 🔔✉️📥 · **Priority:** P0
- **AC:** Lands on ticket detail with the contest action on screen; cannot be silenced (compliance); the body states the category, the date, and **the contest deadline**. Today's copy — *"you've just been issued a ticket. We celebrate you."* — names none of those and must be rewritten per §3.3.

### TKT-2 — Department ticket issued ⚙️
**Story:** As a department head, I want notice when a ticket is issued to my department, so
that I can address it as a unit.
- **Channels:** 🔔✉️📥 · **Priority:** P0 · **AC:** Routed to dept head; shows scope flag (`isDepartment`).

### TKT-3 — Campus ticket issued ⚠️
**Story:** As campus leadership/workers, I want notice of a campus-wide ticket, so that the
whole campus is aware.
- **Channels:** ✉️📥 · **Priority:** P1
- **Today:** email only (`SendCampusIssuedTicket`) — no push and no inbox row, so the campus learns about it only if people read email.
- **AC:** Tenant/campus-scoped broadcast (`isCampus`); inbox row for every recipient; push at P1.

### TKT-4 — QC & Pastor copy ⚙️
**Story:** As a QC/M&E officer and as the relevant Pastor, I want to be informed when a
ticket is issued, so that I have oversight of disciplinary actions.
- **Trigger:** `notifyQCTicketIssuedPN`, `notifyPastorTicketIssuedPN`. · **Channels:** 🔔📥 · **Priority:** P1
- **AC:** Oversight view, not a peer announcement — recipients are QC and the subject's own
  Pastor only (§3.6). The Pastor copy currently opens *"Celebrate you! &lt;name&gt; has just been
  issued a ticket."*, which celebrates a colleague's sanction; rewrite to a neutral oversight
  statement.

### TKT-5 — Ticket retracted ⚙️
**Story:** As a worker (and QC), I want to know when a ticket against me is retracted, so my
record is corrected.
- **Channels:** 🔔📥 · **Priority:** P1 · **AC:** Updates inbox item state; notifies QC (`notifyQCTicketRetractedPN`).

### TKT-6 — Contest filed (worker → QC) ⚠️
**Story:** As a QC officer, I want notice when a worker contests a ticket, so that I can
review and reply.
- **Channels:** 🔔✉️📥 · **Priority:** P1
- **Today:** email only (`contestComment` / `contestDepartmentComment`) — no push, no inbox row.
- **AC:** Lands on the contest thread with the reply box focused; supports department contests; QC sees who filed and against which ticket without opening it.

### TKT-7 — Contest reply (QC → worker) ⚠️
**Story:** As a worker, I want notice when QC replies to my contest, so that I can see the
outcome.
- **Channels:** 🔔✉️📥 · **Priority:** P1
- **Today:** email only (`contestReplyComment` / `contestDepartmentReplyComment`) — no push, no inbox row.
- **AC:** Threaded, scrolled to the reply; states the resolution and whether anything further is required of the worker; if the outcome is a retraction, TKT-5 supersedes this rather than both firing.

### TKT-8 — Unaddressed ticket reminder
**Story:** As a worker with an open ticket, I want a reminder if I haven't responded within
the window, so that I don't miss the contest deadline.
- **Channels:** 🔔📥 · **Priority:** P2 · **AC:** One reminder before deadline; dedupe.

---

## 10. Epic — Scoring, Ranking & Leaderboards

### SCO-1 — Service score posted
**Story:** As a worker, I want to see the score I earned (or lost) for a service, so that I
understand my standing.
- **Trigger:** `updateServiceScore` / score finalization. · **Channels:** 📥 · **Priority:** P2 · **AC:** Shows points + reason (on-time/late/absent/permission); no spam — batched per service.

### SCO-2 — Rank change / leaderboard movement
**Story:** As a worker, I want to know when my rank changes meaningfully, so that I stay
motivated.
- **Channels:** 📥📊 · **Priority:** P2 · **AC:** Only on threshold movement; weekly leaderboard digest option.

### SCO-3 — Team scoring digest (HOD)
**Story:** As an HOD, I want a periodic scoring digest for my department, so that I can
coach low performers.
- **Channels:** 📊📥 · **Priority:** P2 · **AC:** Top/bottom performers; configurable cadence.

### SCO-4 — Delegate session points (CGWC)
**Story:** As a delegate, I want my points after each CGWC session, so that I track my
participation.
- **Trigger:** `DelegateScore` per session. · **Channels:** 📥 · **Priority:** P2.

---

## 11. Epic — Services & Events scheduling

### SVC-1 — New service scheduled
**Story:** As an affected worker/leader, I want notice when a new service is scheduled for my
campus/department, so that I plan to attend.
- **Trigger:** `Service`/`CampusService` created. · **Channels:** 🔔📥 · **Priority:** P1 · **AC:** Tenant/campus-scoped; shows service time + clock-in window.

### SVC-2 — Service changed or cancelled
**Story:** As an affected worker/leader, I want immediate notice if a service time changes or
is cancelled, so that I'm not caught out.
- **Channels:** 🔔📥 · **Priority:** P0 · **AC:** High priority; clearly states old→new time or cancellation; bypasses digest batching.

### SVC-3 — Service readiness (Campus Coordinator)
**Story:** As a Campus Coordinator, I want a pre-service readiness checklist alert (geofence,
times configured, departments assigned), so that the service is set up correctly.
- **Channels:** 🔔📥 · **Priority:** P2 · **AC:** Fires N hours before; flags missing config.

---

## 12. Epic — User / Worker Lifecycle

### USR-1 — Email verification OTP ⚙️
**Story:** As a new user, I want a verification code to confirm my email, so that I can
activate my account.
- **Channels:** ✉️ (📱 optional) · **Priority:** P0 · **AC:** Time-boxed OTP; cannot be disabled (security).

### USR-2 — Account approved / activated
**Story:** As a new worker, I want to be told when an admin approves my account, so that I
know I can log in and start clocking in.
- **Channels:** 🔔✉️📥 · **Priority:** P1 · **AC:** Fires on `isActivated` true; includes getting-started link.

### USR-3 — Password reset OTP ⚙️
**Story:** As a user, I want a reset code when I request a password reset, so that I can
regain access securely.
- **Channels:** ✉️📱 · **Priority:** P0 · **AC:** Security category, non-disable-able; rate-limited.

### USR-4 — Password changed confirmation ⚙️
**Story:** As a user, I want confirmation when my password changes, so that I can react to
unauthorized changes.
- **Channels:** ✉️📥 · **Priority:** P0 · **AC:** Security category; includes "wasn't me" guidance.

### USR-5 — Account deletion OTP ⚙️
**Story:** As a user, I want a confirmation code to delete my account, so that deletion is
deliberate and secure.
- **Channels:** ✉️ · **Priority:** P0 · **AC:** Security category; time-boxed.

### USR-6 — QR code issued ⚙️
**Story:** As a worker, I want my attendance QR code delivered, so that I can clock in where
geofencing isn't used.
- **Channels:** ✉️ · **Priority:** P1 · **AC:** Re-issue supported; old code invalidated.

### USR-7 — Status change (Inactive / Dormant / Blacklisted)
**Story:** As a worker, I want to be notified (gently) when my activity status changes, so
that I can re-engage before escalation.
- **Trigger:** `UserStatusReport` computation; consecutive-month thresholds.
- **Channels:** 🔔📥✉️ · **Priority:** P1
- **AC:** Tone is pastoral, not punitive; **blacklist notice is non-disable-able** and includes appeal path; status drives recipient (worker + CP/HOD).

### USR-8 — Dormant-worker report to Campus Pastor ⚠️
**Story:** As a Campus Pastor, I want a monthly report of inactive/dormant/blacklisted
workers in my campus, so that I can drive re-engagement.
- **Trigger:** `notifyPastorOnDormantWorkersJob` — scheduled for the 1st of each month at 03:30
  but **commented out of `cronServices.start()`**. A manual equivalent already ships:
  `POST /api/user-status/notify-pastors` (`{ year?, month?, campusId? }`, defaults to last
  month). The underlying `UserStatusReport` data is produced by
  `userStatusComputationService` — whose `initializeJobs()` is also commented out in
  `server.js`, so verify the data exists for the month before re-enabling the notification.
- **Channels:** ✉️📊 · **Priority:** P1
- **AC:** Counts **and** named lists, campus-scoped; links to the campus dormant-worker list;
  fires only when there is something to report (§3.5); one send per campus per month, idempotent
  if the manual endpoint is also invoked.

### USR-9 — Blacklist / unblacklist actioned
**Story:** As a worker, I want to know when I'm blacklisted or reinstated, so that I
understand my access and next steps.
- **Channels:** 🔔📥✉️ · **Priority:** P0 · **AC:** Clear reason + appeal/return path; both directions covered.

### USR-10 — Department/campus transfer
**Story:** As a worker (and my old + new HOD), I want notice when I'm transferred between
departments/campuses, so that everyone's roster and reporting line is correct.
- **Channels:** 🔔📥 · **Priority:** P1 · **AC:** Notifies worker, losing HOD, gaining HOD; respects `secondaryDepartments` changes.

### USR-11 — Profile change of record
**Story:** As an HOD, I want notice when a worker in my department changes key profile fields
(name, contact, department), so that records stay trustworthy.
- **Channels:** 📥 · **Priority:** P2 · **AC:** Only material fields; batched.

---

## 13. Epic — CGWC (special events & delegates)

### CGW-1 — Event announced / registration open
**Story:** As a worker, I want to know when a CGWC event and its registration open, so that I
can register in time.
- **Trigger:** `CGWC.registrationStartDate`. · **Channels:** 🔔✉️📥 · **Priority:** P1 · **AC:** Tenant-scoped; links to register; dates shown.

### CGW-2 — Registration confirmed / closing soon
**Story:** As a delegate, I want confirmation of my registration and a reminder before it
closes, so that I don't miss out.
- **Channels:** 🔔📥 · **Priority:** P2 · **AC:** Closing reminder fires before `registrationEndDate`.

### CGW-3 — Session reminders & instant messages ⚠️
**Story:** As a delegate, I want session reminders and instant event messages, so that I stay
on schedule during the event.
- **Trigger:** `CGWCInstantMessage` posted; session start.
- **Today:** `CGWCController.createInstantMessage` writes the message row and **never pushes
  it** — delegates only see it if they happen to open the feed. The `target` field on the model
  is stored but unused for routing.
- **Channels:** 🔔📥 · **Priority:** P1
- **AC:** Push on create, scoped by `target` (all delegates / a campus / a session cohort);
  lands on the message in the event feed; respects per-event opt-in; a message posted during a
  session is P0-urgent and bypasses digest batching, one posted outside is P1.

### CGW-4 — Feedback request
**Story:** As a delegate, I want a prompt to give feedback after the event, so that I can
share my experience.
- **Trigger:** `CGWC.endDate`. · **Channels:** 📥✉️ · **Priority:** P2 · **AC:** Links to `CGWCFeedback`; one prompt + one reminder.

### CGW-5 — Delegate attendance/score updates
**Story:** As a delegate, I want confirmation when my CGWC attendance is recorded and points
awarded, so that I trust the tracking.
- **Channels:** 📥 · **Priority:** P2 · **AC:** Per-session; ties to `DelegateScore`.

---

## 14. Epic — Sister Churches (partner entities)

### SIS-1 — Sister service scheduled
**Story:** As a sister-church worker, I want notice of scheduled sister services, so that I
attend and am counted.
- **Trigger:** `SisterService` created. · **Channels:** 🔔📥 · **Priority:** P2 · **AC:** Scoped to the sister church; clock-in window included.

### SIS-2 — Sister attendance confirmation
**Story:** As a sister-church worker, I want confirmation of my recorded attendance, so that
I know it counted.
- **Trigger:** `SisterAttendance` recorded. · **Channels:** 📥 · **Priority:** P2.

---

## 15. Epic — Admin & System

### ADM-1 — Bulk operation outcome
**Story:** As a Global Admin, I want a summary when a bulk operation (uploads, sub-tenant
reassignment) completes, so that I know what succeeded/failed.
- **Trigger:** `uploadCampusUsers`, `updateUserSubTenant`, bulk imports. · **Channels:** 📥✉️ · **Priority:** P1 · **AC:** Success/failure counts + downloadable error report.

### ADM-2 — Tenant / sub-tenant change
**Story:** As a Global Admin, I want notice when tenants/sub-tenants are created or modified,
so that I keep org structure in view.
- **Channels:** 📥 · **Priority:** P2.

### ADM-3 — Delivery failure / token invalidation alert
**Story:** As a Global Admin, I want alerts when push/email delivery failure rates spike or
many tokens go invalid, so that I can investigate before users are affected.
- **Trigger:** Receipt/error monitoring (INFRA-7). · **Channels:** 📥📊 · **Priority:** P1.

### ADM-4 — Critical system event (Super Admin)
**Story:** As a Super Admin, I want only critical system alerts (not broadcasts), so that
high-signal events reach me.
- **Channels:** 📥✉️ · **Priority:** P1 · **AC:** Honors existing exclusion of Super Admin from general broadcasts.

### ADM-5 — Targeted broadcast (org / campus / department)
**Story:** As authorized leadership, I want to send a targeted announcement to an audience
(org-wide, campus, department, group, delegates), so that I can communicate at scale.
- **Trigger:** `pushGeneralNotification` (extend with audience targeting).
- **Today:** global-only (every activated user except Super Admin), one shared inbox row, and
  **the endpoint is unauthenticated** (§18.3). The audit log is written ✅.
- **Channels:** 🔔✉️📥 · **Priority:** P1
- **AC:**
  - `verifyToken` + role gate before anything else ships on this endpoint.
  - Audience filters (role / campus / department / group / tenant); Super Admin excluded by default.
  - **Preview showing the resolved recipient count and a sample of names, then explicit confirm** — a broadcast is irreversible and today there is nothing between a typo and everyone's phone.
  - Per-recipient inbox rows (or read receipts) so read state is per user (§18.2).
  - Rate-limited: at most one org-wide broadcast per hour, and none inside quiet hours unless flagged urgent.
  - Logged to audit with sender, audience definition, and recipient count.

### ADM-6 — Audit anomaly watch
**Story:** As QC / a Global Admin, I want to be alerted when the audit trail records something
unusual — a bulk delete, a role elevation, a ticket retraction spike, an out-of-hours admin
action — so that misuse is caught while it still matters.
- **Trigger:** rules over `AuditLog`, which 21 controllers now write to across every category
  (auth, users, roles, reports, tickets, permissions, notifications, tenancy).
- **Channels:** 📥✉️ · **Priority:** P2
- **AC:** Rules are configurable, not hard-coded; each alert names actor, action, scope, and
  count, and links to the filtered audit view; alerts are digested (one per rule per day) unless
  the rule is flagged critical; the alert itself is audited.

---

## 16. Department-specific notification needs

Beyond the shared report pipeline, some departments have distinct, safety- or
mission-critical notification needs worth first-class treatment:

| Department | Distinct notification need | Priority |
|---|---|---|
| **Children Ministry** | Child check-in/pick-up integrity alerts; incident escalation to CP/QC; ChildCareReport prompts | P0 |
| **Traffic & Security** | Real-time SecurityReport/incident alerts to campus leadership; rapid escalation | P0 |
| **Welfare & Special Needs** | Special-needs assistance requests; WelfareReport prompts; sensitive-handling flags | P1 |
| **PCU (Guest/First-timers)** | GuestReport prompts; follow-up reminders for assigned first-timers | P1 |
| **COZA Transfer Service** | TransferReport prompts; transfer-completion confirmations | P2 |
| **Programme Coordination** | ServiceReport prompts; service-readiness alerts (SVC-3) | P1 |
| **PRU (Public Relations)** | PruReport prompts; media/announcement coordination | P2 |
| **Protocol** | ProtocolReport prompts; VIP/event-protocol reminders | P2 |
| **Witty Inventions (Tech)** | WittyReport prompts; system-readiness/AV checks | P2 |
| **Internship** | InternshipReport prompts; mentor check-in reminders | P2 |
| **QC / M&E** | Ticket lifecycle, contests, data-quality flags, audit anomalies | P0 |

---

## 17. Priority rollup (MoSCoW)

> Sequencing note: §18's foundation and security items (18.1–18.4, 18.14) precede everything
> here regardless of MoSCoW rank. A P0 story built on push-coupled persistence is a P0 story
> that silently fails for anyone without a registered device.

**Must (P0) — foundational & safety/compliance**
INFRA-1, INFRA-3, INFRA-5, INFRA-8; ATT-1; PERM-2, PERM-3; REP-1, REP-2, REP-3, REP-4, REP-6, REP-9;
TKT-1, TKT-2; USR-1, USR-3, USR-4, USR-5, USR-9; SVC-2; ADM (child-safety/security via §16);
Children Ministry & Traffic & Security incident alerts.

**Should (P1) — high value**
INFRA-2, INFRA-4, INFRA-6, INFRA-7, INFRA-10, INFRA-11, INFRA-13; ATT-2, ATT-3, ATT-4, ATT-5, ATT-6;
PERM-1, PERM-4; REP-5, REP-7, REP-10; TKT-3..TKT-7; SVC-1; USR-2, USR-6, USR-7, USR-8, USR-10;
CGW-1, CGW-3; ADM-1, ADM-3, ADM-4, ADM-5.

**Could (P2) — enhancements**
INFRA-9, INFRA-12; ATT-7, ATT-8, ATT-9; PERM-5, PERM-6; REP-8; TKT-8; SCO-1..SCO-4; SVC-3;
USR-11; CGW-2, CGW-4, CGW-5; SIS-1, SIS-2; ADM-2.

---

## 18. Notable gaps in today's implementation (to close)

> **Status:** most of this section has since been closed. See
> [`NOTIFICATION_BACKEND_AUDIT.md`](./NOTIFICATION_BACKEND_AUDIT.md) for the full audit and
> §9 of that document for what shipped.
>
> **Closed:** 18.1 write-first persistence · 18.2 per-user broadcast read state ·
> 18.3 auth on the send routes (plus an inbox ownership check) · 18.4 routing target persisted ·
> 18.6 the report pipeline now emits · 18.7 per-user dedupe on cron sends ·
> 18.8 `SERVICE_REPORT` retargeted and rewritten · 18.9 disciplinary copy rewritten ·
> 18.10 per-category channel, priority, sound and a real badge · 18.11 token lifecycle ·
> 18.16 indexes and a TTL.
>
> **Still open:** 18.5 email-only events · 18.12 dead and disabled paths ·
> 18.13 delivery observability · 18.14 tenant scoping · 18.15 preferences and fallback ·
> 18.17 `socket.io`.

Verified against `cozapp_v3` as at the time of writing. Ordered by blast radius — 18.1–18.3
were foundational or security-affecting.

### 18.1 Persistence is coupled to push success 🔴
`saveNotificationToDatabase` runs only when `userId && results.successful > 0`
(`expoPushNotificationService.js:284`). A user with no registered device, a revoked OS
permission, or a transient Expo failure gets **no inbox row at all**. The inbox is a log of
successful pushes, not of events — which makes every "the user can always find it in-app"
promise in this document false today. **Fix first:** write the row, then deliver. (INFRA-3)

### 18.2 Broadcast read-state is shared across users 🔴
A broadcast is one document with `userId: null`. `markNotificationAsRead` and
`markAllNotificationsAsRead` match it and flip `isRead` on that shared row
(`notificationController.js:252, 290`), so one user reading a broadcast marks it read for
**everyone**, and every other user's unread count is wrong. Needs per-user read receipts.
(INFRA-3)

### 18.3 Two send endpoints are unauthenticated 🔴
`POST /notification/general` and `POST /notification/generic/:userId` have `verifyToken`
commented out (`routes/notification.route.js:8, 13`). Anyone who can reach the API can push to
every activated user. Separately, `getUserNotifications` never checks that the authenticated
caller owns the `:userId` in the path — any valid token reads any inbox.

### 18.4 Routing target dropped at save
Only `title`, `message`, `type` are persisted (`expoPushNotificationService.js:469-476`). The
push carries `data.url` + `data.content._id`; the stored row carries neither, so the same
notification routes correctly from the tray and nowhere from the inbox. (INFRA-3)

### 18.5 Email-only events never reach the inbox
SendGrid sends — permission decisions, campus tickets, contest threads, password/OTP mail, QR
delivery — create no `Notification` row. Roughly half of what the system tells users is
invisible in-app. (INFRA-3)

### 18.6 The report pipeline emits nothing
`transitionReport` (`gHController.js:210`) audits the transition and returns. No submission,
approval, change-request, or final-approval notification exists — REP-1…REP-7 are entirely
unbuilt, and this is the single highest-value wiring point in the codebase. Recipient
resolution must handle **headless departments** and use the returned `awaitingRole` (§8).

### 18.7 No dedupe on cron-driven notifications
`campusServiceClockInJob` and `campusServiceClockInSummaryJob` run every 10 minutes across the
window; nothing suppresses a repeat for the same worker and service. (INFRA-5)

### 18.8 `SERVICE_REPORT` is misfired and generically worded
`POST /report/viewed` fires the "send in your report, submit immediately" push when a report is
**viewed** (`reportController.js:4007`) — nonsense to the recipient. That handler also resolves
the user with `findOne({ id: submittedBy })` against a schema with no `id` field, so it returns
404 before sending at all. The copy names no service, department, or deadline.

### 18.9 Disciplinary copy is inappropriate
`"you've just been issued a ticket. We celebrate you."` and `"Celebrate you! <name> has just
been issued a ticket."` read as sarcasm to someone being sanctioned, and the second announces a
colleague's discipline to another user. Rewrite per §3.3 and §3.6.

### 18.10 Push payload constants are wrong for most types
Every message ships `badge: 1`, `priority: 'high'`, `sound: 'default'`, `channelId: 'default'`
(`expoPushNotificationService.js:76-86`). The badge is meaningless, everything interrupts at the
same volume, and there is one Android channel, so users cannot mute summaries without muting
clock-in reminders. `notification.image` is set by every caller and **silently dropped** — no
image ever reaches a device.

### 18.11 Token lifecycle is half-wired
The `DeviceNotRegistered` branch is an empty stub (`expoPushNotificationService.js:271`), so
tokens from uninstalled apps stay active indefinitely. `handlePushNotificationReceipts` is
fully implemented but **never called**, so asynchronous delivery failures are never observed.
Logout deletes by `expoPushToken` while registration keys on `deviceId`, so a rotated token
orphans a device that keeps receiving. (INFRA-11)

### 18.12 Dead and disabled paths
`sendClockOutSummaryPN` — defined, call site commented out (`cron-services.js:205`).
`notifyPastorOnDormantWorkersJob`, `generateUserStatusReport`, `inactiveWorkersJob`,
`cgwcServiceJob` — all commented out of `cronServices.start()`.
`userStatusCronService.initializeJobs()` — commented out in `server.js`.
`CGWCController.createInstantMessage` — stores the message, never pushes it.
Each is either a notification users expect and don't get, or code that should be deleted.

### 18.13 No delivery observability
Nothing records what was sent, to whom, on which channel, or whether it arrived. Expo tickets
and receipts are computed and discarded. There is no way to answer "did the GH ever get told?"
(INFRA-7, INFRA-10)

### 18.14 No tenant scoping
Token and recipient queries filter by role, department, campus, and group — never by
`tenantId`/`subTenantId`. Cross-tenant leakage is possible by construction. (INFRA-8)

### 18.15 No preferences, quiet hours, or fallback
Every user gets everything, at any hour, on whatever channel the trigger happens to use; a
failed push for a P0 item is not backstopped by email. (INFRA-1, INFRA-2, INFRA-4)

### 18.16 Inbox scale
The `Notification` schema declares no indexes, so every inbox read and unread count is a
collection scan over a collection that only grows. No retention policy exists. (INFRA-3.7)

### 18.17 `socket.io` is a dependency and nothing else
Installed, never initialised. Real-time in-app delivery is available for the cost of wiring it.
(INFRA-12)

---

### Suggested order of work

1. **Foundation (unblocks everything):** 18.1 write-first persistence · 18.4 persist routing target · 18.2 per-user read receipts · 18.16 indexes.
2. **Security:** 18.3 auth on send routes + inbox ownership check · 18.14 tenant scoping.
3. **Trust:** 18.8/18.9 copy fixes · 18.10 per-category channel, priority, sound · 18.7 dedupe.
4. **Coverage:** 18.6 report pipeline (REP-1…REP-7) · ATT-2/ATT-3/ATT-5 attendance outcomes · ticket contests and campus tickets · 18.12 revive or delete.
5. **Control & insight:** INFRA-1 preferences · INFRA-2 quiet hours · INFRA-7 delivery tracking · INFRA-6 digests.
6. **Polish:** INFRA-12 real-time · INFRA-13 copy registry · INFRA-9 localization.

---

## 19. Deep-link map (every notification → destination)

For great UX, **tapping a notification must land the user on the exact screen where they
act on it** — never a generic home screen or a dead end.

### 19.1 Conventions

**The wire contract already shipped — build on it, don't replace it.** The backend sends
`data.url` (a route path) plus `data.content._id` (the entity id); mobile consumes exactly that
today for permissions and tickets. There is no `deepLink` field and no custom scheme. Extend
this shape rather than inventing a parallel one:

```jsonc
"data": {
  "type": "REPORT_CHANGE_REQUESTED",
  "url": "/reports/review",            // route path, mobile-owned vocabulary
  "content": {                          // entity refs — _id plus whatever the screen needs
    "_id": "665f…",
    "reportType": "ChildCareReport",
    "reviewCommentId": "…"
  },
  "category": "reports",               // for filtering + preferences (INFRA-1)
  "timestamp": "…"                      // injected by the push service
}
```

- **Report targets always pair `_id` with `reportType`** — ids are only unique within a collection (§8).
- **Persist the target, not just the type:** the same `url` / `content` / `category` must be written to the `Notification` row, or inbox taps go nowhere (§18.4).
- **Mobile owns the route vocabulary.** The two shipped values are `/permissions/permission-details` and `/tickets/ticket-details`; the rest are for mobile to specify before the type is emitted.
- **Auth-gate on open:** resolve the link against the user's current role/scope at tap-time; if they no longer have access (transferred dept, role changed), route to the nearest permitted parent screen with an explainer — never a blank error.
- **Graceful fallback:** if the entity was deleted/retracted/merged, land on the list/parent screen with a toast ("This ticket was retracted") instead of a crash.
- **Action affordance:** links to actionable items deep-link **with the primary action surfaced** (e.g. approve/reject buttons, contest field, clock-in CTA), not just a read-only view.
- **Security/OTP items** (USR-1/3/4/5) deep-link to the relevant flow screen but **never embed the secret** in the link — the code stays in the secure channel only.

### 19.2 Attendance

| Story | Tap destination | Entity refs / params |
|---|---|---|
| ATT-1 Clock-in window opening | Clock-in screen for the service, CTA ready; "request permission" shortcut | `entityType=CampusService`, `campusServiceId`, `serviceId` |
| ATT-2 Clock-in confirmation/status | My attendance detail for that service | `entityType=Attendance`, `attendanceId`, `serviceId` |
| ATT-3 Clock-in/geofence/QR failure | Clock-in screen pre-loaded for retry, with the failure reason | `campusServiceId`, `serviceId`, `failureReason` |
| ATT-4 Clock-out reminder | Clock-out screen for the open attendance, CTA ready | `entityType=Attendance`, `attendanceId` |
| ATT-5 Marked absent | Attendance detail with appeal / late-permission CTA | `attendanceId`, `serviceId` |
| ATT-6 Team clock-in summary | Department roster filtered to *not clocked in* | `entityType=Department`, `departmentId`, `serviceId` |
| ATT-7 Team clock-out summary | Department attendance summary for the service | `departmentId`, `serviceId` |
| ATT-8 Attendance anomaly (Coordinator) | Campus dashboard, departments-by-attendance view | `entityType=Campus`, `campusId`, `serviceId` |
| ATT-9 Late-leader alert | Leader-punctuality report (digest range) | `campusId`, `dateRange` |

### 19.3 Permissions

| Story | Tap destination | Entity refs / params |
|---|---|---|
| PERM-1 Submitted (requester) | Permission detail (status timeline) | `entityType=Permission`, `permissionId` |
| PERM-2 Routed to approver | Permission **approval** screen with approve/reject + comment | `permissionId`, `requesterId`, `departmentId` |
| PERM-3 Approved / rejected | Permission detail showing decision + reviewer comment | `permissionId` |
| PERM-4 Pending-approval SLA | Approver's pending-permissions queue | `entityType=PermissionQueue`, `departmentId`/`campusId` |
| PERM-5 Expiring / expired | Permission detail with "request again" CTA | `permissionId` |
| PERM-6 Group digest (GH) | Group permissions list, filtered to the period | `entityType=DepartmentGroup`, `groupId`, `dateRange` |

### 19.4 Reports (review pipeline)

| Story | Tap destination | Entity refs / params |
|---|---|---|
| REP-1 Submitted for review | Report **review** screen (approve / request-changes) — routed to the GH, or to Campus Pastors when the department is headless | `reportId`, `reportType`, `departmentId`, `awaitingRole` |
| REP-2 → Campus Pastor | Report review screen (campus tier); reached from `GH_APPROVED` **or** a headless `HOD_SUBMITTED` | `reportId`, `reportType`, `campusId`, `awaitingRole` |
| REP-3 CP approved → GSP | Report review screen (global tier) | `reportId`, `reportType` |
| REP-4 Change requested | **Editable** report scrolled to the reviewer comment | `reportId`, `reportType`, `reviewCommentId` |
| REP-5 Final approval (GSP) | Read-only approved report + review history | `reportId`, `reportType` |
| REP-6 Overdue / not submitted | Report **drafting** screen for that dept/service/type | `reportType`, `departmentId`, `serviceId` |
| REP-7 Stuck-in-review SLA | Current reviewer's report queue / the report | `reportId`, `reportType` |
| REP-8 Department-specific cue | Drafting screen pre-set to the dept's report type | `reportType`, `departmentId`, `serviceId` |
| REP-9 Incident report raised | Incident report detail, high-priority banner | `reportId`, `reportType=IncidentReports`, `departmentId`, `campusId` |
| REP-10 Campus report readiness | Campus report summary filtered to what's blocking, grouped by `awaitingRole` | `campusId`, `serviceId` |

### 19.5 Tickets

| Story | Tap destination | Entity refs / params |
|---|---|---|
| TKT-1 Individual ticket issued | Ticket detail with **contest** action | `entityType=Ticket`, `ticketId` |
| TKT-2 Department ticket issued | Ticket detail, department scope | `ticketId`, `departmentId` |
| TKT-3 Campus ticket issued | Ticket detail, campus scope | `ticketId`, `campusId` |
| TKT-4 QC / Pastor copy | Ticket detail (oversight view) | `ticketId` |
| TKT-5 Ticket retracted | Ticket detail showing retracted state | `ticketId` |
| TKT-6 Contest filed (→QC) | Contest thread with reply box | `ticketId`, `contestId` |
| TKT-7 Contest reply (→worker) | Contest thread scrolled to the reply | `ticketId`, `contestId` |
| TKT-8 Unaddressed reminder | Ticket detail with contest CTA + deadline | `ticketId`, `deadline` |

### 19.6 Scoring

| Story | Tap destination | Entity refs / params |
|---|---|---|
| SCO-1 Service score posted | My score breakdown for the service | `entityType=AttendanceScore`, `serviceId`, `scoreId` |
| SCO-2 Rank change | Leaderboard at the user's position | `entityType=Leaderboard`, `scope`, `period` |
| SCO-3 Team scoring digest | Department scoring dashboard | `departmentId`, `period` |
| SCO-4 Delegate session points | CGWC delegate score for the session | `entityType=DelegateScore`, `cgwcId`, `session` |

### 19.7 Services & events

| Story | Tap destination | Entity refs / params |
|---|---|---|
| SVC-1 New service scheduled | Service detail (time + clock-in window) | `entityType=Service`, `serviceId`, `campusId` |
| SVC-2 Service changed / cancelled | Service detail with old→new diff / cancellation banner | `serviceId`, `campusId` |
| SVC-3 Service readiness (Coordinator) | Service setup checklist, missing config flagged | `entityType=CampusService`, `campusServiceId` |

### 19.8 User lifecycle

| Story | Tap destination | Entity refs / params |
|---|---|---|
| USR-1 Verify email OTP | Email-verification entry screen (no code in link) | `flow=verifyEmail` |
| USR-2 Account approved | Getting-started / home with onboarding checklist | `flow=onboarding` |
| USR-3 Password reset OTP | Reset-password screen (no code in link) | `flow=resetPassword` |
| USR-4 Password changed | Security settings + "wasn't me" CTA | `flow=security` |
| USR-5 Account deletion OTP | Deletion-confirmation screen (no code in link) | `flow=deleteAccount` |
| USR-6 QR code issued | My QR-code screen | `flow=myQrCode` |
| USR-7 Status change | My activity/status screen with re-engagement tips | `entityType=UserStatusReport`, `statusReportId` |
| USR-8 Dormant-worker report (CP) | Campus dormant/inactive worker list | `campusId`, `period` |
| USR-9 Blacklist / unblacklist | Account-status screen with appeal / return path | `userId`, `status` |
| USR-10 Department/campus transfer | Profile screen reflecting new dept/campus | `userId`, `departmentId`, `campusId` |
| USR-11 Profile change (HOD view) | Worker profile diff (changed fields) | `entityType=UserProfile`, `userId` |

### 19.9 CGWC

| Story | Tap destination | Entity refs / params |
|---|---|---|
| CGW-1 Announced / registration open | CGWC event detail with **register** CTA | `entityType=CGWC`, `cgwcId` |
| CGW-2 Registration confirmed / closing | Delegate registration detail | `cgwcId`, `delegateId` |
| CGW-3 Session reminder / instant message | CGWC session screen / instant-message feed | `cgwcId`, `messageId`/`session` |
| CGW-4 Feedback request | CGWC feedback form | `entityType=CGWCFeedback`, `cgwcId` |
| CGW-5 Attendance / score update | Delegate score detail | `cgwcId`, `delegateId`, `session` |

### 19.10 Sister churches

| Story | Tap destination | Entity refs / params |
|---|---|---|
| SIS-1 Sister service scheduled | Sister-service detail with clock-in window | `entityType=SisterService`, `sisterServiceId` |
| SIS-2 Sister attendance confirmation | Sister-attendance detail | `entityType=SisterAttendance`, `sisterAttendanceId` |

### 19.11 Admin & system

| Story | Tap destination | Entity refs / params |
|---|---|---|
| ADM-1 Bulk operation outcome | Operation result screen with error-report download | `entityType=BulkJob`, `jobId` |
| ADM-2 Tenant / sub-tenant change | Tenant management detail | `entityType=SubTenant`, `subTenantId` |
| ADM-3 Delivery failure / token spike | Notification health dashboard | `entityType=NotificationHealth`, `window` |
| ADM-4 Critical system event | System alert detail | `entityType=SystemAlert`, `alertId` |
| ADM-5 Targeted broadcast | The announcement detail (with audience meta) | `entityType=Notification`, `notificationId` |
