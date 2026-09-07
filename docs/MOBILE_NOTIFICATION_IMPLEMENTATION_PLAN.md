# Mobile Notification Integration — Implementation Plan

> **Responds to:** `MOBILE_NOTIFICATION_INTEGRATION.md` (backend, PR #1331).
> **Repo state:** `feat/notifications_v2` @ `32014750` — identical to `develop`, so every
> defect below is live in production today.
> **Route claims** are checked against the generated union in `.expo/types/router.d.ts`
> (90 paths), regenerated on build:
> `grep -o '`[^`]*`' .expo/types/router.d.ts | tr -d '`' | grep '^/' | grep -v '\${' | sort -u`

---

## Phase 0 — Answers the backend is blocked on

No code. These are the four items in the guide's "Backend — blocked on mobile" list, and each is
a one-line change in `config/notificationCatalog.js` once we send them. Send this section first;
Phases 1–3 do not depend on it.

### 0.1 The four OPEN paths — all four are wrong (§4.1)

None of them exist in the route union. `/attendance` and `/reports` do, and both already read a
tab/param from the URL, so the corrections below land on the right screen *and* the right tab.

| `url` emitted today | Exists? | Send instead | `content` to send | Why |
|---|---|---|---|---|
| `/attendance/clock-in` | ❌ | `/(tabs)` | `{}` | The clock-in CTA lives on the home tab, not in `/attendance`. §7.2 rule 4 — land on the actionable state. |
| `/attendance/clock-out` | ❌ | `/(tabs)` | `{}` | Same button, same screen. |
| `/attendance/department-summary` | ❌ | `/attendance` | `{ "tabKey": "teamAttendance" }` | `views/app/attendance/index.tsx:27,64` reads `params.tabKey` and selects that tab. `teamAttendance` is the HOD/AHOD department view. |
| `/reports/my-reports` | ❌ | `/reports` | `{}` | The reports index is `/reports`; there is no `my-reports`. |

`/permissions/permission-details` and `/tickets/ticket-details` are ✅ correct — no change.

⚠️ **`/(tabs)`, not `/` — corrected during Phase 2.** Three files claim the bare `/`:
`app/index.tsx` (the Welcome screen), `app/(auth)/index.tsx` and `app/(tabs)/index.tsx`. Sending
`/` is therefore a coin toss that can drop a signed-in user on the sign-in landing page, which is
why `components/Routing.tsx` has always entered the home tab as `router.replace('/(tabs)')`.
The parenthesised segment is an Expo Router *group* — it never appears in a URL and is the only
unambiguous way to name a group's index. The app now rewrites a `/` target to `/(tabs)` before
navigating (`constants/notification-routes.ts`), so either spelling works on this build onward;
send `/(tabs)` so it is also right for anyone still on the current release.

### 0.2 Report routes — resolved, and the answer is a single route (§4.1.1)

**All report notifications route to `/gh-approvals/report-detail`, for approver and submitter
alike.** The three questions collapse:

1. **Whose screen?** One screen serves both. `constants/report-actions.ts` is a
   status × role table that already covers the submitter: `DRAFT → HOD/AHOD: "Submit for
   review"`, `GH_CHANGE_REQUESTED → HOD/AHOD: "Resubmit"`, `CP_CHANGE_REQUESTED → HOD/AHOD:
   "Resubmit"` under headless-GH. It reads `awaitingRole` off the API rather than deriving the
   next actor, exactly as §6.3 asks.
2. **The kebab-case mapping is moot** — no `reportType → route` lookup is needed. Do not build it.
3. **Do the 13 `/reports/<type>-report` screens take an id?** ❌ **No, and this is the reason
   they cannot be notification targets.** They are *form* screens hydrated by spreading the
   whole report object off the URL — `const params = useLocalSearchParams() as
   IServiceReportPayload; const INITIAL_VALUES = { ...params }`
   (`views/app/reports/forms/service-report.tsx:26,36`). Deep-linking one with `{ _id,
   reportType }` renders an empty form, silently. `/gh-approvals/report-detail` is the only
   report screen that hydrates from ids — `useGetGhReportDetailQuery({ reportId, reportType })`
   (`views/app/gh-approvals/approvals-report-detail.tsx:59`).

⚠️ **One param rename needed.** That screen reads `reportId`, not `_id`. Send:

```json
"content": { "reportId": "665f…", "reportType": "ServiceReport" }
```

Optional extras it also renders if present: `departmentName`, `campus`, `serviceName`, `status`.
It fetches on `reportId` alone, so those are cosmetic-until-loaded, not required.

### 0.3 Foreground behaviour (§4.2)

Driven off `data.priority`, not per-category — the ladder in §7.3 already encodes the intent:

| `data.priority` | Banner | Sound | Badge |
|---|---|---|---|
| `CRITICAL` / `HIGH` | yes | yes | yes |
| `NORMAL` | yes | **no** | yes |
| `LOW` | no | no | **no** |

Never a modal. §7.1's "never interrupt an in-progress clock-in or report form" is honoured by
using the OS banner rather than the app's `NotificationModal`.

### 0.4 Infrastructure answers (§4.3, §4.4)

- **Minimum targets:** Expo SDK 54 (`expo ~54.0.34`, `expo-notifications ~0.32.17`,
  `expo-router ~6.0.23`), iOS 15.1, Android 7 / API 24 — the SDK 54 floors. Channels need API 26+;
  below that Android ignores `channelId` harmlessly.
- **iOS Notification Service Extension: not this cycle.** New Xcode target, second bundle ID and
  provisioning profile, app group, plus a config plugin to survive `prebuild` — real work for one
  logo in the tray. **Keep sending `richContent.image`** (it renders on Android and costs nothing
  on iOS); we will revisit when there is imagery worth the target.
- **Quiet hours:** keep the server-side global (21:00–06:00 Africa/Lagos) for now. Every campus in
  scope is Lagos-time; per-user timezone is not worth an INFRA-1 dependency. Revisit with
  preferences.
- **Preferences screen (INFRA-1):** yes, wanted — but after Phase 3. Android channels already give
  users per-category switches in system settings for free, which covers most of the need on the
  larger platform. Togglable list to follow once the centre ships.

---

## Phase 1 — The three lifecycle defects

One PR. No backend dependency, no flag, nothing to coordinate. This is the phase that stops
silent notification loss and the shared-handset leak.

### 1.1 Re-register on token rotation (§5.2) — highest impact

`components/NotificationsProvider.tsx:80–100`. Registration is a `[]`-dependency effect;
there is no `addPushTokenListener` anywhere in the repo.

- Extract the register call into a stable `registerDevice(token?)` callback.
- Add `Notifications.addPushTokenListener(({ data }) => registerDevice(data))` in the same
  effect, returned subscription removed on unmount. `data` is the new `ExpoPushToken[…]`.
- Re-POST `/account/addDeviceToken` on every event — the backend upserts on `(userId, deviceId)`
  (§5.1), so this cannot fan out duplicate sends, and it flips a `DeviceNotRegistered`-deactivated
  row back to `isActive: true`.
- Also dispatch `notificationActions.setExpoPushToken(data)` so the persisted slice — which
  `useAuth` reads at logout — never holds a stale token.
- **While here:** `components/Routing.tsx:48` mounts the provider with `user || ({} as any)`, so
  the effect fires unauthenticated and POSTs `email: undefined`. Gate on `user?.userId`.
- **While here:** drop `fcmToken?: string` from `IAddNotificationTokenPayload`
  (`store/services/account.ts:113–120`) — nothing populates it and the backend filters it out.

### 1.2 Logout unconditionally (§5.3)

`hooks/auth/index.ts:20–38`. Two paths currently leave the row alive on the server.

- Replace the early return with a `deviceId` fallback. The endpoint now takes `userId` + **either**
  token or `deviceId`, so:
  ```ts
  const deviceId = await getDeviceId();
  await logoutCall({ userId, ...(expoPushToken ? { expoPushToken } : {}), deviceId });
  ```
  Send both when both exist — deletion matches on token *or* device.
- **Always call `logOutfn(dispatch)` in a `finally`.** Today a server error leaves the session
  un-cleared and the user still signed in with no feedback. Local sign-out must not depend on a
  network call succeeding.
- The commented-out "False Error returned from the server" branch is almost certainly the old
  `422`-when-`expoPushToken`-missing. Send `deviceId` and it should go away; keep a Sentry
  breadcrumb on the error path rather than an `Alert`, and delete the commented `Alert` blocks.
- Widen `ILogoutPayload` in `store/services/account.ts` so `expoPushToken` is optional and
  `deviceId` is accepted.

### 1.3 Promote `baseQueryWithTokenRefresh` to all 16 services (§2)

`store/services/fetch-utils/index.ts:31–60`. Correct today, used by 1 of 16.

Change `baseQuery: fetchUtils.baseQuery` → `fetchUtils.baseQueryWithTokenRefresh` in the fifteen
that still use the plain one:

`account:196` · `attendance:50` · `campus:10` · `compliance:10` · `congress:21` ·
`department:17` · `group:50` · `grouphead:101` · `permissions:35` · `reports:179` · `role:10` ·
`score:10` · `score-mapping:10` · `services:19` · `tickets:24`
(`gsp-dashboard:499` already has it.)

Safe on its own terms: the header capture is inside its own `try/catch` and returns the untouched
result. Then simplify `baseQuery` to a private implementation detail so a new service cannot
regress by copy-paste — export only the refreshing one.

**Expected user-visible fix:** users bounced to login roughly one token-lifetime after signing in
regardless of activity, never reproducible for anyone testing the GSP dashboard.

---

## Phase 2 — Channels, payload semantics, routing

Ships before the backend flips `NOTIFICATION_CHANNELS_ENABLED`. Expect `channelId: "default"` on
every payload until we confirm this build is live — that is correct, not broken (§4.2).

### 2.1 The nine Android channels (§4.2)

New `constants/notification-channels.ts` holding the contract IDs — renaming one after release
strands users on the old switch:

| id | name | importance |
|---|---|---|
| `attendance` | Clock in & out | HIGH |
| `attendance-summary` | Attendance summaries | DEFAULT |
| `reports` | Reports | HIGH |
| `permissions` | Permission requests | HIGH |
| `tickets` | Tickets | HIGH |
| `congress` | Congress & CGWC | HIGH |
| `announcements` | Announcements | DEFAULT |
| `account` | Account & security | HIGH |
| `default` | General | DEFAULT |

- Replace the single `setNotificationChannelAsync('default', … MAX)` in
  `NotificationsProvider.tsx:27–33` with a loop over the table. Importance is a **ceiling the
  payload cannot raise**, so nothing goes to MAX — that is the whole point of splitting them.
- `app.json:88–92` keeps `"defaultChannel": "default"` (still the correct fallback) and gains
  `"color": "#2D0060"`.
- Add `assets/images/notification-icon.png` — monochrome white-on-transparent, 96×96 — and point
  `"icon"` at it. Today it points at the full-colour `icon.png`, which Android flattens to a white
  blob.
- Requires a native rebuild (`yarn prebuild` + dev/preview build); this is not OTA-able.
- **Then tell the backend** and they flip one env var.

### 2.2 Priority-aware presentation (§7.3, §7.4)

`app/_layout.tsx:35–44` hardcodes `shouldPlaySound: true`, `priority: MAX`, `shouldSetBadge:
false` for every notification — it forces sound onto `NORMAL`/`LOW` in the foreground and never
moves the badge.

- Make the handler read `notification.request.content.data.priority` and return the 0.3 table.
- `shouldSetBadge: true`, except when `badge` is absent — a missing `badge` means "leave it
  alone", never zero (§7.4).
- Never test `sound !== null`; on `NORMAL`/`LOW` the key is **absent**.
- Persist `data.category` and `data.priority` onto the notifications slice for inbox filters.

### 2.3 Tap routing (§4.1, §7.1, §7.2)

`hooks/push-notifications/useNotificationObserver.ts`. Three defects beyond what the guide lists:

1. **`getLastNotificationResponseAsync()` is called twice** (lines 20–26 *and* 29–35), so a
   cold-start tap navigates twice. Delete the first block.
2. **The guard discards good paths** — `if (pathname && typeof params === 'object')` sends a
   perfect `url` to `/` whenever `content` is missing. The backend now always sends `{}`, but the
   guard is still wrong for any uncatalogued type: split it to `if (pathname) router.push({
   pathname, params: params ?? {} })`.
3. **It runs at `app/_layout.tsx:79`, above auth**, so a cold-start target can fire into an
   unauthenticated shell. Queue the pending target in a ref and flush it once
   `user?.userId` is present (§7.1, §11).

Plus, from the contract:
- Validate `pathname` against a generated set of known routes before pushing; unknown → push
  `/notifications` rather than `/` (§7.2 rule 5). Types ship server-side first, so
  forward-compatibility is ours.
- Mark the row read on tap using `data.notificationId`.
- Keep **no** `type → route` lookup table on the client. The catalog is the backend's; duplicating
  it is how the two drift. `constants/notification-types.ts`'s legacy `NOTIFICATION_TYPES_ROUTING`
  (keyed on old `routeName`/`tabKey` pairs) is dead — delete it.

### 2.4 Found while building Phase 2 — ⚠️ not fixed, needs a decision

**iOS dev and preview builds mint sandbox push tokens against a production APNs entitlement.**

`app.json` sets `ios.entitlements["aps-environment"] = "production"` unconditionally — verified
across all three variants with `APP_VARIANT=<v> npx expo config --type prebuild --json` — while
`registerForPushNotificationsAsync` requests the token with `development: ENV !== 'production'`.
So the device registers with production APNs and Expo is told to deliver via sandbox. That is
exactly the §4.3 failure mode: delivery stops, the app sees nothing, and the only evidence is a
`DeviceNotRegistered` line in an Expo receipt nobody reads.

It bites the two variants the team tests on, so **it will look like Phase 1 and Phase 2 do not
work on iOS**. The `development` flag needs to track the entitlement, not `ENV`:

| variant | distribution | `aps-environment` | token `development` |
|---|---|---|---|
| `development` | internal / ad-hoc | `development` | `true` |
| `preview` | TestFlight — **an App Store build, production APNs** | `production` | `false` |
| `production` | App Store | `production` | `false` |

Note `preview` keeps the production entitlement: TestFlight is not a sandbox. Left unchanged
because it turns on iOS distribution details worth confirming before a build, and it can only be
verified on a device.

---

## Phase 3 — The in-app notification centre

The inbox is the durable channel; push is a hint that it changed (§8.3). This is the phase that
makes the feature real for users with permission denied, no device registered, or a quiet-hours
notification.

### 3.1 New service `store/services/notification.ts`

Four endpoints, standard `createApi` shape, registered in `store/index.ts` reducer + middleware:

| hook | endpoint |
|---|---|
| `useGetNotificationsQuery` | `GET /notification/user/:userId?page&limit&category&unreadOnly` |
| `useMarkReadMutation` | `PATCH /notification/read/:userId` `{ notificationIds }` |
| `useMarkAllReadMutation` | `PATCH /notification/read-all/:userId` |
| `useGetUnreadCountQuery` | `GET /notification/unread-count/:userId` |

Both `PATCH`es return a fresh `unreadCount` — update the badge from that response, no follow-up
call. `refetchOnFocus: true` covers §8.3's pull-only reality (no socket).

### 3.2 Rebuild `views/app/notifications/index.tsx`

The existing 164-line screen is a **shell built against a taxonomy the backend does not send** —
`notifications: INotification[] = []` hardcoded (line 97), rows keyed on an `eventType` vocabulary
(`report.cp_approved`, `permission.declined`) that appears nowhere in the contract. Keep the
layout and filter chips; replace the data layer:

- Row model → §8.2 (`type`, `category`, `priority`, `url`, `content`, `isRead`, `image`).
- Filter chips → the real `category` enum: `ATTENDANCE`, `PERMISSION`, `REPORT`, `TICKET`,
  `ANNOUNCEMENT`, `ACCOUNT`, `SYSTEM` — passed as the server-side `?category=` filter, not
  client-side.
- Row tap → the **same resolver as 2.3**, since the row carries the same `url` + `content`.
- `@shopify/flash-list` + `useInfiniteData` for pagination, day grouping (`Today`/`Yesterday`/date),
  optimistic read that reverts silently on failure, "Mark all read" with no confirm dialog, and the
  §8.4 empty state that names the value.
- Permission-denied row: one dismissible entry linking to system settings, shown at first clock-in
  rather than first launch.

### 3.3 Wire the route and the entry point

- `app/(stack)/notifications/index.tsx` returns `<></>` today — the route resolves, so it never
  404s and nothing logs. Re-export the view.
- Hang the bell and its unread count on the top bar. `config/navigation.ts:114` already points
  at `/notifications`.
  ⚠️ **Correction:** this plan named `views/app/home/group-head/gh-top-bar.tsx:54`, which is an
  orphan — nothing imports it, so un-commenting there changes nothing on screen. The live top bar
  is `components/TopNav.tsx`, used by the worker home (`views/app/home/workers/clocker.tsx:126`)
  and the Roast CRM tabs; `views/app/home/top-nav.tsx` is a second orphan with the same
  commented-out bell. The bell went into `components/TopNav.tsx`; both orphans were left alone.
- **This unblocks `GENERAL_NOTIFICATION`** — until it ships, that type lands on a blank screen.

---

## Sequencing

```
Phase 0  ── send now, no code ──────────────▶ backend edits catalog, unblocks 5 of 8 paths
Phase 1  ── one PR, no dependencies ────────▶ OTA-able, ships immediately
Phase 2  ── needs a native build ───────────▶ then backend flips NOTIFICATION_CHANNELS_ENABLED
Phase 3  ── independent of 1 & 2 ───────────▶ can run in parallel with Phase 2
Phase 4  ── deferred: NSE, INFRA-1 preferences, realtime
```

Phase 1 is OTA-able and fixes live data exposure — it should not wait for Phase 2's build cycle.
Phase 2 is the only phase gated on a native release, and the backend flag stays off until we
confirm it is live on devices, so there is no window where notifications address a channel that
does not exist.

## Verification

Against §12, the items that need a device and cannot be asserted from code:

- Force a token rotation and confirm the re-POST (fails today — 1.1).
- Shared handset: sign in as A, sign in as B without logging A out, push to A — device must not
  receive it (1.2 + the backend's claim-on-register).
- Logout with `deviceId` only → `200`, delivery stops within one send cycle (1.2).
- Confirm the `Authorization` response header is read on a service other than `gsp-dashboard`
  (1.3) — inspect the persisted session after a long-idle request.
- A param-less notification arrives with `"content": {}` and the tap does **not** land on `/` (2.3).
- Cold-start target is queued behind auth and navigated **once**, not twice (2.3).
- Unknown `type` opens the centre rather than crashing (2.3).
- Badge matches `unreadCount` after foreground, push, and read (2.2 + 3.1).

## Out of scope, explicitly

iOS Notification Service Extension (0.4) · per-user preferences / INFRA-1 (0.4) · per-user quiet
hours (0.4) · realtime inbox — `socket.io` is a dependency but is not wired on either side (§8.3) ·
the planned types in §6.2, which need routes only once they are emitted.
