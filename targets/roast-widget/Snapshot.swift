import Foundation

/**
 A mirror of `IRoastWidgetSnapshot` in `utils/widget-bridge.ts`.

 ⚠️ The two must be changed together. There is no shared schema and no codegen between
 them — the app writes JSON into the App Group and this decodes it, so a field renamed on
 one side and not the other fails at runtime, silently, on a home screen.

 Every property that could reasonably be absent is optional with a default. A widget in an
 already-installed binary will routinely read a snapshot written by a *newer* app after an
 `eas update`, and the correct response to an unexpected shape is to render the last good
 state, never to crash.
 */
struct RoastWidgetSnapshot: Codable {
    var v: Int
    var isSignedIn: Bool
    var generatedAt: String
    var counts: Counts
    var items: [Item]
    var streak: Streak
    var totalItems: Int

    struct Counts: Codable {
        var due: Int
        var overdue: Int
        var total: Int
    }

    struct Item: Codable, Identifiable {
        var id: String
        var title: String
        var subtitle: String?
        var dueAt: String
        var isOverdue: Bool
        var kind: String
        var completable: Bool
        var deepLink: String

        /// `dueAt` as a date, for the timeline. Invalid input sorts to the distant future
        /// rather than to 1970, which would make every malformed row look overdue.
        var dueDate: Date {
            ISO8601DateFormatter.roast.date(from: dueAt) ?? Date.distantFuture
        }
    }

    struct Streak: Codable {
        var current: Int
        var isAtRisk: Bool
        var longest: Int
    }

    var generatedDate: Date {
        ISO8601DateFormatter.roast.date(from: generatedAt) ?? Date.distantPast
    }

    /// More than six hours old. The footer then says so rather than sounding live.
    var isStale: Bool {
        Date().timeIntervalSince(generatedDate) > 6 * 60 * 60
    }

    /// What a widget shows before the app has ever written anything, and in the previews.
    static let signedOut = RoastWidgetSnapshot(
        v: 1,
        isSignedIn: false,
        generatedAt: ISO8601DateFormatter.roast.string(from: Date()),
        counts: Counts(due: 0, overdue: 0, total: 0),
        items: [],
        streak: Streak(current: 0, isAtRisk: false, longest: 0),
        totalItems: 0
    )
}

extension ISO8601DateFormatter {
    /// JS `toISOString()` always emits fractional seconds; the default formatter rejects them.
    static let roast: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}

enum SnapshotStore {
    /// Must match `WIDGET_SNAPSHOT_KEY` in `utils/widget-bridge.ts`.
    static let key = "roast.widget.snapshot.v1"

    /**
     The App Group, derived from this extension's own bundle id.

     The extension is `com.cozaworkforceapp[.staging].roastwidget`, so dropping the
     `.roastwidget` suffix recovers the app's bundle id and the group is that plus
     `.roast` — which is exactly the rule `app.config.js` follows when it writes the
     entitlement.

     Derived rather than hardcoded because the suffix is per-variant: a literal here would
     be a third place the staging/production split has to be maintained, and the failure
     mode when somebody misses one is a staging widget rendering production guest names.

     ⚠️ This mirrors `roastAppGroupFor()` in `app.config.js`. Change one, change both.
     */
    static var appGroup: String {
        let extensionSuffix = ".roastwidget"
        let bundleId = Bundle.main.bundleIdentifier ?? ""

        let appBundleId = bundleId.hasSuffix(extensionSuffix)
            ? String(bundleId.dropLast(extensionSuffix.count))
            : bundleId

        return "group.\(appBundleId).roast"
    }

    static func load() -> RoastWidgetSnapshot {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let json = defaults.string(forKey: key),
            let data = json.data(using: .utf8),
            let snapshot = try? JSONDecoder().decode(RoastWidgetSnapshot.self, from: data),
            snapshot.v == 1
        else {
            return .signedOut
        }

        return snapshot
    }
}
