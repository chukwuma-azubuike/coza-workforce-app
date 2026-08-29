import SwiftUI
import WidgetKit

/**
 The `systemMedium` layout — header, two rows, footer.

 Medium only, by decision: it is the size most people actually place, and one layout per
 platform is one set of truncation rules to get right rather than three.

 The five states from the spec all render through this one view rather than through
 separate ones, because four of them differ by a line of copy and a colour. Splitting them
 into separate views is how two of them quietly stop matching the app.
 */
struct RoastWidgetView: View {
    var entry: RoastEntry

    private var snapshot: RoastWidgetSnapshot { entry.snapshot }

    /// The medium family shows two. The snapshot carries six so the row budget can change
    /// without an app release.
    private var rows: [RoastWidgetSnapshot.Item] { Array(snapshot.items.prefix(2)) }

    private var remaining: Int { max(0, snapshot.totalItems - rows.count) }

    var body: some View {
        if !snapshot.isSignedIn {
            signedOut
        } else {
            VStack(alignment: .leading, spacing: 6) {
                header

                if rows.isEmpty {
                    Spacer(minLength: 0)
                    Text("All roasted for today 🔥")
                        .font(.system(size: 14, weight: .semibold))
                    Spacer(minLength: 0)
                } else {
                    ForEach(rows) { item in
                        row(item)
                    }
                    Spacer(minLength: 0)
                }

                footer
            }
        }
    }

    private var signedOut: some View {
        VStack(spacing: 4) {
            Text("🔥").font(.system(size: 22))
            Text("Sign in to see your guests")
                .font(.system(size: 13))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var header: some View {
        HStack {
            Text(countLabel)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(snapshot.counts.overdue > 0 ? Color("$overdue") : Color.primary)

            Spacer()

            // The ember is a glyph rather than a drawing here. A widget is looked at for
            // about a second, and an animated flame is not available to it anyway.
            Text("🔥 \(snapshot.streak.current)")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Color("$ember"))
                .opacity(snapshot.streak.isAtRisk ? 0.55 : 1)
        }
    }

    private var countLabel: String {
        snapshot.counts.overdue > 0
            ? "\(snapshot.counts.due) due · \(snapshot.counts.overdue) overdue"
            : "\(snapshot.counts.due) due"
    }

    private func row(_ item: RoastWidgetSnapshot.Item) -> some View {
        HStack(spacing: 8) {
            // Overdue is never colour alone — the time under the title reads "Overdue" too.
            if item.isOverdue {
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color("$overdue"))
                    .frame(width: 3, height: 26)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(item.title)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)

                Text(item.isOverdue ? "Overdue · \(timeLabel(item))" : timeLabel(item))
                    .font(.system(size: 11))
                    .foregroundStyle(item.isOverdue ? Color("$overdue") : Color.secondary)
            }

            Spacer(minLength: 0)

            checkbox(item)
        }
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

    private var checkboxLabel: some View {
        Image(systemName: "checkmark")
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(Color("$accent"))
            .frame(width: 30, height: 30)
            .overlay(Circle().strokeBorder(Color.secondary.opacity(0.3), lineWidth: 1))
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
     The sixth, implicit state: stale.

     A widget quietly rendering six-hour-old data as though it were current costs trust in
     everything else it says. Admitting it costs one line.
     */
    private var footer: some View {
        Text(footerText)
            .font(.system(size: 11))
            .foregroundStyle(.secondary)
            .lineLimit(1)
    }

    private var footerText: String {
        if snapshot.isStale {
            return "Updated \(relativeLabel)"
        }

        if remaining > 0 {
            return "+\(remaining) more in Roast"
        }

        if snapshot.streak.isAtRisk {
            return "Roast your game today 🔥"
        }

        if snapshot.streak.current > 0 {
            let unit = snapshot.streak.current == 1 ? "day" : "days"
            return "\(snapshot.streak.current) \(unit) on — keep the fire going."
        }

        return "All roasted for today 🔥"
    }

    private var relativeLabel: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated

        return formatter.localizedString(for: snapshot.generatedDate, relativeTo: Date())
    }
}
