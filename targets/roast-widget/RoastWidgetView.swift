import SwiftUI
import WidgetKit

/**
 The `systemMedium` layout — header, two row cards, conditional footer.

 Medium only, by decision: it is the size most people actually place, and one layout per
 platform is one set of truncation rules to get right rather than three.

 The five states from the spec all render through this one view rather than through
 separate ones, because four of them differ by a line of copy and a colour. Splitting them
 is how two of them quietly stop matching the app.

 ## The vertical budget

 Medium gives roughly 130pt of content after padding, and this spends all of it:
 header 24 + gap 8 + two 46pt row cards + a 6pt gap between them. **That is only possible
 because the footer is conditional** — see `footer`. The note under each row and an
 always-present footer line cannot both exist, and when the footer does appear it displaces
 the second row's note, which is the right thing to lose.

 ## Tinted mode

 iOS 18 re-renders widgets monochrome from the alpha channel on tinted home screens: the
 ember gradient flattens, the accent goes, **and the overdue red goes with it**. Nothing
 here may depend on colour alone — the row says the word `OVERDUE`, the kind is a
 silhouette rather than a tint, the streak pill inverts its *shape* when at risk, and the
 pill's numeral is the content with the flame as decoration.
 */
struct RoastWidgetView: View {
    var entry: RoastEntry

    private var snapshot: RoastWidgetSnapshot { entry.snapshot }

    /// The medium family shows two. The snapshot carries six so the row budget can change
    /// without an app release.
    private var rows: [RoastWidgetSnapshot.Item] { Array(snapshot.items.prefix(2)) }

    private var remaining: Int { max(0, snapshot.totalItems - rows.count) }

    /// Shown only when the widget has something to admit. See `footer`.
    private var hasFooter: Bool { snapshot.isStale || snapshot.streak.isAtRisk }

    var body: some View {
        if !snapshot.isSignedIn {
            signedOut
        } else {
            VStack(alignment: .leading, spacing: Theme.headerGap) {
                header

                if rows.isEmpty {
                    empty
                } else {
                    VStack(spacing: Theme.rowGap) {
                        ForEach(rows) { item in
                            row(item)
                        }
                    }
                }

                if hasFooter {
                    footer
                }
            }
        }
    }

    // MARK: - States

    private var signedOut: some View {
        VStack(spacing: 4) {
            emberMark
            Text("Sign in to see your guests")
                .font(Theme.title)
                .multilineTextAlignment(.center)
            Text("Your guests and your streak, on your home screen.")
                .font(Theme.subtitle)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var empty: some View {
        VStack(spacing: 3) {
            emberMark
            Text("All roasted for today")
                .font(Theme.title)
            Text("Nothing is due. You're ahead of it.")
                .font(Theme.subtitle)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    /// The one piece of ornament on the surface, and the only place the ember appears at size.
    private var emberMark: some View {
        Text("🔥")
            .font(.system(size: 20))
            .frame(width: 34, height: 34)
            .background(Circle().fill(Theme.accentFill))
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 6) {
            Text(countLabel)
                .font(Theme.figure)
                .foregroundStyle(snapshot.counts.overdue > 0 ? Theme.overdue : Color.primary)
                .lineLimit(1)

            Spacer(minLength: 4)

            // "+N more" moved out of the footer and into a chip, which is what pays for
            // the note under each row.
            if remaining > 0 {
                Text("+\(remaining)")
                    .font(Theme.label)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.pillRadius, style: .continuous)
                            .fill(Theme.rowFill)
                    )
            }

            streakPill
        }
        .frame(height: 24)
    }

    private var countLabel: String {
        snapshot.counts.overdue > 0
            ? "\(snapshot.counts.due) due · \(snapshot.counts.overdue) overdue"
            : "\(snapshot.counts.due) due"
    }

    /**
     The streak, as a capsule rather than a bare emoji.

     It was `Text("🔥 5")` at 13pt, drawn by whatever emoji font the device shipped — the
     one delightful thing in the feature getting the least attention on the surface.

     At risk it **inverts** — hollow, ember border, ember numeral — rather than merely
     dimming. A shape change survives tinted mode; an opacity change does not.
     */
    private var streakPill: some View {
        HStack(spacing: 3) {
            Image(systemName: "flame.fill")
                .font(.system(size: 10, weight: .bold))
            Text("\(snapshot.streak.current)")
                .font(Theme.figure)
        }
        .foregroundStyle(snapshot.streak.isAtRisk ? AnyShapeStyle(Theme.ember) : AnyShapeStyle(Color.white))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background {
            if snapshot.streak.isAtRisk {
                RoundedRectangle(cornerRadius: Theme.pillRadius, style: .continuous)
                    .strokeBorder(Theme.ember, lineWidth: 1)
            } else {
                RoundedRectangle(cornerRadius: Theme.pillRadius, style: .continuous)
                    .fill(Theme.emberGradient)
            }
        }
        .accessibilityLabel(
            snapshot.streak.isAtRisk
                ? "Streak at risk, \(snapshot.streak.current) days"
                : "\(snapshot.streak.current) day streak"
        )
    }

    // MARK: - Rows

    private func row(_ item: RoastWidgetSnapshot.Item) -> some View {
        HStack(spacing: 8) {
            /*
             The rail keeps its lane whether or not the row is overdue.

             It used to be *inserted* into the stack only when overdue, so an overdue row's
             text began 11pt further right than a normal one's. Nothing on the surface said
             "unfinished" as loudly as text that did not line up, and a clear rectangle
             fixes it for the cost of nothing.
             */
            RoundedRectangle(cornerRadius: 2)
                .fill(item.isOverdue ? Theme.overdue : Color.clear)
                .frame(width: Theme.railWidth)

            Image(systemName: WidgetGlyph.name(for: item.kind))
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(item.isOverdue ? Theme.overdue : Theme.accent)
                .frame(width: Theme.glyphColumn)

            VStack(alignment: .leading, spacing: 1) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(item.title)
                        .font(Theme.title)
                        .tracking(Theme.titleTracking)
                        .lineLimit(1)

                    Spacer(minLength: 0)

                    // Never colour alone: the word is what survives tinted mode.
                    if item.isOverdue {
                        Text("OVERDUE")
                            .font(Theme.label)
                            .tracking(Theme.labelTracking)
                            .foregroundStyle(Theme.overdue)
                    } else {
                        Text(timeLabel(item))
                            .font(Theme.meta)
                            .foregroundStyle(.secondary)
                    }
                }

                // The note. Already in the snapshot, already redacted under
                // `hideGuestNames`, and rendered by neither platform until now.
                if let subtitle = item.subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(Theme.subtitle)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.85)
                } else if item.isOverdue {
                    // An overdue row with no note still has to say when it was due.
                    Text(timeLabel(item))
                        .font(Theme.subtitle)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            checkbox(item)
        }
        .padding(.horizontal, Theme.rowPaddingH)
        .padding(.vertical, Theme.rowPaddingV)
        .background(
            RoundedRectangle(cornerRadius: Theme.rowRadius, style: .continuous)
                .fill(item.isOverdue ? Theme.overdueFill : Theme.rowFill)
        )
        // The row itself opens the guest; the checkbox above overrides it.
        .widgetURL(URL(string: item.deepLink))
    }

    /**
     Completion, or the closest the OS allows.

     iOS 17 runs the intent in place and the row disappears without the app opening. Below
     that there are no interactive widgets at all, so the checkbox becomes a deep link —
     the app opens on the guest, where the same action is one tap away. Offering a control
     that looks tappable and silently does nothing would be worse than either.
     */
    @ViewBuilder
    private func checkbox(_ item: RoastWidgetSnapshot.Item) -> some View {
        if item.completable {
            if #available(iOS 17.0, *) {
                Button(intent: CompleteReminderIntent(reminderId: item.id)) {
                    checkboxLabel
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Mark done: \(item.title)")
            } else {
                Link(destination: URL(string: item.deepLink) ?? fallbackURL) {
                    checkboxLabel
                }
                .accessibilityLabel("Open \(item.title) to mark it done")
            }
        }
    }

    /// Filled rather than hairline-outlined, because on iOS 17+ it genuinely is pressable
    /// and a control that reads as decoration does not get pressed.
    private var checkboxLabel: some View {
        Image(systemName: "checkmark")
            .font(.system(size: 13, weight: .bold))
            .foregroundStyle(Theme.accent)
            .frame(width: Theme.checkbox, height: Theme.checkbox)
            .background(
                RoundedRectangle(cornerRadius: Theme.checkboxRadius, style: .continuous)
                    .fill(Theme.accentFill)
            )
    }

    private var fallbackURL: URL {
        URL(string: "myapp://roast-crm/notifications")!
    }

    private func timeLabel(_ item: RoastWidgetSnapshot.Item) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        return formatter.string(from: item.dueDate)
    }

    /**
     The sixth, implicit state: stale — plus the streak warning.

     Rendered **only** when one of those is true. It used to be an unconditional grey line
     doing four unrelated jobs at identical emphasis while taking a full row's worth of
     height; the healthy-streak wording it used to carry is now the pill in the header, and
     "+N more" is the chip beside it. Reclaiming that space is what the note under each row
     is paid for with.

     A widget quietly rendering six-hour-old data as though it were current costs trust in
     everything else it says. Admitting it costs one line — but only the line it needs.

     ⚠️ **Mirrors `widgetFooterFor` in `utils/widget-bridge.ts`.** Same rule, same wording,
     two languages. The flame here is an SF Symbol rather than the emoji the shared copy
     carries, because a symbol takes the ember tint and an emoji ignores it.
     */
    private var footer: some View {
        HStack(spacing: 4) {
            Image(systemName: snapshot.isStale ? "arrow.clockwise" : "flame")
                .font(.system(size: 9, weight: .semibold))
            Text(snapshot.isStale ? "Last updated \(relativeLabel)" : "Roast your game today")
                .font(Theme.meta)
                .lineLimit(1)
        }
        .foregroundStyle(snapshot.isStale ? AnyShapeStyle(Color.secondary) : AnyShapeStyle(Theme.ember))
    }

    private var relativeLabel: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated

        return formatter.localizedString(for: snapshot.generatedDate, relativeTo: Date())
    }
}
