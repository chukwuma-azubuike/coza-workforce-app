# Roast Engagement System — Widget Specification

> ⚠️ **Written before implementation.** Where this document and the code disagree,
> [`07_AS_BUILT.md`](./07_AS_BUILT.md) is correct.

EPIC 3. The highest-risk work in this set: it is the only part that cannot ship over the
air, the only part requiring native code on both platforms, and the only part where the
platform — not us — decides how fresh the data is.

---

## 1. What a widget can and cannot do

Worth stating plainly, because it shapes every decision below and stakeholders routinely
expect otherwise.

| | Reality |
|---|---|
| **Scrolling** | Impossible. A widget shows a fixed, prioritised subset |
| **Network** | Possible but wrong. Widget processes have tiny memory budgets and no auth context. **Our widgets never touch the network** |
| **Freshness** | iOS budgets reloads — roughly every 15 minutes at best, less for a rarely-opened app. Android's `updatePeriodMillis` floor is 30 minutes |
| **Interactivity** | iOS 17+ via App Intents; Android via `PendingIntent`. Below iOS 17, tap = open app |
| **React Native** | Does not run in an iOS widget extension. Android can, via a headless JS task |
| **OTA updates** | **Cannot update a widget.** It is native code in the binary; a fix is a store release |

The one lever we do control is the **iOS timeline** (§5), which lets the widget change
what it displays at pre-computed future moments without spending any refresh budget. That
is what makes "3 due · 1 overdue" flip to "3 due · 2 overdue" at the right minute.

## 2. The snapshot contract

The single interface between the app and both widgets. The app writes it; the widgets
read it; nothing else crosses.

```ts
interface RoastWidgetSnapshot {
    /** Contract version. Widgets from an older binary must tolerate a newer app. */
    v: 1;

    /** False → widgets render the "Sign in to see your tasks" state (US-3.1). */
    isSignedIn: boolean;

    /** When the app last wrote this. Widgets render it as "Updated 12m ago". */
    generatedAt: string;         // ISO 8601

    counts: {
        due: number;
        overdue: number;
    };

    /**
     * Top items, already ordered (overdue first, then soonest) and already truncated
     * to the largest widget size. Widgets slice; they never sort.
     */
    items: Array<{
        id: string;
        /** FIRST NAME ONLY. See D-10 — this file is readable outside the app sandbox. */
        title: string;           // "Call Emeka"
        subtitle?: string;       // "3 days since last contact"
        dueAt: string;           // ISO — drives the iOS timeline entries
        isOverdue: boolean;
        kind: 'REMINDER' | 'CALL_DUE' | 'FOLLOW_UP' | 'INVITE' | 'NOTE' | 'PROGRESS';
        /** Only REMINDERs are completable from the widget. */
        completable: boolean;
        deepLink: string;        // "roastapp://roast-crm/guests/profile?_id=..."
    }>;

    streak: {
        current: number;
        isAtRisk: boolean;       // live streak, not yet engaged today, past 15:00 local
        longest: number;
    };

    /** Total tasks, so "+N more in Roast" is honest when items is truncated. */
    totalItems: number;
}
```

**Ordering and truncation happen in the app, once.** Two widget implementations sorting
independently is two chances to disagree with the Today screen about what the next action
is — and "the widget says something different from the app" is the fastest way to make
both untrusted. `items` is capped at **6**; the largest layout shows 5.

### 2.1 Where it lives

| Platform | Location | Written via |
|---|---|---|
| iOS | App Group container `group.com.cozaworkforceapp.roast`, file `roast-widget.json` | Native module / config-plugin bridge |
| Android | `SharedPreferences("roast_widget")`, key `snapshot` | `react-native-android-widget`'s data API |

⚠️ **The App Group id must be suffixed per variant**, matching the bundle-id scheme in
`app.config.js` (`.staging` for dev/preview). A shared group across variants means the dev
build's widget renders production data, or worse, the reverse.

### 2.2 When it is written

`hooks/roast-engagement/use-widget-snapshot.ts`, on every one of:

- authenticated app foreground, after `/tasks/today` resolves;
- any reminder create / complete / snooze / delete, **including from the tray**;
- any engagement ping that changes the streak;
- a Roast push arriving in the background (via the existing notification-received path);
- **logout — cleared, not rewritten** (§7).

### 2.3 Versioning

`v` exists because the widget in a user's installed binary can be older than the app
process writing the file — an `eas update` ships new JS against an old native shell. A
widget that does not recognise `v` renders its last good state rather than an error, and
the app never removes a field within a major version.

## 3. iOS — WidgetKit

**Approach:** a WidgetKit extension in Swift/SwiftUI, added through a config plugin so
`yarn prebuild` stays reproducible.

**Tooling:** `@bacons/apple-targets`. It generates the extension target, wires the App
Group entitlement into both the app and the extension, and survives `prebuild --clean` —
which hand-editing the Xcode project does not. This repo commits `ios/`, but it also has a
`prebuild` script, and a hand-edited project is a landmine for the next person who runs it.

**Widget families:**

| Family | Content |
|---|---|
| `systemSmall` | Streak ember + day count + `{n} due` + next action title, one line |
| `systemMedium` | Header (count + streak pill) + **2 items** + "+N more in Roast" |
| `systemLarge` | Header + **1 highlighted next action** + **4 items** + streak footer |

These match the validated mockups referenced in US-3.2. Long titles truncate with an
ellipsis; times always render `h:mm a`.

**Deployment target.** `expo-build-properties` currently sets iOS 15.1. WidgetKit works
from iOS 14, so the widget itself ships everywhere. **Interactive completion needs iOS 17**
(App Intents) — below that, a tap on a checkbox deep-links instead (US-3.6's stated
fallback). This needs no target bump; it needs an `@available(iOS 17.0, *)` branch.

## 4. Android — RemoteViews

**Approach:** `react-native-android-widget`. Widget layouts are authored in JSX and
compiled to RemoteViews; click handlers dispatch to a headless JS task.

**Why not hand-written RemoteViews XML:** RemoteViews supports a small fixed set of views
and no custom drawing, so the XML would be verbose, hard to keep in step with the SwiftUI
layout, and would still need a JS bridge for the data. The library costs one config plugin
and one headless entry point and gives us the same JSX vocabulary the app already uses.

**Sizes:** `2x2` (small), `4x2` (medium), `4x4` (large), mapped to the same three layouts.
`updatePeriodMillis` is set to 30 minutes (the platform floor) with explicit
`requestWidgetUpdate` calls whenever the snapshot is rewritten — the explicit path is what
actually keeps it fresh; the period is the floor for a backgrounded app.

**Interactivity:** a `PendingIntent` per completable row carrying the reminder id. The
receiver enqueues the completion into the same outbox the app uses
([`03_MOBILE_SPEC.md §3`](./03_MOBILE_SPEC.md#3-state-slice)) and requests a widget
update. This is the same native receiver work D-8 defers for tray actions — **build it
once and use it for both**, which is a real argument for sequencing the Android receiver
before the Android widget.

## 5. The iOS timeline trick

The detail that makes this widget feel alive despite a 15-minute refresh budget.

A naive implementation returns one timeline entry ("here is the state now") and asks
WidgetKit to reload in 15 minutes. Between reloads, a task that becomes overdue at 14:00
still reads "due" until 14:15 — and the count is wrong for a quarter of an hour, several
times a day.

Instead, build a timeline with **one entry per future state change**, derived from the
snapshot's `dueAt` values:

```
entries = [now]
for each item in snapshot.items where dueAt > now:
    entries.append(entry at dueAt, with counts recomputed for that instant)
if streak is live and 15:00 local is still ahead:
    entries.append(entry at 15:00 with isAtRisk = true)
entries.append(entry at next local midnight)   // the day rolls over
policy = .after(next local midnight)
```

WidgetKit renders each entry at its moment with no process wake-up and no budget spend.
The counts flip exactly when they should; the ember dims at 15:00 on the dot; the day
rolls over at midnight. The budget is then spent only on *new* data arriving, which is
what it is for.

Android has no equivalent, so its 30-minute period plus explicit updates is the ceiling.
Accept the asymmetry rather than degrading iOS to match.

## 6. States

Every layout renders one of five, and each needs a design:

| State | Trigger | Content |
|---|---|---|
| **Signed out** | `isSignedIn === false` | "Sign in to see your tasks" + app icon. No counts, no names |
| **Empty** | `items.length === 0`, signed in | "All roasted for today 🔥" + streak |
| **Normal** | Items, none overdue | Count pill "3 due", items, healthy ember, `"{n} days on — keep the fire going."` |
| **Overdue** | ≥1 overdue | Count pill "3 due · 1 overdue"; overdue rows visually distinct (accent bar + time in the warning colour) |
| **Streak at risk** | `streak.isAtRisk` | Ember dims; pill `"check in 🔥"`; small-widget label `"days on · keep the fire"`; footer `"Roast your game today 🔥"` |

A sixth, implicit state: **stale**. If `generatedAt` is more than 6 hours old, the footer
reads "Updated {relative}" rather than a live-sounding phrase. Widgets that quietly show
old data as if it were current are worse than widgets that admit it.

## 7. Privacy and the session boundary

The snapshot lives outside the app sandbox by design — that is what makes it readable by
the widget process. It therefore contains, and may only contain:

- ✅ First names, task titles, times, counts, streak numbers.
- ❌ Full names, phone numbers, addresses, guest notes, timeline content, the auth token,
  campus or zone identifiers.

**Logout must clear it, synchronously, before the session ends.** Wire into `useAuth`'s
existing teardown next to the AsyncStorage clear:

```
1. write { v: 1, isSignedIn: false, ... empty ... }
2. request a widget update on both platforms so the render happens now, not in 30 minutes
3. cancel every scheduled `roast-*` local notification
```

Step 2 matters: a cleared file with no update request leaves the previous user's guest
names rendered on the home screen until the next refresh. On a shared campus handset that
is the whole risk, unmitigated.

## 8. Build and release implications

Tell the release owner now, not at the first widget bug:

- **A new dev client build is required** before any widget work can be tested. Both config
  plugins add native targets.
- **Widget changes cannot ship via `eas update`.** They are a store release. Plan widget
  work into a version bump, not a patch channel.
- `runtimeVersion.policy` is `appVersion`, so the app version bump that carries the widget
  also creates a new OTA lane — intended, but worth noticing.
- **EAS credentials**: the iOS extension needs its own bundle id
  (`com.cozaworkforceapp[.staging].roastwidget`) and its own provisioning profile. Add
  both to EAS before the first build attempt; this is the most common first-day blocker.
- `.easignore` and `fingerprint.config.js` may need updating so the new native directories
  are fingerprinted — otherwise EAS may reuse a cached build without the extension.

## 9. Reduced scope, if the timeline slips

The widget is the natural candidate to cut, and it cuts cleanly:

- **Cut to Android only.** `react-native-android-widget` is materially less work than the
  iOS extension. Ships to the larger share of this user base.
- **Cut interactivity.** Deep-link-only widgets on both platforms remove the App Intents
  work and the Android receiver entirely, and US-3.6 is already a *Could* with a stated
  fallback.
- **Cut to the medium size only.** One layout per platform, `systemMedium` / `4x2`, which
  is the size most people actually place.

What must **not** be cut is the snapshot contract (§2) and the write path (§2.2). They are
small, they are pure app-side code, and they are what makes the widget a two-week project
later instead of a rewrite.
