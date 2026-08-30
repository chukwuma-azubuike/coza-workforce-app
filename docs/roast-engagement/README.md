# Roast — Notifications, Reminders, Widget & Streaks

Planning set for the Roast engagement feature suite (EPIC 1–4 of *Roast — Notifications,
Reminders, Widget & Streaks*).

Read in order. Each document assumes the decisions made in the one before it.

⚠️ **00–06 describe intent, and the feature has since been built.** Where the code and
these documents disagree, [`07_AS_BUILT.md`](./07_AS_BUILT.md) is correct — it records
every deviation and why, rather than editing the reasoning out of the originals.

| # | Document | Audience | What it settles |
|---|---|---|---|
| 00 | [Technical PRD](./00_TECHNICAL_PRD.md) | Everyone | Scope, the eleven decisions this feature turns on, what we are *not* building, success metrics |
| 01 | [Architecture](./01_ARCHITECTURE.md) | Backend + mobile leads | The two-backend problem, the one-transport rule, event flow, ADRs, failure modes |
| 02 | [Backend specification](./02_BACKEND_SPEC.md) | Roast API + Notification Service | Data models, endpoints, jobs, digest and streak algorithms, payload contracts |
| 03 | [Mobile specification](./03_MOBILE_SPEC.md) | React Native | File map, RTK Query services, local scheduler, notification actions, routes, offline queue |
| 04 | [Widget specification](./04_WIDGET_SPEC.md) | React Native + native | iOS WidgetKit / Android RemoteViews, the snapshot contract, build and privacy implications |
| 05 | [UX specification](./05_UX_SPEC.md) | Design + React Native | Screen-by-screen, copy registry, motion, empty states, accessibility |
| 06 | [Delivery plan](./06_DELIVERY_PLAN.md) | PM + leads | Phasing, ticket breakdown, sequencing, risk register, test plan |
| 07 | [As built](./07_AS_BUILT.md) | Everyone | What shipped, and every place it differs from 00–06 — including seven API contract corrections |

## Relationship to the existing notification docs

Three documents already sit in [`/docs`](../) and describe the **Workforce** notification
platform, which is live:

- [`MOBILE_NOTIFICATION_INTEGRATION.md`](../MOBILE_NOTIFICATION_INTEGRATION.md) — the
  push payload contract, device-token lifecycle, Android channels, deep-link rules.
- [`MOBILE_NOTIFICATION_IMPLEMENTATION_PLAN.md`](../MOBILE_NOTIFICATION_IMPLEMENTATION_PLAN.md)
  — the client-side plan those contracts were built against.
- [`NOTIFICATION_USER_STORIES.md`](../NOTIFICATION_USER_STORIES.md) — the Workforce
  notification catalog and the cross-cutting `INFRA-*` stories.

**This set does not replace them, and deliberately does not re-specify anything they
already settle.** Roast is a *producer* on the platform those documents describe. Where
this set says "the Notification Service", it means the service specified there — device
tokens, inbox rows, quiet hours, dedupe and Expo delivery are already solved, already
shipped, and must not be solved a second time inside Roast. See
[ADR-001](./01_ARCHITECTURE.md#adr-001--roast-does-not-own-a-push-transport).

Two `INFRA-*` stories in that catalog are hard dependencies here and are called out as
such throughout: `INFRA-1` (per-category preferences) and `INFRA-2` (quiet hours &
timezone).
