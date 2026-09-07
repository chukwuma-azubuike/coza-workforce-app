# COZA Global — Mobile Notification Integration Guide

> **Audience:** Mobile team (iOS / Android / Expo).
> **Scope:** the complete contract for the notification system on mobile — push token
> registration, OS permissions, the real payload shape, tap routing, the in-app notification
> centre, badge sync, and preferences.
> **Companion doc:** product user stories in `NOTIFICATION_USER_STORIES.md`.
> **Status:** verified against `feat/notifications` (PR #1331, merging into `cozapp_v3`).
> Every "shipped" claim below is anchored to a file and line. Anything marked **planned** does
> not exist yet — do not build against it.
> **Cross-checked against the app** at `feat/notifications_v2` / `32014750`: the route tables in
> §4.1 and the client-side gaps in §5 come from a read of the mobile repo, not from assumption.

---

## 0. What changed since the first draft of this doc

The first draft asked mobile ~23 open questions. Most are now **answered by shipped code**
and are no longer open. Read this section first if you have the old version.

⭐ **New work for mobile since the last revision**, in the order it bites:

1. **Listen for push-token rotation** (`addPushTokenListener`) and re-POST the token. There are
   zero such listeners in the app today and registration is a `[]`-dependency effect, so a user
   who stays signed in silently stops receiving notifications when Expo rotates their token.
   Highest-impact item on this list — see §5.
2. **Call logout unconditionally.** It now accepts `deviceId` when no push token is available,
   so the early-return in `hooks/auth/index.ts` has somewhere to go — see §5.
3. **Read the refreshed access token** off the `Authorization` response header on all sixteen
   services, not just `gsp-dashboard` — see §2.
4. **Create the nine Android channels** in §4.2 — read the ship-order rule there first.
5. Read `data.category` / `data.priority`, expect `sound` to be absent on low-priority
   messages, and pass `content.reportType` back when opening a report.

Inbox rows carry `url` and `content`, so inbox taps route just as precisely as tray taps.

| Was an open question | Answer today |
|---|---|
| Link construction: does the backend send a `deepLink`? | **No — and it never did.** The backend already ships a different, working contract: `data.url` (a route path) + `data.content._id` (the entity id). See §6. Treat `url`/`content` as the contract; there is no `deepLink` field. |
| Is there a mark-all-read endpoint? | **Shipped.** `PATCH /api/notification/read-all/:userId` (`routes/notification.route.js:38`). |
| Is there an unread-count endpoint? | **Shipped.** `GET /api/notification/unread-count/:userId` (`routes/notification.route.js:44`). |
| Are the inbox routes authenticated? | **Yes**, and they now enforce ownership too — `:userId` must be the caller. The two *send* routes are authenticated **and admin-only**. See §2.1. |
| Can broadcasts be marked read? | **Yes, per user.** Read state for a broadcast lives in a per-user receipt, so one worker reading it does not mark it read for anyone else. The `isRead` you get back is computed for the requesting user. See §8.2. |
| Is push-image supported? | **Yes**, as `richContent.image`. Renders on Android; iOS needs a Notification Service Extension on your side to display it. |
| Does `badge` reflect unread count? | **Yes.** `badge` carries the recipient's real unread count at send time. `LOW` priority messages omit it deliberately. Keep the unread-count endpoint as the source of truth after any in-app read. |

Still open for mobile: the **OPEN** items in §4, and the three lifecycle fixes in §5.

---

## 1. System overview

```
                    ┌──────────────────────────────────────────────┐
   Domain events    │  Backend (Node/Express + MongoDB)            │
   (clock-in cron,  │                                              │
    permission,     │  • Trigger builds a payload                  │
    ticket) ────────┼─▶ • Notification doc saved FIRST, always     │
                    │  • Expo push, best-effort, built from the    │
                    │    rows that saved ─────────────────────────┼──▶ Expo Push Service ──▶ device
                    │    (never pushed if not persisted — §8.3)   │
                    │  • SendGrid email (separate path, no inbox   │
                    │    row) ─────────────────────────────────────┼──▶ email
                    │  • DeviceToken upserted per (userId,deviceId)│
                    └──────────────────────────────────────────────┘
                                      ▲                       │
                                      │ register token        │ inbox / read / unread-count
                                      │ (POST addDeviceToken) │
                                      └───────────────────────┴── Mobile app
```

**Backend components in place**
- **Push:** Expo Server SDK — `services/expoPushNotificationService.js`. Batches of 100, exponential-backoff retry (3 attempts), receipt fetching, invalid-token deactivation. Firebase is fully removed; the `DeviceFcmToken` model name and `fcmToken` field are legacy naming only.
- **In-app store:** `Notification` model (`models/mongoDB/notification.js`) + 4 endpoints (§8).
- **Device tokens:** `DeviceFcmToken` model (`models/mongoDB/createDeviceToken.js`), upserted via `POST /account/addDeviceToken`, deleted via `POST /account/logout`.
- **Email:** SendGrid via `config/emailTemplate/email.template.js` (~60 templates). Email sends do **not** create inbox rows — see §8.4.
- **Trigger sources:** the cron jobs in `services/cron-services.js` and three controllers (`permissionController`, `ticketController`, `reportController`). That is the *entire* set of push emitters today — §6.1.

---

## 2. API conventions

- **Base URL:** everything is mounted under `/api`. `user-status` routes are mounted at `/api/user-status`.
- **Auth:** `Authorization: Bearer <token>`. When the access token is expired but the refresh
  token is valid, the backend issues a fresh token in the **`Authorization` response header** of
  that same request — read it off every response and persist it (`utils/tokenisation.js`).

  ⚠️ **This is implicit, not an endpoint.** There is no `verifyToken` route to call; it is
  middleware on every authenticated request, and the response header is the only signal. Today
  `baseQueryWithTokenRefresh` reads it on **1 of 16 services** (`gsp-dashboard`) — the other
  fifteen call `prepareHeaders`, send the stored token and discard whatever comes back. The
  refresh succeeds server-side, the rotated token is returned, and the app keeps presenting the
  old one until it expires.

  **Symptom to check for:** users signed out roughly one token-lifetime after login regardless of
  activity, not reproducible for anyone testing the GSP dashboard, and nothing in the server logs
  because from the backend's point of view the refresh worked. **Fix:** promote
  `baseQueryWithTokenRefresh` to the default for all sixteen services — one line each, and safe
  regardless, since the capture is wrapped in its own try/catch and cannot affect the result.
- **Response envelope** for all notification/auth endpoints:
  ```json
  { "status": 202, "message": "…", "isError": false, "isSuccessful": true, "data": { } }
  ```
  Older endpoints elsewhere in the API use `{ err, msg, data }`. Be tolerant of both.

### 2.1 ✅ Send endpoints are now authenticated and admin-only

`POST /api/notification/general` and `POST /api/notification/generic/:userId` require a valid
token **and** one of `SUPER_ADMIN_ROLE`, `GSP_ROLE`, `GLOBAL_ADMIN_ROLE`. A worker calling
either gets **403**. Do not call them from the worker app.

The inbox routes enforce ownership: `:userId` must be the caller. `SUPER_ADMIN_ROLE` and
`GLOBAL_ADMIN_ROLE` may *read* another user's inbox; nobody may mark another user's
notifications read. Mismatched ids get **403**, not an empty list.

---

## 3. Division of responsibility

**Backend owns:** the `type` taxonomy and when each fires / to whom · the `url` + `content`
routing fields · persisting inbox rows · Expo delivery and token validity.

**Mobile owns:** OS permission UX · Expo token retrieval, refresh, and logout · the route
table that resolves `data.url` · Android channels, foreground presentation, badge · the
notification-centre UI and (later) preferences.

---

## 4. Routing, channels and infrastructure — settled and outstanding

Most of this section used to be open questions. Mobile has since answered them from a read of
the app repo, and the answers are folded in below. What is left is marked **OPEN**.

### 4.1 Deep-link paths

A wrong path string fails silently in both directions: nothing throws on the backend, nothing
throws in the app, and the user sees a tap that goes nowhere. That is why these are checked
literally rather than read for plausibility.

**How a tap is routed** (`hooks/push-notifications/useNotificationObserver.ts:11–20`) — there is
no lookup table and no validation step:

```ts
const pathname = notification.request.content.data?.url;
const params   = notification.request.content.data?.content;

if (pathname && typeof params === 'object') {
  router.push({ pathname, params });
} else {
  router.push('/');
}
```

Three consequences the backend designs around:

- `data.url` is the path, `data.content` is the params object. Both live **under `data`**, not
  at the top level of the push message.
- **`data.content` must be an object or the path is discarded.** The guard covers the whole
  condition, so a `url` with no `content` lands the tap on `/` even when the path was perfect.
  The backend therefore **always** sends `content`, using `{}` for destinations that take no
  params. See §6.
- **Route group folders never appear in a path.** `(stack)`, `(tabs)` and `(auth)` are Expo
  Router groups. The path is `/reports/service-report`, never `/(stack)/reports/service-report`.

**Validation rule.** A path is valid if and only if it appears in the generated route union,
which is regenerated on every build and is the single source of truth:

```bash
grep -o '`[^`]*`' .expo/types/router.d.ts \
  | tr -d '`' | grep '^/' | grep -v '\${' | sort -u
```

**Status of the eight paths the backend emits** (`config/notificationCatalog.js`):

| `url` emitted | Types using it | Status |
|---|---|---|
| `/permissions/permission-details` | `PERMISSION_CREATED`, `PERMISSION_SUBMITTED`, `PERMISSION_STATUS` | ✅ verified against the route union |
| `/tickets/ticket-details` | all 7 `*_TICKET_*` types | ✅ verified against the route union |
| `/notifications` | `GENERAL_NOTIFICATION` | ⚠️ **resolves but renders nothing** — see below |
| `/reports/report-details` | the other 5 `REPORT_*` types | ❌ **route does not exist** — blocked, see §4.1.1 |
| `/attendance/clock-in` | `CLOCK_IN` | **OPEN** — not in the tables mobile published; needs a literal diff |
| `/attendance/clock-out` | `CLOCK_OUT` | **OPEN** — same |
| `/attendance/department-summary` | `CLOCK_IN_SUMMARY`, `CLOCK_OUT_SUMMARY` | **OPEN** — same |
| `/reports/my-reports` | `REPORT_DUE` | **OPEN** — the reports index is `/reports`; confirm or correct |

**`/notifications` is a dead end today.** The route resolves, so it never 404s and never logs an
error — the screen component just returns an empty fragment
(`app/(stack)/notifications/index.tsx:3–5`). The real 164-line screen sits unused at
`views/app/notifications/index.tsx`, and the only UI entry point is commented out
(`views/app/home/group-head/gh-top-bar.tsx:54`). **Mobile: wire the route to the existing view.**
Until that ships, tell the backend and `GENERAL_NOTIFICATION` will route somewhere else.

Each correction is a one-line change in `config/notificationCatalog.js`; no other file moves.

**Answered, no longer open:** the backend emits a **bare path**, not a scheme — say the word if
you need a fully-qualified `cozaapp://` href and the backend will build it rather than the
client. The id arrives as `data.content._id`, not interpolated into the path.

#### 4.1.1 ❌ Report routes are blocked on a product decision

The backend assumed one polymorphic detail route taking a `reportType` param. The app has
**thirteen distinct report routes** instead — `/reports/service-report`,
`/reports/attendance-report`, `/reports/campus-report`, `/reports/childcare-report`,
`/reports/guest-report`, `/reports/incident-report`, `/reports/internship-report`,
`/reports/protocol-report`, `/reports/pru-report`, `/reports/security-report`,
`/reports/transfer-report`, `/reports/welfare-report`, `/reports/witty-report` — plus
`/gh-approvals/report-detail` for the approver's view.

This is not a typo to fix. Three questions have to be answered first:

1. **Whose screen does a report notification open?** `REPORT_AWAITING_REVIEW` goes to an
   approver; `REPORT_CHANGE_REQUESTED` goes back to the submitter. Same report, two audiences.
   Is the approver's tap `/gh-approvals/report-detail` and the submitter's `/reports/<type>-report`?
2. **If it is `/reports/<type>-report`, confirm the mapping.** The backend holds `reportType` as
   the registered Mongoose model name — `AttendanceReport`, `ServiceReport`, `CampusReport`,
   `ChildcareReport`, `GuestReport`, `IncidentReport`, `TransferReport`, `SecurityReport`,
   `WelfareReport`, `PruReport`, `ProtocolReport`, `WittyReport`, `InternshipReport`. If that is a
   clean kebab-case transform to the route names, the backend implements it as a lookup. If any
   pair diverges, send the exceptions.
3. **Do those screens accept a report id as a param**, or do they load the current user's own
   report for the period? If the latter, deep-linking to a specific report is not possible and the
   backend should route to `/reports` and let the user pick.

Until this is settled the backend sends the catalog value as-is. **Do not build report deep-link
handling against `/reports/report-details`.**

**Also settled:** `/gh-tab-approvals` (tab) and `/gh-approvals` (stack) both resolve, but the
stack route is the right notification target — a tap should open a dismissable screen, not drop
the user into the tab bar.

### 4.2 Android channels — client-side, and they must ship first

On Android 8+ a notification posted to a channel ID the device has never created is **dropped by
the system**. No error reaches the app and no error reaches the Expo receipt. Silent, exactly
like a bad path.

⚠️ **Ship order matters, and the backend is already gated for it.** Channels are created by the
app but selected by the payload, so neither half works alone — and a channel only exists once a
build declaring it has run on the device. The backend therefore sends `channelId: "default"` for
every push until `NOTIFICATION_CHANNELS_ENABLED=true` is set, which will not happen until you
confirm a build with these channels is live. **Expect `default` in every payload today.** Do not
read that as the per-category channels being broken.

Today the app creates exactly one channel (`components/NotificationsProvider.tsx:27–33`) and
`app.json:88–92` still declares `"defaultChannel": "default"`. Both change alongside the nine
below, or the fallback quietly re-absorbs everything.

**The agreed channel set.** Mobile proposed seven, the backend added two; renaming a channel
after release strands users on the old one, so these IDs are the contract:

| `channelId` | Shown to user as | Importance | Covers |
|---|---|---|---|
| `attendance` | Clock in & out | HIGH | `CLOCK_IN`, `CLOCK_OUT` |
| `attendance-summary` | Attendance summaries | DEFAULT | `CLOCK_IN_SUMMARY`, `CLOCK_OUT_SUMMARY` |
| `reports` | Reports | HIGH | the `REPORT_*` family |
| `permissions` | Permission requests | HIGH | `PERMISSION_*` |
| `tickets` | Tickets | HIGH | all 7 `*_TICKET_ISSUED` types |
| `congress` | Congress & CGWC | HIGH | congress sessions, instant messages (planned) |
| `announcements` | Announcements | DEFAULT | `GENERAL_NOTIFICATION` |
| `account` | Account & security | HIGH | password, profile and security events (planned) |
| `default` | General | DEFAULT | fallback, and everything until the flag flips |

The user-facing names matter more than usual: Android surfaces them verbatim in system settings,
where each becomes an individually mutable switch. `attendance-summary` is split from
`attendance` precisely so a worker can silence the daily digest without silencing their own
clock-in reminder. `account` is separate so a security notification cannot be muted along with
announcements.

**On importance:** it is a per-channel ceiling the user can lower but the payload cannot raise,
so setting everything to MAX defeats the point of splitting channels. The backend's own
`data.priority` (`CRITICAL | HIGH | NORMAL | LOW`) varies underneath these ceilings —
`HIGH`/`CRITICAL` are sent with Expo `priority: "high"` and `sound: "default"`, `NORMAL`/`LOW`
are sent silent. Note `tickets` sits at HIGH rather than MAX: four of the seven ticket types are
`NORMAL` on the backend (retractions and the QC/pastor copies).

**OPEN:** foreground behaviour — banner, in-app toast, or silent + badge, per category if it
differs.

### 4.3 Push infrastructure — answered

| Question | Answer |
|---|---|
| Expo project ID | `506eebf2-6601-409a-9b25-5469fb6e6695` (`app.json:106`), one project across all variants. Resolved at runtime from `expoConfig.extra.eas.projectId`. |
| Token type | Always `ExpoPushToken[…]`. `getExpoPushTokenAsync()` exclusively; the old `getActualFCMToken` helper is gone. Send via Expo, not FCM/APNs directly. |
| `deviceId` source | Android `Application.getAndroidId()` (stable until factory reset, scoped per signing key). iOS `Application.getIosIdForVendorAsync()` (**resets on reinstall**). See §5. |
| APNs environment | Token requests pass `development: ENV !== 'production'`, so dev/preview builds mint **sandbox** tokens and only production builds mint production ones. A staging handset will not accept a production push, and it surfaces only in the Expo receipt — check this first whenever a token "silently stops working" in testing. |
| iOS Notification Service Extension | **No.** One iOS target, no `UNNotificationServiceExtension`, no config plugin adding one. `richContent.image` is inert on iOS regardless of payload, even with `mutable-content: 1`. |

**OPEN:** minimum iOS / Android / Expo SDK versions to target.

**OPEN — decide, do not drift:** adding an NSE is real work (a new Xcode target, its own bundle
ID and provisioning profile, an app group, and a config plugin so `prebuild` does not wipe it).
Either scope it deliberately or say so and the backend stops sending `richContent.image`.

**Android brand imagery is close but unfinished:** `app.json:88–92` sets
`"icon": "./assets/images/icon.png"` with no colour. Android renders the small icon as a flat
silhouette, so the full-colour app icon shows as a white blob. It needs a dedicated
monochrome-with-transparency asset plus an accent colour — brand purple `#2D0060`.

**Cleanup:** the registration payload type still carries an optional `fcmToken?: string`
(`store/services/account.ts:113–120`) that nothing populates. The backend accepts it for old
installs but filters it out before send. Drop it from your types.

### 4.4 Preferences & quiet hours — OPEN

1. **Quiet hours** are a **server-side global**: non-critical pushes are held between 21:00 and
   06:00 Africa/Lagos while the inbox row still lands immediately. Should this be per-user, and
   should the device timezone win over Lagos? (`QUIET_HOURS_ENABLED=false` disables it entirely.)
2. **Preferences screen:** do you want per-category × per-channel toggles (INFRA-1)? If so,
   confirm the togglable category list so the backend can shape the API. Safety categories are
   never togglable (§9).

**Answered by the rebuild, no longer open:** badge carries the recipient's real unread count;
`sound` is omitted on `NORMAL`/`LOW`; per-category channels and priorities are shipped (gated per
§4.2); inbox rows carry `url` and `content` so inbox taps route exactly like tray taps.

---

## 5. Device token lifecycle

Three separate things have to be right: **register**, **re-register on rotation**, and **delete
on logout**. Only the first is correct in the app today.

| | Status | Where |
|---|---|---|
| Register | ✅ works | `components/NotificationsProvider.tsx:80–97` |
| Re-register on rotation | ❌ **missing** | no `addPushTokenListener` anywhere in the repo |
| Delete on logout | ⚠️ **skippable** | `hooks/auth/index.ts:20–38` |

### 5.1 Register

**Endpoint:** `POST /api/account/addDeviceToken` — no auth today (`routes/auth.route.js:186`).
Login (`POST /api/account/login`) accepts the same fields alongside the credentials and does the
identical upsert, so either entry point works.

```json
{
  "email": "worker@example.com",       // required — identifies the user
  "deviceId": "stable-device-uuid",    // required — upsert key with userId
  "expoPushToken": "ExpoPushToken[…]", // preferred
  "fcmToken": "…",                     // legacy; one of expo/fcm required
  "platform": "ios",                   // optional: "ios" | "android" | "web"
  "appVersion": "2.2.18"               // optional, but wanted for debugging
}
```

**Behaviour** (`controllers/authController.js`)
- **Idempotent upsert on `(userId, deviceId)`**, backed by a unique compound index.
  Re-registering the same device replaces the token in place — re-POSTing on every rotation
  will **not** fan out duplicate sends to one handset.
- If `expoPushToken` is present it wins: `tokenType = "EXPO"`, copied to the unified `pushToken`
  field. `fcmToken` is retained alongside if you send both, but is filtered out before send.
- Re-registering flips `isActive: true` and refreshes `lastVerified` — **this is how a device
  deactivated by a failed send heals itself.**
- ✅ **Registration claims the handset.** A sign-in now detaches the device from any other user
  by `deviceId` *and* by token. Previously only a matching token was detached, which missed the
  common case: previous user logged out badly, the app has since minted a fresh token, same
  phone. This makes correct behaviour on a shared campus phone the default even when a logout is
  missed entirely — but it only fires when somebody else actually signs in, so still call logout.
- `202` with `{ tokenType, platform, isActive }` · `404` unknown email · `422` invalid email or
  neither token supplied.

**Multi-device is fully supported** — one row per `deviceId`, all active rows receive pushes.

### 5.2 ⭐ Re-register on rotation — the quiet killer

Registration currently runs inside a `useEffect` with an empty dependency array, so it fires once
per provider mount — at login and on cold start, and never again:

```ts
useEffect(() => {
  (async () => {
    const expoPushToken = await registerForPushNotificationsAsync();
    const deviceId = await getDeviceId();
    if (deviceId && expoPushToken) { await addDeviceToken({ … }).unwrap(); }
  })();
}, []);   // components/NotificationsProvider.tsx:80–97
```

A user who stays signed in and never force-quits stops receiving notifications the moment Expo
rotates their token, **with no symptom on either side**: the backend keeps accepting the send,
Expo returns `DeviceNotRegistered` in a receipt, and the user assumes notifications were turned
off.

**Mobile:** add `Notifications.addPushTokenListener` and re-POST `/account/addDeviceToken` on
every rotation event, not just at login.

**Backend, already done:** registration is an idempotent upsert (§5.1), and dead tokens are
retired — malformed tokens are rejected before send, and `DeviceNotRegistered` from either a
ticket or a delivery receipt marks the row `isActive: false` so it stops costing sends.

### 5.3 Delete on logout

**Endpoint:** `POST /api/account/logout`

```json
{ "userId": "…", "expoPushToken": "ExpoPushToken[…]" }   // either
{ "userId": "…", "deviceId": "stable-device-uuid" }      // or
{ "userId": "…", "expoPushToken": "…", "deviceId": "…" } // or both
```

✅ **`deviceId` is now accepted in place of the token.** `userId` plus **at least one** of the
two; `422` only if you send neither. Deletion matches on token *or* device, then returns `200`
with `{ deletedCount }`.

This exists because the client cannot always produce a push token at logout — registration may
have failed, or the persisted slice may have rehydrated without one. **So the early-return in
`hooks/auth/index.ts:21–28` now has somewhere to go: send `deviceId` instead of skipping the
call.**

Two paths currently leave the token alive:

1. **No token in Redux** → `logOutfn(dispatch)` wipes locally and the server is never told. The
   row stays live, pointed at the user who just left.
2. **Server error swallowed** → the error branch is empty, every handler commented out with
   *"False Error returned from the server. Need to fix this."* The session is not cleared, the
   token is not deleted, and nothing surfaces. ⚠️ **That commented-out branch is worth chasing on
   its own** — the old endpoint returned `422` whenever `expoPushToken` was missing, which is a
   strong candidate for the "false error" it is masking. The `deviceId` form above should make it
   go away.

Both paths produce the same bug: **the next person to sign in on that handset keeps receiving the
previous user's notifications.** On a shared campus phone that is a data-exposure issue, not a
polish item — permission decisions, ticket details and report contents all arrive in the body.

**Mobile:** call logout unconditionally. When no token is in Redux, send `deviceId`. Then fix the
swallowed error branch.

### 5.4 ⚠️ `deviceId` is not a stable key on iOS

`getIosIdForVendorAsync()` resets when the last app from the vendor is uninstalled, so an iOS
reinstall yields **both** a new `deviceId` and a new push token. The old row survives with a
token that will start returning `DeviceNotRegistered`.

The backend prunes on that receipt (§5.2), so dead rows stop being sent to. They are not deleted,
so the table keeps a tail of inactive rows — harmless, and visible in support tooling.

---

## 6. The push payload (what actually arrives)

Built by `ExpoPushNotificationService.buildMessage()`
(`services/expoPushNotificationService.js`). Presentation fields now vary per notification
rather than being constants:

```json
{
  "to": "ExpoPushToken[…]",
  "title": "A ticket was issued to you",
  "body": "Chidi, a ticket has been issued to you. Tap to read it and respond.",
  "sound": "default",
  "badge": 7,
  "priority": "high",
  "channelId": "default",
  "richContent": { "image": "https://coza.org.ng/…/COZA-Logo-white-300x300.png" },
  "data": {
    "type": "INDIVIDUAL_TICKET_ISSUED",
    "category": "TICKET",
    "priority": "HIGH",
    "url": "/tickets/ticket-details",
    "content": { "_id": "665f…" },
    "notificationId": "665f…",
    "timestamp": "2026-08-23T09:14:02.117Z"
  }
}
```

A notification with no params looks the same, with `"content": {}` — never a missing key, never
`null`. See the routing rule below.

**Contract notes**
- `data.type` — the routing key. Always present.
- `data.category` — one of `ATTENDANCE`, `PERMISSION`, `REPORT`, `TICKET`, `ANNOUNCEMENT`,
  `ACCOUNT`, `SYSTEM`. Always present. Use it for inbox filters and preference grouping.
- `data.priority` — `CRITICAL` | `HIGH` | `NORMAL` | `LOW`. Always present.
- `data.url` — a route path string. Present on every catalogued type.
- `data.content` — routing payload, usually `{ "_id": "…" }`. ⭐ **Always present and always an
  object.** Destinations that take no params get `{}`. This is deliberate: your router discards
  `url` unless `typeof params === 'object'` (§4.1), so an omitted `content` would send an
  otherwise-perfect path to `/`. Report notifications also carry `content.reportType`, which you
  **must** pass back when fetching the report: a report id is meaningless without it.
- `data.notificationId` — the `_id` of the inbox row this push mirrors. Present on every
  message. Use it to mark the row read when the user taps the tray, and to reconcile a push
  against a row you already have.
- `data.timestamp` — injected on every message.
- `badge` — the recipient's **real unread count**, not a literal `1`. `LOW` priority
  notifications omit it, so the badge does not move for low-value items.
- `sound` — **absent** on `NORMAL` and `LOW`. Do not assume the key exists.
- `channelId` — ⚠️ **`"default"` on every message today.** The per-category IDs in §4.2 are
  gated behind `NOTIFICATION_CHANNELS_ENABLED`, which stays off until you confirm a build
  declaring those channels has shipped — Android drops a notification addressed to a channel the
  device has never created, so sending them early would be a silent outage. Build the nine
  channels, ship, tell the backend, and one env var flips. Until then, `default` is correct, not
  broken.
- `richContent.image` — the COZA logo. Renders on Android; iOS needs a Notification Service
  Extension to show it. Present on most types.

**Routing rule for mobile:** push `data.url` as the pathname and `data.content` as the params —
both are always present on a catalogued type, so there is no "when present" branch to write and
no reason to build a `type`→route lookup table on the client. The catalog lives on the backend;
duplicating it in the app is how the two drift. Keep `data.type` for grouping, analytics and
inbox filters, and fall back to the notification centre only when `url` is genuinely absent (an
uncatalogued type). Do not look for `deepLink`, `entityType` or `entityId` — they are not sent.

**Quiet hours:** nothing below `CRITICAL` is pushed between 21:00 and 06:00 Africa/Lagos. The
notification is still written to the inbox at the moment it happens, so the user sees it on
next open — expect inbox rows with no corresponding push.

### 6.1 Types emitted today (⚙️ shipped)

All defined in `config/pushNotifications.js`, with their category, priority, Android channel
and default route declared once in `config/notificationCatalog.js` — that file is the
authoritative list.

⚠️ **The `url` / `content` column below predates the catalog.** *Every* type now has a `url`,
not just permissions and tickets, and the report types carry `content.reportType` alongside
`content._id`. Read `config/notificationCatalog.js` for the current routes; the titles and
bodies quoted in this doc were also rewritten (see `NOTIFICATION_USER_STORIES.md` §3).

| `type` | Fired by | Recipient | `url` / `content` | Mobile route (please provide) |
|---|---|---|---|---|
| `CLOCK_IN` | `campusServiceClockInJob` cron, every 10 min | Worker not yet clocked in, no permission | — | |
| `CLOCK_OUT` | `campusServiceClockOutJob` cron, hourly | Worker not yet clocked out | — | |
| `CLOCK_IN_SUMMARY` | `campusServiceClockInSummaryJob` cron, every 10 min | HOD/AHOD | — | |
| `CLOCK_OUT_SUMMARY` | *defined but never called* | HOD/AHOD | — | |
| `SERVICE_REPORT` | `sendReport` cron, hourly · and `POST /report/viewed` | HOD/AHOD | — | |
| `PERMISSION_CREATED` | `permissionController` on create | Requester | `/permissions/permission-details` · `permissionId` | |
| `PERMISSION_SUBMITTED` | `permissionController` on create | Every HOD/AHOD in the requester's department — or every Campus Pastor on the requester's campus when the requester is themselves HOD/AHOD | `/permissions/permission-details` · `permissionId` | |
| `PERMISSION_STATUS` | `permissionController` on approve/decline | Requester | `/permissions/permission-details` · `permissionId` | |
| `INDIVIDUAL_TICKET_ISSUED` | `ticketController` | Ticketed worker | `/tickets/ticket-details` · `ticketId` | |
| `DEPARTMENT_TICKET_ISSUED` | `ticketController` | Department head | `/tickets/ticket-details` · `ticketId` | |
| `NOTIFY_QC_TICKET_ISSUED` | `ticketController` | QC / M&E | `/tickets/ticket-details` · `ticketId` | |
| `NOTIFY_PASTOR_TICKET_ISSUED` | `ticketController` | Campus Pastor | `/tickets/ticket-details` · `ticketId` | |
| `RETRACT_TICKET_ISSUED` | `ticketController` | Ticketed worker | `/tickets/ticket-details` · `ticketId` | |
| `NOTIFY_QC_RETRACTED_TICKET_ISSUED` | `ticketController` | QC / M&E | `/tickets/ticket-details` · `ticketId` | |
| `GENERAL_NOTIFICATION` | `POST /notification/general` | All activated users except Super Admin | — | |
| *(caller-supplied)* | `POST /notification/generic/:userId` | One user | — | |

**Known defects in the shipped set — do not design around them, they are being fixed:**
- `SERVICE_REPORT` copy is "send in your report, submit immediately" but `POST /report/viewed` fires it when a report is **viewed**, which reads as nonsense to the recipient. That handler also looks the user up with `findOne({ id: submittedBy })` against a schema that has no `id` field, so it currently 404s before sending at all (`controllers/reportController.js:4007`).
- `CLOCK_OUT_SUMMARY` is defined but no caller invokes it.
- Campus tickets, contest-filed and contest-reply are **email-only** — no push, no inbox row (`controllers/ticketController.js`).

### 6.2 Types planned (not emitted yet)

Specified in `NOTIFICATION_USER_STORIES.md`. Give us routes now and we will emit them correctly
on first ship. Names are not frozen — rename freely at this stage.

**Attendance:** `CLOCK_IN_CONFIRMED` · `CLOCK_IN_FAILED` (`failureReason`: `OUT_OF_RANGE`,
`WINDOW_CLOSED`, `INVALID_QR`, `DUPLICATE`) · `MARKED_ABSENT` · `ATTENDANCE_ANOMALY` ·
`LATE_LEADER_DIGEST`

**Permissions:** `PERMISSION_SLA_REMINDER` · `PERMISSION_EXPIRING` · `PERMISSION_GROUP_DIGEST`

**Reports** — these follow the real state machine in §6.3: `REPORT_SUBMITTED` ·
`REPORT_APPROVED_UP` · `REPORT_CHANGE_REQUESTED` · `REPORT_FINAL_APPROVED` · `REPORT_OVERDUE`
· `REPORT_STUCK_IN_REVIEW` · `INCIDENT_REPORT_RAISED`

**Tickets:** `CAMPUS_TICKET_ISSUED` · `TICKET_CONTEST_FILED` · `TICKET_CONTEST_REPLY` ·
`TICKET_UNADDRESSED_REMINDER`

**Scoring:** `SCORE_POSTED` · `RANK_CHANGE` · `TEAM_SCORE_DIGEST` · `DELEGATE_SCORE_POSTED`

**Services:** `SERVICE_SCHEDULED` · `SERVICE_CHANGED` · `SERVICE_READINESS`

**User lifecycle:** `ACCOUNT_APPROVED` · `PASSWORD_CHANGED` · `QR_CODE_ISSUED` ·
`STATUS_CHANGE` · `DORMANT_WORKER_REPORT` · `BLACKLIST_STATUS` · `WORKER_TRANSFER` ·
`PROFILE_CHANGED` (`VERIFY_EMAIL`, `PASSWORD_RESET`, `ACCOUNT_DELETION` stay email-only —
never push a code)

**CGWC:** `CGWC_ANNOUNCED` · `CGWC_REGISTRATION` · `CGWC_SESSION_MESSAGE` ·
`CGWC_FEEDBACK_REQUEST` · `CGWC_ATTENDANCE_SCORE`
*(note: CGWC instant messages are stored but **never pushed** today — `CGWCController.createInstantMessage` only writes the row.)*

**Sister churches:** `SISTER_SERVICE_SCHEDULED` · `SISTER_ATTENDANCE_CONFIRMED`

**Admin:** `BULK_OPERATION_RESULT` · `TENANT_CHANGE` · `DELIVERY_FAILURE_ALERT` · `SYSTEM_ALERT`

### 6.3 Report pipeline — the state machine your routes must match

The report review flow is a real, enforced state machine (`utils/reportModels.js`), driven by
one endpoint: `POST /api/gh/reports/:reportId/transition` with `{ reportType?, toStatus, comment? }`.
Report notifications will carry the resulting status, so mobile routing needs to understand it.

```
DRAFT ──submit──▶ HOD_SUBMITTED ──▶ GH_APPROVED ──▶ CP_APPROVED ──▶ GSP_APPROVED (final)
                       │  ▲              │  ▲            │  ▲
       GH_CHANGE_REQUESTED │   CP_CHANGE_REQUESTED │  GSP_CHANGE_REQUESTED
                       └──┘              └──┘            └──┘
```

- **Headless departments** (no active Group Head) legally skip the GH tier:
  `HOD_SUBMITTED → CP_APPROVED | CP_CHANGE_REQUESTED`, and `CP_CHANGE_REQUESTED → HOD_SUBMITTED`.
  Your "who acts next" label must not assume a GH exists.
- The API returns `awaitingRole` — `HOD | GROUP_HEAD | CAMPUS_PASTOR | GSP | null` — on every
  transition. **Use it** rather than deriving the next actor client-side.
- `reviewHistory[]` is the per-report audit trail: `{ action, actor, actorRole, comment, timestamp }`
  where `action ∈ SUBMIT | RESUBMIT | APPROVE | CHANGE_REQUESTED` and
  `actorRole ∈ HOD | AHOD | GH | CP | GSP` (AHOD submissions are recorded distinctly).
- Change-request transitions require a comment of **≥ 20 characters** — surface that as a form
  rule, not a server error.
- A stale transition returns **409 "Report state changed — please refresh and retry"**. Handle
  it as a refresh-and-retry, not a failure toast.
- `reportType` is one of `ChildCareReport`, `AttendanceReport`, `GuestReport`, `SecurityReport`,
  `TransferReport`, `ServiceReport`, `InternshipReport`, `WelfareReport`, `WittyReport`,
  `PruReport`, `ProtocolReport`, `IncidentReports`. Report ids are only unique **with** their
  type — always carry `reportType` alongside `reportId`.

---

## 7. Receiving & handling notifications

### 7.1 App states
- **Foreground:** OS shows nothing by default. Decide per category (§4.3): banner for actionable, silent badge bump for informational. Never interrupt an in-progress clock-in or report form with a modal.
- **Background:** OS shows the notification; the tap fires your routing resolver.
- **Killed / cold start:** capture the launch notification, **queue the target until auth and session are ready**, then navigate. Never drop it, and never flash the home screen first.

### 7.2 Tap-time routing rules
1. Push `data.url` as the pathname and `data.content` as the params — both are always present on a catalogued type (§6). Fall back to the notification centre only when `url` is absent, which means an uncatalogued type from a newer backend.
2. Resolve against the user's **current** role and scope. Access lost (transferred, role changed) → nearest permitted parent screen **with a one-line explainer**, never a blank error.
3. Entity gone (ticket retracted, report deleted) → list/parent screen with a toast naming what happened.
4. Land on the **actionable** state: approve/reject buttons visible, contest box focused, clock-in CTA ready — not a passive read-only view the user has to navigate out of.
5. Unknown `type` from a newer backend → open the notification centre, not a crash. Forward-compatibility is mobile's job here since types ship server-side first.

### 7.3 Interruption budget

✅ **Per-notification priority has shipped** — `priority` is no longer `high` on everything. The
backend now decides how loudly each type presents and sends it on the payload, so mobile should
read `data.priority` rather than maintaining its own tier table:

| `data.priority` | Expo `priority` | `sound` | Badge | Presentation |
|---|---|---|---|---|
| `CRITICAL` | `high` | `"default"` | yes | Banner + sound; bypasses quiet hours |
| `HIGH` | `high` | `"default"` | yes | Banner + sound |
| `NORMAL` | `normal` | *absent* | yes | Banner, silent |
| `LOW` | `normal` | *absent* | **no** | Silent, no badge movement |

`sound` is **omitted**, not `null`, on `NORMAL` and `LOW` — do not assume the key exists, and do
not force a sound on them client-side. That would undo the whole point of the ladder.

✅ **Repeat sends are deduplicated server-side.** `CLOCK_IN` fires from a cron that runs every 10
minutes across the clock-in window, but each worker now gets **one** row and **one** push per
service, enforced by a unique `dedupeKey`. A re-entered job pushes nothing. You should no longer
need to collapse repeats yourself — if you see the same `CLOCK_IN` twice for one service, that is
a backend bug worth reporting.

### 7.4 Badge

✅ **The payload `badge` is now the recipient's real unread count** at send time, not a literal
`1`, and it is correct per user — broadcasts are counted through per-user read receipts (§8.3).
You can apply it directly on receipt.

It is still a snapshot from the moment of sending, so keep
`GET /api/notification/unread-count/:userId` as the source of truth: refresh on app foreground
and after any read action. `LOW` priority messages omit `badge` deliberately so the badge does
not move for low-value items — treat a missing `badge` as "leave it alone", not as zero.

---

## 8. In-app notification centre

### 8.1 Endpoints (all require `Authorization`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/notification/user/:userId?page=1&limit=20&category=TICKET&unreadOnly=true` | Paginated inbox, newest first |
| `PATCH` | `/api/notification/read/:userId` | Body `{ "notificationIds": ["…"] }` → `data: { updated, unreadCount }` |
| `PATCH` | `/api/notification/read-all/:userId` | Marks everything visible to this user read → `data: { updated, unreadCount }` |
| `GET` | `/api/notification/unread-count/:userId` | `data: { unreadCount }` |

`GET` returns the user's own rows **plus** broadcasts. `limit` is clamped to 1–100.
`category` and `unreadOnly` are optional server-side filters.
`data`: `{ notifications: [...], pagination: { current, limit, total, pages } }`.

Both `PATCH` endpoints return the caller's fresh `unreadCount`, so the badge can be updated
from the same response — no follow-up call needed.

### 8.2 Row shape

```json
{ "_id": "…",
  "userId": "…|null",
  "audience": "USER|BROADCAST",
  "title": "A ticket was issued to you",
  "message": "Chidi, a ticket has been issued to you. Tap to read it and respond.",
  "type": "INDIVIDUAL_TICKET_ISSUED",
  "category": "TICKET",
  "priority": "HIGH",
  "url": "/tickets/ticket-details",
  "content": { "_id": "665f…" },
  "image": "https://coza.org.ng/…png",
  "delivery": { "pushAttempted": true, "pushSuccessful": 2, "pushFailed": 0, "pushError": null },
  "isRead": false,
  "readAt": null,
  "expiresAt": null,
  "createdAt": "…", "updatedAt": "…" }
```

**The row carries the same routing target as the push**, so an inbox tap lands exactly where a
tray tap does: use `url` + `content`. As on the push, `content` is always an object — `{}` for
destinations that take no params.

`isRead` is authoritative for both audiences. On a `BROADCAST` row it is **computed for the
requesting user** from a per-user read receipt — the stored document's own `isRead` is never
written and you will never see it change under you because someone else read the broadcast.

`expiresAt` is set on time-boxed notifications (clock-in reminders expire after 24h, summaries
after 7 days) and the row is removed by a TTL index at that point. Tickets, permissions and
report notifications have `expiresAt: null` and are kept indefinitely.

### 8.3 Backend guarantees you can now rely on

1. **Every notification is persisted, whether or not it was pushed.** The inbox row is
   written first and push is best-effort on top. A user with no registered device, a revoked
   OS permission, or an Expo outage still gets the notification in-app. The inbox is the
   durable channel — treat push as a hint that it changed.
2. **Routing data is persisted** — see §8.2.
3. **Broadcast read state is per user.** One worker reading a broadcast does not mark it read
   for anyone else, and unread counts are correct per user. You can safely build an "unread
   broadcasts" affordance.
4. **Cron-driven notifications are deduplicated** per user per service, so a retried job does
   not produce duplicate rows.
5. **Server-side filtering exists** — `?category=` and `?unreadOnly=true` on the inbox
   endpoint.

Still true, design defensively:

6. **Email-only events do not appear in-app.** Password/OTP mail, QR-code delivery and the
   contest threads are SendGrid-only and create no row. The inbox is not yet a full activity
   history.
7. **No real-time channel.** `socket.io` is a dependency but is not wired up. Inbox updates
   are pull-only: refresh on push receipt, on foreground, and on pull-to-refresh.
8. **No per-user preferences yet** (INFRA-1). Quiet hours are a server-side global
   (21:00–06:00 Africa/Lagos), not a user setting.

### 8.4 Inbox UX bar
- Group by day (`Today` / `Yesterday` / date), newest first, unread visually distinct — a dot or weight change, never colour alone.
- Every row states **what happened, to what, and what to do** — the title alone should be readable in the tray without the body.
- Optimistic read on tap, reconciled with the server; failed reconciliation silently reverts, never a toast.
- "Mark all read" is one tap and reversible-feeling: no confirmation dialog, but no destructive side effects either.
- Empty state names the value ("You're all caught up — clock-in reminders and approvals land here"), not just "No notifications".
- Offline: render the last page from cache with a quiet stale indicator; retry on reconnect. Never an error screen for a cached-content view.
- If OS push permission is denied, the centre still works — show a single dismissible row explaining what they will miss and a deep link to system settings. Ask once, at a moment of relevance (first clock-in), not on first launch.

---

## 9. Notification preferences (planned — INFRA-1)

Not implemented. When mobile confirms §4.12, the backend will expose per-category ×
per-channel toggles with role-aware defaults (approvers default-on for review events).

**Never togglable:** `VERIFY_EMAIL`, `PASSWORD_RESET`, `PASSWORD_CHANGED`, `ACCOUNT_DELETION`,
`BLACKLIST_STATUS`, and child-safety incident escalations. Render those as locked rows with a
short reason rather than hiding them — users trust a settings screen that admits what it cannot
change.

---

## 10. Param dictionary

Only `permissionId` and `ticketId` ship today (as `data.content._id`). The rest are the ids the
backend can supply for the planned types in §6.2.

| Param | Source |
|---|---|
| `permissionId` | `Permission._id` ⚙️ |
| `ticketId` | `Ticket._id` ⚙️ |
| `campusServiceId` | `CampusService._id` |
| `serviceId` | `Service._id` |
| `attendanceId` | `Attendance._id` |
| `departmentId` | `Departments._id` |
| `campusId` | `Campus._id` |
| `groupId` | `DepartmentGroup._id` |
| `requesterId` | `UserProfile._id` (permission requester) |
| `reportId` + `reportType` | `<ReportType>._id` — **always paired**, see §6.3 |
| `reviewCommentId` | `reviewHistory[]` entry id (scroll target) |
| `contestId` | contest sub-doc id |
| `scoreId` | `AttendanceScore._id` |
| `cgwcId` / `delegateId` / `session` | `CGWC._id` / `Delegate._id` / session number |
| `messageId` | `CGWCInstantMessage._id` |
| `sisterServiceId` / `sisterAttendanceId` | `SisterService._id` / `SisterAttendance._id` |
| `statusReportId` | `UserStatusReport._id` |
| `userId` | `UserProfile._id` |
| `subTenantId` | `SubTenant._id` |
| `jobId` / `alertId` / `notificationId` | bulk-job id / system alert id / `Notification._id` |
| `failureReason` | `OUT_OF_RANGE` · `WINDOW_CLOSED` · `INVALID_QR` · `DUPLICATE` |
| `status` | account status, e.g. `BLACKLISTED`, `ACTIVE` |
| `from` / `to` / `period` / `scope` / `window` | date-range / filter values |

> Security flows carry **no OTP or secret** in the payload — codes travel only by email.

---

## 11. Edge cases & reliability

- **Token rotation:** re-register on launch **and on every Expo token-change event** — the
  missing listener in §5.2 is the single most impactful gap on the mobile side.
- **Logout:** always call `POST /account/logout`, unconditionally. Send the current token when
  you have one and `deviceId` when you do not (§5.3) — skipping the call keeps another user's
  pushes arriving on a shared phone.
- **Multi-device:** one row per `deviceId`; all active rows receive every push. Expect the same
  notification on tablet and phone.
- ✅ **Invalid tokens are retired.** Non-Expo-format tokens are rejected before send, and
  `DeviceNotRegistered` from a ticket **or** a delivery receipt now marks the row inactive
  (receipts are read ~15 min after send). An uninstalled app's token stops costing sends;
  re-registration reactivates it.
- ✅ **Duplicates are deduplicated server-side.** Cron-driven types carry a unique `dedupeKey`
  per user per service, and push is built from the rows that actually persisted — a re-entered
  job pushes nothing. You should not need client-side de-duplication; report it if you see it.
- **Cold start:** queue the launch notification behind auth; never navigate an unauthenticated shell.
- **Clock skew:** trust `data.timestamp` (server-issued) over device time when ordering.

---

## 12. Testing checklist

- [ ] Register on login, on launch, and on token-change (`POST /account/addDeviceToken`).
- [ ] **Token rotation:** force a token change and confirm the app re-POSTs it (§5.2). Without
      an `addPushTokenListener` this test fails today.
- [ ] **`data.content` is always an object** — verify a param-less notification arrives with
      `"content": {}` and that the tap does **not** land on `/`.
- [ ] **`channelId` is `"default"`** on every payload until the channel build ships (§4.2).
- [ ] **Shared handset:** sign in as A, sign in as B on the same device without logging A out,
      send A a notification — the device must not receive it.
- [ ] **Logout with `deviceId` only** (no `expoPushToken`) returns `200` and stops delivery.
- [ ] **Refreshed token:** confirm the `Authorization` response header is read and persisted on
      a service other than `gsp-dashboard` (§2).
- [ ] Receive push in foreground / background / killed.
- [ ] Each shipped `type` in §6.1 routes correctly — including the two with `url`/`content`.
- [ ] Unknown/new `type` falls back to the notification centre without crashing.
- [ ] Cold-start deep target is queued until session ready, then navigated once.
- [ ] Access-lost and deleted-entity fallbacks show an explainer, not an error.
- [ ] Repeated `CLOCK_IN` pushes across the window collapse to one live notification.
- [ ] Inbox pagination, mark-read, mark-all-read, unread-count all reconcile.
- [ ] Badge matches `unreadCount` after foreground, push, and read actions.
- [ ] Push-permission-denied path: centre still usable, settings link works.
- [ ] Offline inbox renders from cache and recovers on reconnect.
- [ ] Logout deletes the token; the device stops receiving within one send cycle.
- [ ] No notification payload or link ever contains an OTP or secret.

---

## 13. Next steps

**Backend — done** (PR #1331). Write-first persistence, persisted routing fields, per-user
broadcast read receipts, auth and ownership on every notification route, per-category
`channelId`/`priority`/`sound`, the report-pipeline notifications, dedupe keys and quiet hours
are all shipped. Push is now built from the rows that persisted, and `data.content` is always an
object.

**Backend — blocked on mobile**
1. Correct the four **OPEN** paths in §4.1 once diffed against the route union — one line each.
2. Resolve the report routes in §4.1.1 — needs the product decision, not a string.
3. Flip `NOTIFICATION_CHANNELS_ENABLED` once the channel build is live (§4.2).
4. Per-user preferences and per-user quiet hours (INFRA-1), once §4.4 is answered.

**Mobile — in priority order**
1. `addPushTokenListener` + re-register on rotation (§5.2).
2. Call logout unconditionally, sending `deviceId` when no token is available; fix the swallowed
   error branch (§5.3).
3. Promote `baseQueryWithTokenRefresh` to all sixteen services (§2).
4. Wire `/notifications` to the existing view at `views/app/notifications/index.tsx` (§4.1).
5. Create the nine Android channels, then tell the backend (§4.2).
6. Diff the four OPEN paths against the route union and answer §4.1.1.
7. Decide on the iOS Notification Service Extension, and add the monochrome Android icon (§4.3).
8. Answer §4.4 (quiet hours, preferences) and the foreground-behaviour question in §4.2.

**Jointly:** lock the `type` enum once the route table lands — renaming shipped codes after that
is a coordinated release.
