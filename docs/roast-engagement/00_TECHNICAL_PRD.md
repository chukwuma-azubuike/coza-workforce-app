# Roast Engagement System — Technical PRD

**Status:** Draft for review · **Owner:** Mobile/Platform · **Source:** *Roast —
Notifications, Reminders, Widget & Streaks* (EPIC 1–4)

---

## 1. What this is

Four capabilities that together turn Roast from a place where a worker *records*
discipleship into a place that *prompts* it:

1. **Engagement nudges** — the system tells a worker which of their assigned guests needs
   something today (EPIC 1).
2. **Custom guest reminders** — the worker tells the system what to remind them of, on a
   specific guest, at a specific minute (EPIC 2).
3. **A home-screen widget** — today's actions and the streak, visible without opening the
   app (EPIC 3).
4. **Daily engagement streaks** — a reason to come back, protected by a mid-afternoon
   warning (EPIC 4).

They share one spine: **a per-worker, per-day list of things to do, and a durable record
of whether they were done.** Nudges write into it, reminders write into it, the widget
renders it, the streak measures engagement with it. Building the four as four features
produces four half-overlapping task lists; building the spine first produces one.

That spine has a name in this document: **the Roast Task Feed**.

## 2. The critical framing: this app already has a notification platform

The Workforce app ships a complete notification stack today —
`components/NotificationsProvider.tsx` (token lifecycle, rotation, Android channels),
`store/services/notification.ts` (the durable inbox), `hooks/push-notifications/*`
(routing, unread count), `constants/notification-channels.ts` and
`constants/notification-routes.ts` (the payload and routing contracts). One Expo push
token per handset, registered against the **Workforce** API.

Roast runs against a **different backend** (`EXPO_PUBLIC_ROAST_API_BASE_URL`) with a
different auth surface and its own RTK Query service (`store/services/roast-crm.ts`).

The single most consequential decision in this PRD is that **Roast does not get a second
notification stack.** Roast's backend becomes a producer that publishes engagement events
to the Workforce Notification Service, which continues to own tokens, delivery, the
inbox, quiet hours and dedupe. Everything else in this document follows from that. The
reasoning, the alternative, and the fallback are in
[ADR-001](./01_ARCHITECTURE.md#adr-001--roast-does-not-own-a-push-transport).

## 3. Personas and scope

| Persona | Role(s) | Gets nudges? | Gets streaks? | Gets the widget? |
|---|---|---|---|---|
| **Roast worker** | Any user with ≥1 assigned guest | Yes — all types | Yes | Yes |
| **Zonal coordinator** | `zonalCoordinator` | Only for guests assigned *to them*; zone-level digests are out of scope for v1 | Yes, if they have assigned guests | Yes |
| **Pastor / admin** | `campusPastor`, `globalPastor`, `superAdmin`, `globalAdmin` | No — they are readers of the funnel, not owners of guests | No | Widget shows the signed-out/empty state |

> **Suppression rule.** A user with zero assigned guests receives no Roast nudges and no
> streak notifications, at any role. Nothing erodes trust in a notification system faster
> than a daily prompt to act on an empty list. This is a server-side filter, applied
> before the digest is composed — not a client-side hide.

## 4. Decisions

The source document lists six assumptions and two explicit open decisions. All are
resolved below, plus five more the source did not surface but that block implementation.

### D-1 · Streak qualification — **confirm "app open", but record both from day one**

Ship v1 counting an authenticated app foreground as engagement, as recommended. But the
engagement ping records `{ localDate, openedAt, qualifyingActions: [...] }` where
qualifying actions are the ones already modelled in Roast: a timeline entry
(`POST /timelines`), a reminder completion, a stage/sub-stage change, a guest capture.

Tightening later is then a server-side config flip on an existing column rather than a
migration with a data gap — and in the meantime the ratio of *open-only* days to
*qualifying* days tells us whether tightening would cost retention before we do it.

**Do not surface "app open" in the copy.** The UI says "checked in", never "opened the
app", so tightening the rule later does not make the old copy retroactively a lie.

### D-2 · Timezone and travel — **key the day on the device's local calendar date**

The client sends `localDate` (`YYYY-MM-DD`) and its IANA timezone with every engagement
ping. The server stores the set of engaged local dates per user, and:

- **Increment** when `localDate` is not already in the set.
- **Never double-count** — the set makes this structural rather than a check.
- **Break** only when *both* a full local calendar day has no entry **and** more than
  **36 hours** of wall-clock time separate the two surrounding engagement instants.

That second clause is the travel answer. A worker who engages on the 5th in Lagos, flies
east, and next engages on the 7th local has skipped a local date but lived roughly 30
hours — the streak survives. A worker who genuinely skipped a day has lived more than 36.
Flying west can produce two engagements on the same local date; the set absorbs it. See
[`02_BACKEND_SPEC.md §5`](./02_BACKEND_SPEC.md#5-streak-engine).

### D-3 · Custom reminders — **local-first delivery, server-owned record**

The source assumes "on-device scheduled notifications with server push as backup". Taken
literally that ships a double-fire: both paths succeed and the worker gets two
notifications for one reminder, which is the exact failure that teaches people to disable
a category.

Resolution:

- The **server is the record** — reminders survive reinstall, appear on a second handset,
  and are readable by the widget-snapshot builder.
- The **device is the sender** for v1. Local delivery is exact, works offline and in
  airplane mode, and costs no fan-out. Each reminder is scheduled with the deterministic
  identifier `roast-reminder:<reminderId>`, so a re-sync **replaces** rather than
  duplicates.
- **Server push is a fallback, not a backup path** — sent only to a user whose devices
  have all gone stale (no sync heartbeat within the reminder's horizon). Ships in v1.1,
  behind the receipt described in [`02_BACKEND_SPEC.md §4.4`](./02_BACKEND_SPEC.md#44-fallback-push-for-stale-devices).

⚠️ **iOS caps an app at 64 pending local notifications.** Reminders, the daily at-risk
warning, and any locally-scheduled nudge all draw on the same 64 slots, and iOS silently
drops the oldest past the cap. The client therefore runs a *budgeted* scheduler, not a
"schedule everything" loop — see [`03_MOBILE_SPEC.md §4`](./03_MOBILE_SPEC.md#4-the-local-scheduler-and-the-64-slot-budget).

### D-4 · Anti-fatigue — **one Morning Roast, one evening prompt, one at-risk warning**

The source specifies five system nudge types (call, follow-up, invite, note, progress),
each with its own timing. Delivered independently that is up to five system notifications
a day *before* custom reminders and the streak warning. Workers will mute the category
inside a fortnight, and the mute takes the reminders they actually wanted with it.

Resolution — a hard budget of **three system notifications per day**:

| Slot | Local time | Contains |
|---|---|---|
| **Morning Roast** | 08:00 | Call-due + follow-up-overdue + invite-window, composed into one notification |
| **Evening note prompt** | 20:00 | Interactions logged today without a note, composed into one |
| **Streak at-risk** | 15:00 | Only when a streak is live and today is not yet engaged |

Progress nudges (US-1.5, *Could*) ride inside the Morning Roast rather than taking a
fourth slot. Custom reminders are **exempt** — the worker asked for those by name, at that
minute, and batching them would break the promise the feature makes.

This is a change to the source's notification matrix and needs product sign-off. It does
not reduce what the system *detects*; every nudge still exists as a row in the Task Feed
and on the widget. It reduces how often the system *interrupts*.

### D-5 · US-1.1 has no data model — **derive cadence from assimilation stage**

US-1.1 ("a guest whose next call is due today") assumes a call cadence that **does not
exist in the schema**. `Guest` (`store/types/roast-crm.ts`) carries `lastContact` and a
free-text `nextAction`, and nothing else. Its third acceptance criterion — "a guest with
no scheduled call cadence is not included" — would exclude every guest in the database.

Two options, and the second is recommended:

1. Add `callCadenceDays` to the guest and make workers set it. Correct, and nobody will
   fill it in.
2. **Derive a default cadence from the assimilation stage**, overridable per guest.

Proposed defaults, to be confirmed with the discipleship team:

| Stage | Default cadence |
|---|---|
| `INVITED` | every **2** days |
| `ATTENDED` | every **4** days |
| `BEING_DISCIPLED` | every **7** days |
| `ASSIMILATED` | none — no call nudges |

`nextCallDueAt` is then computed as `lastContact + cadence` and stored on the guest so it
is indexable, with a per-guest `callCadenceDaysOverride` for the worker who wants to say
"call this one weekly". US-1.1's exclusion clause survives intact: `ASSIMILATED`, and any
guest whose override is `null`, are excluded.

### D-6 · Frequency guards — **receipts, not timestamps**

Every nudge writes a `RoastNudgeReceipt` keyed on a deterministic
`dedupeKey` (e.g. `note:<timelineId>`, `invite:<eventId>:<workerId>`,
`streak-risk:<userId>:<localDate>`). "Once per interaction", "once per event", "once per
change" and "once a day" all become a unique index rather than four bespoke checks. This
is the same discipline as `INFRA-5` in the Workforce catalog and should reuse it.

### D-7 · Widget — **native on both platforms, one snapshot contract**

React Native cannot render an OS widget. iOS uses WidgetKit/SwiftUI via a config plugin;
Android uses `react-native-android-widget`. Both read **only** a locally-written JSON
snapshot in shared storage — a widget never touches the network. Full reasoning,
including why the two platforms use different approaches, in
[`04_WIDGET_SPEC.md`](./04_WIDGET_SPEC.md).

Two consequences product needs to hear now:

- **The widget cannot ship over-the-air.** It is native code in the binary. A widget fix
  is a store release, not an `eas update`.
- **The widget is near-live, not live.** iOS budgets reloads; the honest ceiling is
  "within about 15 minutes, plus immediately after app use". The design leans on WidgetKit
  *timelines* to make due/overdue counts flip at the right minute without spending
  refresh budget — see [`04_WIDGET_SPEC.md §5`](./04_WIDGET_SPEC.md#5-the-ios-timeline-trick).

### D-8 · Mark-done from a notification — **iOS in v1, Android in v1.1**

US-2.3 wants completion without opening the app. On iOS this is a notification action with
`opensAppToForeground: false` and a background handler — genuinely no app launch. On
Android, `expo-notifications` has no first-class background response handler; doing it
properly needs a small native `BroadcastReceiver`.

v1 ships iOS true-background and Android open-app-and-complete (a ~1s launch into a
completion route that shows a toast and returns). v1.1 adds the Android receiver. The
fallback is honest and matches the graceful-degradation posture the source already takes
for widget interactivity.

### D-9 · Grace day (US-4.6) — **recommend shipping it, in v1.5**

The source asks for a decision. Recommendation: **one earned grace day per 10 engaged
days, maximum two banked, spent automatically.** Strict resets feel honest to the person
designing them and punitive to the person on day 41 who was in hospital. The grace day is
what makes a long streak worth starting.

Two guardrails: spending a grace day is **announced** ("Your streak was saved — 1 freeze
left"), never silent, or it reads as a bug; and `longestStreak` is computed on the same
rules, so a saved streak is a real record.

### D-10 · Lock-screen privacy — **first name only, with a full-privacy option**

Guest names appear in notification bodies ("Emeka is due for a call today"). Those bodies
render on a lock screen, on a shared campus handset, next to a church member's real name
and an implicit statement about their spiritual journey.

Default: **first name only** in push bodies and on the widget. Full name appears only
inside the app, behind auth. Preferences carry a `hideGuestNames` switch that swaps every
body to a count ("1 guest is due for a call"). This is a small amount of work now and a
category of incident avoided.

### D-11 · Roast notifications share the Workforce inbox and bell

There is one bell (`components/composite/notification-bell`), one unread count
(`hooks/push-notifications/useUnreadNotifications.ts`), one inbox. Roast rows land in it
with `category: 'ROAST_*'`. The Roast tab's own screen (`/roast-crm/notifications`,
currently a `return null` stub) becomes the **Today** view — the Task Feed, not a second
inbox — and the inbox stays where users already look for it.

## 5. Out of scope for v1

Named so nobody plans around them:

- **Zone- and campus-level engagement digests** for coordinators and pastors.
- **US-1.3's completion criteria** — "already logged an invite for that event" needs an
  event calendar and an invite log, neither of which exists. v1 ships the nudge on a fixed
  Sunday/Wednesday schedule with no per-event suppression; the source already flags this.
- **In-notification reply / quick-log** (logging a call directly from the tray).
- **Web or desktop surfaces** for reminders.
- **Leaderboard integration for streaks.** Streaks are personal; making them competitive
  changes the incentive from faithfulness to attendance and needs its own product
  conversation.
- **Localisation.** English only, consistent with the rest of the app today.

## 6. Success metrics

Instrumented from day one, reviewed at 2 and 8 weeks. Baselines to be captured in the two
weeks before launch.

| Metric | Definition | Target |
|---|---|---|
| **Nudge → action rate** | Nudges opened that produce a timeline entry within 2h | ≥ 25% |
| **Reminder completion rate** | Reminders marked done before their next-day rollover | ≥ 60% |
| **Follow-up latency** | Median days between guest interactions, per active worker | −30% vs. baseline |
| **Stagnant guest rate** | Assigned guests with no contact in 14 days | −40% vs. baseline |
| **D7 / D30 streak retention** | Workers with a live streak ≥ 7 / ≥ 30 days | 35% / 12% |
| **Widget adoption** | Workers with ≥1 widget installed | ≥ 20% by week 8 |
| **Opt-out rate** | Workers who disable ≥1 Roast category | **≤ 8%** — the guardrail metric |
| **Notification volume** | System notifications per worker per day, p95 | **≤ 3** — enforced, not just measured |

The last two are guardrails: if opt-out passes 8%, the volume budget in D-4 is wrong and
tightens before any new nudge type ships.

## 7. Open questions for product

1. **D-4's three-slot budget** collapses five nudge types into two digests. Confirm.
2. **D-5's cadence defaults** (2 / 4 / 7 days) need the discipleship team's numbers.
3. **Digest send times** — 08:00 and 20:00 local. Are these right for a Nigerian
   weekday? Is Sunday different?
4. **D-9's grace mechanic** — approve for v1.5, or reject in favour of strict resets?
5. **Minimum OS for widget interactivity.** iOS deployment target is 15.1 today
   (`app.json` → `expo-build-properties`); interactive widgets need iOS 17. Confirm we
   accept deep-link fallback for 15–16, or raise the target.
6. **Does a coordinator want zone-level nudges?** Explicitly out of v1 — confirm that is
   acceptable rather than a gap.
