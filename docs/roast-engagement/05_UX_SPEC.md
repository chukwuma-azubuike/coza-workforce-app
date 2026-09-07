# Roast Engagement System — UX Specification

The bar: a worker opens Roast and knows, in under two seconds and without reading, what to
do next. Everything below serves that.

Design system in place: NativeWind + the `hsl(var(--*))` token set in `tailwind.config.js`
and `global.css`, `components/ui/*` (rn-primitives), `lucide-react-native` icons,
`@shopify/react-native-skia` and `lottie-react-native` for motion. Roast already has a
visual identity — the Angelos wordmark in `TopNav`, indigo for engagement, and the
cool→warm→green funnel ramp in `ZoneStats`/`ScoringGuide`.

---

## 1. Information architecture

```
Roast (tabs)
├── Today            ← NEW, and the new default landing tab
├── My Guests
├── Zone             (role-gated, unchanged)
├── Reports          (role-gated, unchanged)
├── Leaderboards
└── Settings         (role-gated, unchanged)

(stack)
├── guests/profile   ← + Reminders card, + "Set reminder" action
├── reminders        ← NEW  "My reminders"
├── streak           ← NEW  streak & history
└── notification-settings  ← NEW
```

**Today replaces the commented-out Notifications tab** in
`app/roast-crm/(tabs)/_layout.tsx`. It becomes the default landing tab for anyone with
assigned guests; workers with none land on My Guests as they do today.

The bell in `TopNav` is already present on every Roast screen and stays the route to the
inbox. Today is *what to do*; the bell is *what you were told*.

## 2. Today — the centrepiece

```
┌─────────────────────────────────────────┐
│  🔥  12                        [ember]  │   ← StreakHeader, tappable → /streak
│      days on — keep the fire going      │
├─────────────────────────────────────────┤
│  3 due  ·  1 overdue                    │   ← count row, overdue in destructive
├─────────────────────────────────────────┤
│  OVERDUE                                │
│  ┌───────────────────────────────────┐  │
│  │▌ Call Emeka              2:00 PM  │  │   ← accent bar = overdue
│  │  3 days since last contact        │  │
│  │  [ Call ]  [ ⋯ ]                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  TODAY                                  │
│  ┌───────────────────────────────────┐  │
│  │  Ada · baptism class      4:00 PM │  │
│  │  Your reminder                    │  │
│  │  [ ○ ]  [ Call ]  [ ⋯ ]           │  │
│  └───────────────────────────────────┘  │
│  ...                                    │
├─────────────────────────────────────────┤
│  Nothing else today. 4 guests are on    │   ← forward look, not a dead end
│  track. →                               │
└─────────────────────────────────────────┘
```

**Rules that make it work:**

- **One primary action per row**, sized for a thumb (≥44pt), never a menu-first row. Call
  for `CALL_DUE`, complete for `REMINDER`, add-note for `NOTE`, update-stage for
  `PROGRESS`. Everything else lives behind `⋯`.
- **Sections, not filters.** Overdue / Today / Later. A worker should never have to choose
  a filter to see what is urgent.
- **The card is the deep-link target**; the buttons are the shortcuts. Tapping anywhere
  else on the card opens the guest profile.
- **Pull to refresh**, and a `Last updated {relative}` line under the header when the feed
  came from cache.
- `@shopify/flash-list` v2 with the existing `useInfiniteData` pattern.

### 2.1 Empty state

Not a shrug — a reward.

> 🔥
> **All roasted for today**
> You've cleared every guest on your list. Twelve days on and counting.
> `[ See my guests ]`

### 2.2 First-run state

A worker with guests but no history sees a two-line explainer above the feed, dismissible
and never shown again: *"Roast will tell you who needs you each morning. Set your own
reminders from any guest's profile."*

## 3. The streak ember

The one piece of pure delight, and the one most likely to be over-built. Rules:

- **Skia, not Lottie**, for the ember itself. It is a small procedural flame — a few
  layered blurred circles on a `Canvas` with a looping `useAnimatedStyle`-driven phase —
  and it must run at 60fps behind a scrolling list. Lottie is the right tool for the
  milestone celebration (§6), which plays once.
- **Three visual states:** healthy (warm amber, gentle motion), at-risk (desaturated, slow,
  smaller), extinguished (grey outline, still, `current === 0`).
- ⚠️ **Property animations only.** Reanimated's `entering`/`exiting`/`layout` props crash
  Android under Fabric in this app; `useAnimatedStyle` on transform and opacity is a
  different, safe subsystem. The ember uses the latter exclusively.
- **Respect `prefers-reduced-motion`** via `AccessibilityInfo.isReduceMotionEnabled()` —
  the ember becomes a static glyph, and nothing else changes.
- Above 100 days the number, not the flame, gets bigger. The flame stays constant so it
  never becomes visual noise.

## 4. Setting a reminder

Entry point: `GuestHeader` gains a **Set reminder** action beside Call and WhatsApp — a
bell-plus icon, same treatment as its neighbours.

Opens a bottom sheet, not a screen. Creating a reminder is a 10-second task and a full
navigation is a 10-second tax.

```
┌─────────────────────────────────────────┐
│ ─────                                   │
│  Remind me about Emeka                  │
│                                         │
│  [ This evening ] [ Tomorrow 9 AM ]     │   ← chips: one tap covers ~80% of cases
│  [ Saturday 4 PM ] [ Pick a time ]      │
│                                         │
│  📅 Sat 26 Jul    🕓 4:00 PM            │   ← always visible, chips write into it
│                                         │
│  Note                                   │
│  ┌───────────────────────────────────┐  │
│  │ Call back re: baptism class       │  │
│  └───────────────────────────────────┘  │
│                            0/280        │
│                                         │
│  [        Set reminder        ]         │
└─────────────────────────────────────────┘
```

- **Chips first.** "This evening" = 18:00 today (or tomorrow if past). "Tomorrow 9 AM".
  "Saturday 4 PM" = the next Saturday. "Pick a time" opens the date/time picker.
- **Past-time validation is inline and immediate** (US-2.1) — the moment the composed
  date/time is in the past, the submit disables and a line appears under the time row:
  *"That's already passed — pick a later time."* Never a toast, never on submit.
- Formik + Yup, schema in `utils/schemas/` alongside the others.
- On save: sheet dismisses, a toast confirms with the relative time — *"Reminder set for
  Saturday at 4:00 PM"* — and the guest's Reminders card animates the new row in.

**Editing** uses the same sheet with values pre-filled and a destructive **Delete** in the
header. One component, two modes — a separate edit screen is how the two drift.

## 5. My reminders

`/roast-crm/reminders`. Segmented control: **Upcoming** · **Completed**.

- **Upcoming**, grouped by day with sticky headers: `Today` · `Tomorrow` · `Saturday` ·
  `26 July`. Sorted soonest-first within each (US-2.6).
- **Completed**, grouped by day descending, each row showing its completion timestamp and
  a struck-through note.
- **Swipe actions**: right → complete (green, check), left → snooze (amber, clock).
  `react-native-gesture-handler` is already a dependency.
- **Long-press** → edit sheet.
- Empty upcoming: *"No reminders set. Tap the bell on any guest to set one."*

On the guest profile, `GuestRemindersCard` shows the same rows scoped to that guest —
upcoming first, then a collapsed "Completed (4)" accordion, using the existing
`components/ui/accordion`.

## 6. Streak & history

`/roast-crm/streak`, reached from the Today header or a streak notification.

```
        [ large ember ]
             12
      days on — keep the fire going

  ┌─────────────┬─────────────┐
  │  Longest    │  Freezes    │
  │     41      │    🧊 1     │      ← freezes hidden until v1.5
  └─────────────┴─────────────┘

  ─── Last 3 months ───
  [ heatmap: 7 columns × 13 rows, one cell per day ]

  ─── Milestones ───
  ✓ 7 days     ✓ 30 days     ○ 100 days
```

- **Heatmap** in Skia — 91 cells is too many views for a RN tree that also scrolls.
  Intensity by qualifying-action count, using the existing indigo engagement accent, not a
  new palette.
- **Milestone celebration**: a Lottie confetti burst plus haptics (`expo-haptics`, already
  used in the tab bar) on first view after crossing 7 / 30 / 100. Plays once, gated by the
  server's `milestonesAwarded`.
- **Reset acknowledgment** (US-4.3): when `wasReset` is true, a card sits above the ember
  before anything else — *"Your streak reset. It happens. Check in today and you're back
  on day 1."* Dismissing it calls `/streaks/me/acknowledge-reset`. Warm, never scolding;
  the whole point of the card is that the person who missed a day is the person most
  likely to stop opening the app.

## 7. Notification settings

`/roast-crm/notification-settings`, and also reachable from the app's main settings so
there is one place people look.

- Per-type switches: Call reminders · Follow-ups · Invites · Note prompts · Progress ·
  Streak. Each with one line of plain description.
- **Quiet hours** — from/to time pickers, with a line stating what actually happens:
  *"Nudges wait until quiet hours end. Reminders you set yourself still come through."*
- **Hide guest names on the lock screen** (D-10) with its own line of explanation.
- **When permission is denied**, a card at the top — not a toast — explaining that
  notifications are off at the OS level, what still works (Today and the widget), and a
  button that opens OS settings (`utils/openLocationSettings.ts` already has the pattern
  for this).

## 8. Copy registry

`constants/roast-copy.ts`. Every string in one file, because a notification body written
inline is a string nobody reviews and nobody can find. Mirrors `INFRA-13` in the Workforce
catalog.

**Voice:** warm, direct, second person, present tense. Names the guest. Never guilts.
Never uses "should". Never says "you have 3 pending items" when it can say "3 guests need
you today".

| Key | Copy |
|---|---|
| `digest.single.call` | **{Name} is due for a call today** / *They've been waiting to hear from you.* |
| `digest.single.followUp` | **{Name} needs a follow-up** / *{n} days since you last spoke.* |
| `digest.few` | **{n} guests need you today** / *{A}, {B} and {C} — tap to see what's due.* |
| `digest.many` | **{n} guests need you today** / *{m} overdue. Start with {A}.* |
| `digest.evening` | **How did the call with {Name} go?** / *Add a note while it's fresh.* |
| `invite` | **Invite your guests to Sunday service** / *{n} of yours haven't been asked yet.* |
| `reminder` | **{Name}** / *{note}* |
| `streak.atRisk` | **🔥 {n} Days on! Keep the fire going** / *You haven't roasted your game today. Check in now to keep your streak.* |
| `streak.milestone.7` | **7-day streak!** / *You showed up all week.* |
| `streak.saved` | **Your streak was saved** / *A freeze covered yesterday. {n} left.* |
| `widget.empty` | *All roasted for today 🔥* |
| `widget.footerHealthy` | *{n} days on — keep the fire going.* |
| `widget.footerAtRisk` | *Roast your game today 🔥* |
| `today.empty.title` | **All roasted for today** |
| `reminder.pastTime` | *That's already passed — pick a later time.* |

Gendered pronouns come from `Guest.gender` where present; **`they/them` when it is absent**
— never inferred from the name.

## 9. Motion

Restrained, and constrained by a real platform bug in this app.

| Moment | Motion |
|---|---|
| Task completed | Row checkbox springs, row fades and collapses **via height/opacity `useAnimatedStyle`**, not `layout` |
| Reminder created | New row scales 0.96→1 with opacity |
| Streak increments | Number counts up (`use-count-up`, already a dependency); ember pulses once |
| Milestone | Lottie confetti + `Haptics.notificationAsync(Success)` |
| Pull to refresh | Standard platform control |

⚠️ **No reanimated `entering` / `exiting` / `layout` props anywhere in this feature.**
They trigger a native `dispatchGetDisplayList` NPE on Android under the new architecture in
this app. Property animations through `useAnimatedStyle` are a separate, safe subsystem —
everything above uses those.

## 10. Accessibility

- Every task row: `accessibilityLabel` reading the full sentence — *"Call Emeka, overdue,
  3 days since last contact"* — and `accessibilityRole="button"` on the actions.
- The ember is decorative: `accessibilityElementsHidden`, with the day count carrying the
  label *"12 day streak, active"* / *"…at risk"*.
- Overdue is never signalled by colour alone — the accent bar has a matching "Overdue"
  label.
- Contrast ≥ 4.5:1 in both themes; the amber ember on the dark background is the pairing
  most likely to fail and needs a check.
- Reduce Motion disables the ember loop, the count-up and the confetti.
- Dynamic Type: task titles wrap to two lines before truncating.

## 11. Dark mode

`useColorScheme()` drives it as everywhere else. Two specifics: the ember's amber needs a
slightly desaturated dark-mode variant or it blooms, and the overdue accent uses
`destructive` rather than a raw red so it inherits both themes.
