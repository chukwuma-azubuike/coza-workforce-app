# Roast — Elevating the widget UI · Implementation plan

**Status: built.** §8 records what changed on the way.

The widget works and says the right things. It does not look like something anyone chose.
This plans the visual rework of both platforms, plus the one piece of _content_ that is
missing — the note under each row, which is already in the snapshot and rendered by
neither widget.

---

## 1. Why it reads as flat

Not opinion — eight specific things, each fixable.

**1. There is no type hierarchy.** Four roles are set at 13, 13, 11 and 11 points. The
row's title — the actual content — is the same size as the header count and one weight
step from it. Nothing leads, so the eye has nowhere to land.

**2. Colour carries no structure.** `$accent` appears on exactly one element in the whole
widget: the checkmark glyph. Everything else is foreground, muted, or destructive. The
brand is invisible and the surface is monochrome by accident rather than by choice.

**3. The streak is a raw emoji.** `Text("🔥 \(current)")` at 13pt. On Android that flame is
drawn by whatever the OEM ships — Samsung's is not Google's is not OnePlus's. It is also
the one delightful thing in the feature; the app renders it as a live Skia flame and the
widget gives it the least attention of any element on the surface.

**4. Every row looks identical.** A call, an invite, a note and a reminder are the same
two lines of text. The only differentiator on the whole surface is a 3pt red bar for
overdue. A widget's entire job is triage at a glance, and this one cannot be triaged.

**5. Row geometry shifts between rows.** The overdue rail is _inserted into_ the flex row
only when overdue, so an overdue row's text starts 11pt further right than a normal one's.
Nothing else on the surface says "unfinished" as loudly as text that does not align.

**6. It is an edge-to-edge flat fill.** One background colour, one padding, no separation
between the header band and the content, no card, no gradient, no hairline. Both platforms
can do considerably better than a rectangle.

**7. The footer is one grey 11pt line doing four unrelated jobs** — stale, "+N more",
at-risk, and streak — at identical (zero) emphasis, while occupying a full row's worth of
vertical space. It is the least valuable area on the widget and takes ~11% of it.

**8. The subtitle is thrown away.** `IRoastWidgetSnapshotItem.subtitle` is populated by
`buildWidgetSnapshot`, redacted correctly under `hideGuestNames`, decoded by
`Snapshot.swift` — **and rendered by neither platform.** The widget already holds the most
informative string it has and drops it on the floor. This is the note the ask is about.

---

## 2. What each platform can actually do

Verified against the installed versions rather than assumed, because the plan lives or
dies on it.

| Capability                           | iOS (WidgetKit)                              | Android (`react-native-android-widget@0.22.1`)                                        |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Gradients                            | ✅ any SwiftUI view in `containerBackground` | ✅ `backgroundGradient` — from/to plus 8 orientations                                 |
| Rounded cards, per-corner radii      | ✅                                           | ✅ `borderTopLeftRadius` etc.                                                         |
| Vector icons                         | ✅ SF Symbols, free                          | ✅ `SvgWidget` takes an **inline SVG string** — no font to install, no asset pipeline |
| Layering                             | ✅ `ZStack`                                  | ✅ `OverlapWidget`                                                                    |
| Font weight / tracking / line height | ✅                                           | ✅ `fontWeight`, `letterSpacing`, `lineHeight`, `fontFamily`                          |
| Auto-shrink to fit                   | ✅ `minimumScaleFactor`                      | ✅ `adjustsFontSizeToFit`                                                             |
| **Shadows / elevation**              | ❌                                           | ❌                                                                                    |
| **Animation**                        | ❌                                           | ❌                                                                                    |
| **Blur / material**                  | ⚠️ only the system's own container           | ❌                                                                                    |

The one that shapes the design: **neither platform can draw a shadow.** So depth has to
come from gradient, hairline and layered fills. Faking a shadow with a dark rectangle is
what makes a widget look cheap, and it is the trap to avoid.

The one that is better than expected: **`SvgWidget` accepts a raw SVG string.** Real vector
iconography on Android with no font installation and no drawable pipeline — which is what
makes item 4 above cheap to fix on both platforms at once.

---

## 3. The design

### 3.1 Now

```
┌──────────────────────────────────────────────┐
│ 3 due · 1 overdue                     🔥 5   │
│ ──────────────────────────────────────────── │
│ ▌Ada — call back re: baptism         ( ✓ )   │
│  Overdue · 9:00 AM                           │
│ ──────────────────────────────────────────── │
│  Bola needs a follow-up              ( ✓ )   │
│  2:30 PM                                     │
│ +2 more in Roast                             │
└──────────────────────────────────────────────┘
```

### 3.2 Proposed

```
┌────────────────────────────────────────────────┐
│  3 due · 1 overdue              ⌜+2⌟  ⌜🔥 5⌟  │
│                                                │
│ ╭────────────────────────────────────────────╮ │
│ │▌  ✆   Ada — call back      OVERDUE   ⦿    │ │
│ │▌      re: baptism class     9:00 AM        │ │
│ ╰────────────────────────────────────────────╯ │
│ ╭────────────────────────────────────────────╮ │
│ │   ↩   Bola needs a follow-up  2:30 PM  ⦿   │ │
│ │       Last spoke 12 days ago               │ │
│ ╰────────────────────────────────────────────╯ │
└────────────────────────────────────────────────┘
```

### 3.3 The moves

**M1 — A real type scale.** `15 semibold` title / `12 regular` subtitle / `11 medium` meta
/ `13 bold` header count. Three clear steps replacing four indistinguishable ones. Tracking
of `-0.2` on the title, `+0.4` on the uppercase `OVERDUE` label.

**M2 — A glyph per kind, in one accent — not six.** `REMINDER` bell, `CALL_DUE` phone,
`FOLLOW_UP` return arrow, `INVITE` envelope, `NOTE` pencil, `PROGRESS` upward chart.

> Six kinds tinted six colours is the obvious move and it is wrong: it turns a work surface
> into a toy and it destroys the one signal that matters, which is overdue. **The glyph is
> always `$accent`, and switches to `$overdue` when the row is overdue.** Shape carries the
> kind; colour carries the urgency.

SF Symbols on iOS, inline SVG strings on Android. The two cannot share an asset, so they
share a **table** — one mapping in this document and in `constants/widget-glyphs.ts`, with
the Swift side naming the SF Symbol beside a comment pointing at it.

**M3 — The rail always occupies its lane.** 3pt wide, full row height, `Color.clear` when
the row is not overdue. Fixes the left-edge jitter in item 5 for the cost of nothing. The
overdue row additionally takes a `$overdue` fill at 6%, so it reads as a band rather than a
tick.

**M4 — The streak becomes a capsule, and earns its place.** A pill: ember gradient
(`#F59E0B → #EA580C`, `TL_BR`), white bold numeral, small flame glyph, ~44×22. At risk it
inverts — hollow, ember 1pt border, ember numeral — which is a stronger "something is
wrong" signal than the current 55% opacity, and survives a monochrome render.

**M5 — Depth from gradient and hairline, never a fake shadow.** Container fills with a
vertical gradient (`#FFFFFF → #F7F7F8` light, `#1C1C1F → #131316` dark) and takes a 1pt
border at 8% foreground. That reads as a card on both platforms without either of them
having to draw something it cannot.

**M6 — Rows become cards.** Each row on its own rounded rect (12pt radius, foreground at
4%, 6pt gap). This is the single largest lever on the list: it is what separates "a list of
text" from "a designed surface", and both platforms support it directly.

**M7 — The checkbox becomes an affordance.** Today it is a bare `✓` inside a hairline
circle, which reads as decoration. Make it a 32pt filled circle — `$accent` at 12% — with
the accent tick centred. It has to look pressable, because on iOS 17+ it genuinely is.

**M8 — The footer becomes conditional, and the header takes its job.** The footer renders
**only** when the widget has something to admit: stale data, or a streak at risk. `+N more`
becomes a small count chip beside the streak pill; the healthy-streak line goes away
entirely, because the pill already says it. This is what pays for M9.

**M9 — Notes.** `subtitle` renders under the title, `maxLines: 1`, muted, 12pt. No backend
work: it is already in the snapshot, already decoded on both platforms, and already
redacted to `undefined` under `hideGuestNames`, so the privacy rule needs no new thought.

**M10 — Empty and signed-out get composed.** Currently an emoji and a grey sentence. Give
them a centred ember mark, a headline at 15 semibold and a subline at 12 muted — the same
three-part structure as the app's own empty states.

---

## 4. The vertical budget, and where Android runs out

This is the part that decides whether the notes fit.

**iOS `systemMedium`** is roughly 155–170pt tall depending on device, ~130pt after padding:

|                                                   | pt      |
| ------------------------------------------------- | ------- |
| Header (count + pills)                            | 24      |
| Gap                                               | 8       |
| Row card ×2 (title 18 + subtitle 15 + padding 13) | 92      |
| Gap between rows                                  | 6       |
| **Total**                                         | **130** |

It fits — but **only because M8 removed the unconditional footer.** The notes and the
footer cannot both exist. When the footer does appear (stale, at-risk) it displaces the
second row's subtitle, which is the right thing to lose.

**Android is the real constraint.** The manifest declares `minHeight: '110dp'`, and 130dp
of content does not fit in 110dp. Two options:

1. **Raise `minHeight` to `'130dp'`** and keep `targetCellHeight: 2`. A launcher that gives
   less clips from the bottom, and because the footer is already conditional what is lost is
   the second row's note — degrading in the same order as iOS. **Recommended.**
2. **Subtitle on the first row only.** Defensible on its own terms — the top item is the
   one being acted on — and it is the fallback if testing shows real clipping on common
   launchers.

Take option 1, and hold option 2 in reserve for whatever a Samsung launcher does.

---

## 5. The risk that will bite quietly

> **iOS 18 renders widgets in tinted mode, and tinted mode throws away every colour.**

In tinted (and dark-tinted) home screens the system re-renders the widget monochrome from
its alpha channel. The ember gradient flattens. The kind tint vanishes. **The overdue red
vanishes.** A design that leans on colour looks considered on the reviewer's phone and
illegible on the user's.

The existing code already half-anticipates this — _"overdue is never colour alone"_, and
the row says the word `Overdue`. The rework has to hold that line and extend it:

- Every kind must be distinguishable **by glyph shape**, never by tint.
- `OVERDUE` stays as a word, not just a red rail.
- The streak pill keeps its numeral; the flame is decoration, the number is the content.
- The at-risk state inverts the pill's **shape** (hollow vs filled), not only its colour.

Tinted mode must be an explicit item on the test plan, not something discovered in review.

Secondary risks:

| Risk                                               | Handling                                                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dynamic Type / large font scale overflows two rows | `minimumScaleFactor(0.85)` on iOS, `adjustsFontSizeToFit` on Android; subtitle is first to shrink                                                            |
| The two platforms drift apart visually             | Tokens in `constants/widget-theme.ts`, mirrored once in `WidgetTheme.swift` with a ⚠️ pointing both ways — the same discipline `Snapshot.swift` already uses |
| SVG strings bloat the RemoteViews payload          | Six glyphs, hand-minified, ~200 bytes each. Measure before and after; RemoteViews has a hard transaction limit                                               |
| Gradient banding on low-end Android panels         | Keep the two stops within ~4% luminance of each other; it is depth, not decoration                                                                           |

---

## 6. Ticket breakdown

Mobile only. No backend work — every input already exists in the snapshot.

| Ticket    | Work                                                                                                                                           | Est. |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **RE-W1** | `constants/widget-theme.ts` — type scale, colours, radii, spacing. `WidgetTheme.swift` mirroring it, with the drift warning both ways.         | 1    |
| **RE-W2** | `constants/widget-glyphs.ts` — six minified SVG strings; the SF Symbol names beside them in the Swift file. One mapping table, two renderings. | 1    |
| **RE-W3** | iOS: container gradient, row cards, glyph column, always-present rail, streak capsule, checkbox affordance, conditional footer.                | 2    |
| **RE-W4** | Android: the same, in `FlexWidget`/`SvgWidget`/`OverlapWidget`. Raise `minHeight` to `130dp` in `app.json`.                                    | 2    |
| **RE-W5** | Notes — render `subtitle` on both, one line, and confirm the `hideGuestNames` path still drops it.                                             | 0.5  |
| **RE-W6** | Empty, signed-out and stale states recomposed.                                                                                                 | 1    |
| **RE-W7** | iOS 18 tinted + dark-tinted pass; Dynamic Type and Android font-scale pass at the largest steps.                                               | 1    |
| **RE-W8** | Record it in `07_AS_BUILT.md §4`.                                                                                                              | 0.5  |

**~9 days.** No native dependency is added, so unlike the device-reminders work this needs
a rebuild only for the iOS extension — the Android widget is JS and ships over the air.

## 7. Sequencing

1. **RE-W1 and RE-W2 first**, both platforms, before either view is touched. Reworking one
   view against ad-hoc values and extracting tokens afterwards is how the two platforms end
   up 2pt apart everywhere.
2. **RE-W5 next, on its own.** It is half a day, it is the thing that was actually asked
   for, and it is worth having in a build while the rest is still in progress.
3. **RE-W3 and RE-W4 in parallel**, reviewed side by side on two real devices rather than
   in two simulators — OEM launcher padding is the variable that cannot be simulated.
4. **RE-W7 last and non-negotiably.** Tinted mode is the one that makes a good design
   unreadable, and it cannot be checked before the design exists.

---

## 8. As built

All eight tickets shipped. What changed from the plan:

**`widgetFooterFor` was kept and repurposed rather than deleted.** Making the footer
conditional left that helper dead, and the obvious move — inline the rule in each widget —
would have quietly given up the one thing it existed for: _"shared by both platforms so the
two widgets cannot word it differently"_. It now returns `string | null` and both platforms
call the same rule. iOS renders the flame as an SF Symbol rather than the emoji the shared
copy carries, because a symbol takes the ember tint and an emoji ignores it.

**The Android widget's type imports became `import type`.** `widget-bridge.ts` breaks a
require cycle with a lazy `require`, documented as existing because the widget imports
`widgetFooterFor`. The rework briefly made those imports type-only, which would have made
that comment wrong — so the value import is explicit, the type imports erase at build, and
the comment now says the cycle is one edge and warns against relying on it.

**An overdue row with no note still shows its time.** The subtitle slot falls back to the
due time when `subtitle` is absent, because the title row replaces the time with the word
`OVERDUE` — without the fallback, an overdue row with no note would not say _when_.

**`IWidgetPalette` is a widened `Record<…, \`#${string}\`>`.** `typeof WIDGET_COLOURS.light`is a type of literal hex strings that the dark palette cannot satisfy. The template literal
keeps the only constraint that matters —`react-native-android-widget`requires a leading`#`, and reads `#RRGGBBAA`web-style before re-ordering to Android's`#AARRGGBB`.

### Verification

- **All seven Swift files typecheck against the iOS 16 SDK** (`swiftc -typecheck -target
arm64-apple-ios16.0`), exit 0 — which is a stronger gate than this extension has had
  before. It does **not** validate SF Symbol names, which are runtime strings; all six are
  iOS 13-era except `chart.line.uptrend.xyaxis` (iOS 16), which matches the target floor.
- `app.json` now declares `minHeight: '130dp'`, confirmed through `expo config --type
introspect`.
- The Android bundle exports clean.

### Still unverified, and only a device can

The whole point of the rework is how it _looks_, and none of the above sees a pixel:

1. **iOS 18 tinted and dark-tinted home screens** — the risk in §5. Everything meaningful is
   carried by shape and word, but that is a claim until someone looks at it.
2. **OEM launcher padding on Android.** 130dp is what the manifest asks for; what Samsung's
   or Xiaomi's launcher actually gives is the variable no simulator reproduces. If rows
   clip, option 2 in §4 — note on the first row only — is the fallback.
3. **Gradient banding** on low-end panels. The two stops sit ~3% apart to avoid it.

---

## 9. Row actions — call, WhatsApp, text

Added after the UI rework shipped. The widget could name the person who needed calling and
offer no way to call them; the only control on the surface was Mark done.

### 9.1 The shape

```
┌────────────────────────────────────────────────────┐
│  3 due · 1 overdue                  ⌜+2⌟  ⌜🔥 5⌟  │
│                                                    │
│ ╭────────────────────────────────────────────────╮ │
│ │▌  ✆  Ada — call back      OVERDUE  ✆ 💬 💬 ⦿  │ │
│ │▌     9:00 AM · re: baptism class               │ │
│ ╰────────────────────────────────────────────────╯ │
│ ╭────────────────────────────────────────────────╮ │
│ │   ↩  Bola needs a follow-up        ✆ 💬 💬 ⦿   │ │
│ │      2:30 PM · Last spoke 12 days ago          │ │
│ ╰────────────────────────────────────────────────╯ │
└────────────────────────────────────────────────────┘
```

Four circles at 28, gap 3, in one group. **Hierarchy is fill weight, not size**: Mark done
is solid accent with a white tick, the three contact buttons are accent at 12% with an
accent glyph, and all four are the same circle. A cluster whose primary is merely bigger
reads as four unrelated controls rather than one.

`M7`'s rule still holds and now matters more — a control that reads as decoration does not
get pressed, and that is truer of four small controls than it was of one.

### 9.2 Where the space came from

The cluster is ~117dp of a ~300dp row. Something on the title line had to go, and the
candidates were the title, the time and the `OVERDUE` word.

- The **title** is the row's content. Not negotiable.
- `OVERDUE` is the one thing that has to be legible without being read, and it survives a
  monochrome render where the rail alone does not. Not negotiable either.
- The **time** moved down, and the note line became `7:30 PM · <note>`.

That is a gain, not a concession. Under the old layout an overdue row showed `OVERDUE` on
the title line and the note underneath, so **an overdue row with a note never stated its
time at all** — the exact row where the time matters most. Every row now does.

The vertical budget is unchanged: the cluster is 28 tall against a text block of ~35, so
it costs nothing at all.

### 9.3 Why the two platforms differ

|               | Android                                              | iOS                         |
| ------------- | ---------------------------------------------------- | --------------------------- |
| Mechanism     | `OPEN_URI` → `ACTION_VIEW` in the library's receiver | `Link` → the containing app |
| App launched? | No                                                   | Yes                         |
| Works offline | Yes                                                  | Yes                         |

**A WidgetKit `Link` does not open the URL it names.** Whatever the scheme, iOS hands it to
the containing app — so a `tel:` link on a widget reaches the app's URL handler and dials
nothing. The iOS buttons therefore point at `myapp://roast-crm/contact?channel=…&phone=…`,
a screen that fires the real URL from inside the app and `replace`s itself with Today, so
returning from the dialer lands on the feed rather than on a dead handoff screen.

⚠️ The number is percent-encoded against `.alphanumerics`, not `.urlQueryAllowed`. A
leading `+` survives the query set intact and is then read back as a space by the app's
parser — `+2348012345678` becomes a number that dials nothing, silently.

Android needs none of that: the receiver fires the intent from the launcher and nothing
else wakes. Levelling iOS's hop down onto Android would be giving up the better behaviour
for symmetry, which is the same call the completion path made.

### 9.4 WhatsApp has no glyph either platform can share

Its brand mark is not an SF Symbol and never will be, and a green tile would be the only
branded colour on a surface whose entire colour budget is spent on urgency. So the strip is
**semantic rather than branded**: a handset is a call, one bubble is a text message, two
bubbles are the chat app. That survives §5's tinted mode, which a brand colour would not,
and the accessibility label carries the word regardless.

### 9.5 What this does not do

- **No engagement ping from an Android tap.** No JS runs, so nothing can be queued. This
  matches the app, where `Today`'s call button does not ping either — contacting a guest is
  not a `QUALIFYING_ACTION_KIND`. If that ever changes, the Android path cannot follow it
  without giving up in-place opening.
- **No contact history.** `openPhoneAndPersist` records an outgoing call against the guest
  timeline; the widget's buttons are `openPhoneNumber`'s equivalent and record nothing.

### 9.6 As built

**A latent completion bug surfaced while wiring the cluster.** The checkbox sent
`item.id` — the task's **composite** id — where `/reminders/:id/complete` wants the
reminder's document id. Every widget completion since launch queued, removed its row, and
was rejected; the reminder returned on the next sync. The snapshot now carries `reminderId`
separately, both platforms send it, both optimistic removals match on it, and `completable`
is false without it. See [`07_AS_BUILT.md §4`](./07_AS_BUILT.md).

**`contactUrlFor` moved to `utils/contact-links.ts`.** Its old home imports
`roastCRMActions`, and the Android widget renders inside a headless task Android gives a
few seconds to live. `views/roast-crm/utils/communication.ts` re-exports it, so no existing
call site moved.

**`WIDGET_SPACE.checkbox` became `WIDGET_SPACE.action`,** mirrored into `WidgetTheme.swift`
as `Theme.action`. 32 → 28: four dp per button is four characters of title on the narrowest
device this renders on, and 28 is the floor at which the targets stay hittable.

### Verification

- Swift typechecks against the iOS 16 SDK (`swiftc -typecheck -target arm64-apple-ios16.0`),
  exit 0.
- `tsc --noEmit` clean across every touched file; the Android bundle exports clean.
- SF Symbols used: `phone.fill` (iOS 13), `bubble.left.and.bubble.right.fill` (iOS 13),
  `message.fill` (iOS 13) — all below the iOS 16 floor.

### Still unverified, and only a device can

1. **Whether four 28dp targets are hittable** on a real launcher at real widget widths.
   The fallback is dropping Text, which is the least-used of the three.
2. **`https://wa.me/…` routing to WhatsApp rather than a browser** from a launcher-fired
   `ACTION_VIEW`. It works from inside the app because WhatsApp verifies the domain as an
   app link; nothing about that changes with the caller, but it has not been watched.
3. **Title truncation on a 4-column widget on a 320dp screen** — the narrowest case, and
   the one the time badge was moved to protect.

## 10. The iOS widget rendered with no colour at all

Caught from a device screenshot, after the above shipped. Every accent-coloured element on
the iOS widget was invisible: the kind glyph, the mark-done circle, the three contact
buttons and the streak flame. The rows still drew, the text still read, and nothing failed
loudly — the widget simply looked like a list of titles.

**`targets/roast-widget/expo-target.config.js` declared its colours in a shape the plugin
does not read.** `@bacons/apple-targets` v5 takes `{ light, dark }`; the config passed
`{ color, darkColor }`, which its README still shows in one example. The keys are not
validated, so `color.light` was simply `undefined` for all three and every colorset was
generated **empty**.

An empty colorset is worse than a missing one. `Color("$accent")` finds the asset, gets no
colour, and paints nothing — so there is no "asset not found" line in the device log to go
looking for. Everything drawn from `.primary`, `.secondary` or `Color.white` was unaffected
and looked exactly right, which is what made the surface read as a design choice rather
than a fault.

Two things it hid that are worth recording:

- **The contact strip was never actually missing.** Its glyphs are `Theme.accent` and its
  fill is `Theme.accent` at 12%, so a row _with_ a number rendered three invisible buttons.
  Absent and unpaintable are indistinguishable on the surface.
- **It explains the early truncation of the meta line.** The cluster still claimed its
  ~117dp of the row, so the note truncated against a gap with nothing drawn in it — which
  looks like a layout bug and is not one.

The Android widget could not have caught this: `constants/widget-theme.ts` carries the same
three colours as hex in JS and never touches an asset catalog. That is the mirroring hazard
`WidgetTheme.swift`'s header warns about, arriving from the direction the warning did not
anticipate — not a drift between the two palettes, but one of them not existing.

**This ships in the binary, not over the air.** It needs a `prebuild` so the colorsets
regenerate, and a build — `eas update` cannot carry it.
