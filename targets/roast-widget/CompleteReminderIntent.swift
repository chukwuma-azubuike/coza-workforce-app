import AppIntents
import WidgetKit
import Foundation

/**
 Marks a reminder done from the widget, without opening the app. iOS 17+.

 ## Why it writes to a file instead of calling the API

 A widget extension has no auth context and a memory budget measured in tens of megabytes.
 It could technically make a network request; it would be wrong to. So the intent appends
 the completion to a queue in the **App Group** and optimistically removes the row, and the
 app drains that queue into its outbox on next foreground — where retries, ordering and
 idempotency already live.

 That is also why the row must disappear here rather than after a round trip: there is no
 round trip to wait for. A checkbox that visibly does nothing is indistinguishable from a
 broken one, and this one has to look right with the app closed and the phone offline.

 Below iOS 17 this type is simply never referenced — the view falls back to a deep link
 (US-3.6's stated fallback), which is the only interaction the OS offers there.
 */
@available(iOS 17.0, *)
struct CompleteReminderIntent: AppIntent {
    static var title: LocalizedStringResource = "Mark reminder done"

    /// The app is never launched; the whole point is completing in place.
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Reminder")
    var reminderId: String

    init() {}

    init(reminderId: String) {
        self.reminderId = reminderId
    }

    func perform() async throws -> some IntentResult {
        CompletionQueue.enqueue(reminderId: reminderId)
        CompletionQueue.removeFromSnapshot(reminderId: reminderId)

        WidgetCenter.shared.reloadAllTimelines()

        return .result()
    }
}

/**
 The App Group side of `utils/widget-completion-queue.ts`.

 ⚠️ The key and the entry shape are mirrored in that file by hand. The app reads what this
 writes; a change on either side alone loses completions silently, which is the single
 worst failure this feature can have — a reminder the worker already dismissed comes back,
 and they learn the button does not work.
 */
enum CompletionQueue {
    static let key = "roast.widget.completions.v1"

    private struct Entry: Codable {
        let reminderId: String
        let at: String
    }

    static func enqueue(reminderId: String) {
        guard let defaults = UserDefaults(suiteName: SnapshotStore.appGroup) else { return }

        var entries = load(from: defaults)

        // A double tap is one completion.
        guard !entries.contains(where: { $0.reminderId == reminderId }) else { return }

        entries.append(Entry(reminderId: reminderId, at: ISO8601DateFormatter.roast.string(from: Date())))

        if let data = try? JSONEncoder().encode(entries), let json = String(data: data, encoding: .utf8) {
            defaults.set(json, forKey: key)
        }
    }

    /// Drops the row from the stored snapshot so the widget redraws without it immediately.
    static func removeFromSnapshot(reminderId: String) {
        guard let defaults = UserDefaults(suiteName: SnapshotStore.appGroup) else { return }

        var snapshot = SnapshotStore.load()

        // Matched on `reminderId`, not `id`: the button carries the reminder's document
        // id, which is the only one the server accepts. See `Snapshot.Item.reminderId`.
        guard snapshot.items.contains(where: { $0.reminderId == reminderId }) else { return }

        snapshot.items.removeAll { $0.reminderId == reminderId }
        snapshot.totalItems = max(0, snapshot.totalItems - 1)
        snapshot.counts.due = max(0, snapshot.counts.due - 1)
        snapshot.counts.total = max(0, snapshot.counts.total - 1)

        if let data = try? JSONEncoder().encode(snapshot), let json = String(data: data, encoding: .utf8) {
            defaults.set(json, forKey: SnapshotStore.key)
        }
    }

    private static func load(from defaults: UserDefaults) -> [Entry] {
        guard
            let json = defaults.string(forKey: key),
            let data = json.data(using: .utf8),
            let entries = try? JSONDecoder().decode([Entry].self, from: data)
        else {
            return []
        }

        return entries
    }
}
