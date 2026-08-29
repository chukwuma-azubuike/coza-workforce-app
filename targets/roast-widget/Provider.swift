import WidgetKit
import SwiftUI

struct RoastEntry: TimelineEntry {
    let date: Date
    /// Already adjusted for `date` — see `Provider.projected`.
    let snapshot: RoastWidgetSnapshot
}

/**
 The timeline, and the one lever we actually control.

 WidgetKit budgets reloads — roughly every fifteen minutes at best, and considerably less
 for an app somebody rarely opens. A naive provider returns one entry ("here is the state
 now") and asks to be woken later. Between wake-ups a task that becomes overdue at 14:00
 still reads "due" until 14:15, so the count on the home screen is wrong for a quarter of
 an hour, several times a day.

 Instead this builds **one entry per moment the display should change**, all computed up
 front from `dueAt` values the snapshot already carries. WidgetKit renders each at its
 moment with no process wake-up and no budget spend: counts flip exactly when they should,
 the ember dims at 15:00 on the dot, and the day rolls over at midnight. The refresh budget
 is then spent only on *new data arriving*, which is what it is for.

 Android has no equivalent. Its thirty-minute period plus explicit updates is the ceiling
 there, and the asymmetry is accepted rather than levelled down.
 */
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> RoastEntry {
        RoastEntry(date: Date(), snapshot: .signedOut)
    }

    func getSnapshot(in context: Context, completion: @escaping (RoastEntry) -> Void) {
        completion(RoastEntry(date: Date(), snapshot: SnapshotStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<RoastEntry>) -> Void) {
        let snapshot = SnapshotStore.load()
        let now = Date()
        let calendar = Calendar.current
        let midnight = calendar.startOfDay(for: now.addingTimeInterval(24 * 60 * 60))

        var moments: [Date] = [now]

        // Every future moment an item tips from "due" into "overdue".
        for item in snapshot.items where item.dueDate > now && item.dueDate < midnight {
            moments.append(item.dueDate)
        }

        // 15:00 local, when a live streak that has not been fed today becomes at-risk.
        // Matches the server's own definition and the local at-risk notification.
        if snapshot.streak.current > 0, !snapshot.streak.isAtRisk,
           let threePM = calendar.date(bySettingHour: 15, minute: 0, second: 0, of: now),
           threePM > now {
            moments.append(threePM)
        }

        // The day rolls over: counts reset to whatever the app writes next, and until it
        // does, the widget should not claim yesterday's numbers.
        moments.append(midnight)

        let entries = Set(moments)
            .sorted()
            .map { RoastEntry(date: $0, snapshot: projected(snapshot, at: $0)) }

        // `.after(midnight)` rather than `.atEnd`: the entries above already carry the
        // display through the day, so there is nothing to ask for until the day changes.
        completion(Timeline(entries: entries, policy: .after(midnight)))
    }

    /**
     The snapshot as it should read at `date`.

     Recomputes `isOverdue` per item and rolls the difference into the overdue count.

     ⚠️ Only the items the snapshot actually carries can be re-evaluated — it holds the
     top six, and a seventh task tipping overdue is invisible until the app writes again.
     That is a deliberate limit of doing this without a network: the alternative is a
     widget that wakes to recount, which is exactly the budget spend this design avoids.
     */
    private func projected(_ snapshot: RoastWidgetSnapshot, at date: Date) -> RoastWidgetSnapshot {
        var projected = snapshot
        var newlyOverdue = 0

        projected.items = snapshot.items.map { item in
            var item = item

            if !item.isOverdue && item.dueDate <= date {
                item.isOverdue = true
                newlyOverdue += 1
            }

            return item
        }

        projected.counts.overdue += newlyOverdue
        projected.counts.due = max(0, projected.counts.due - newlyOverdue)

        // A live streak that has not been fed by 15:00 is at risk — the same rule the
        // server applies, so the widget and the app never disagree about the ember.
        if snapshot.streak.current > 0,
           let threePM = Calendar.current.date(bySettingHour: 15, minute: 0, second: 0, of: date),
           date >= threePM {
            projected.streak.isAtRisk = true
        }

        return projected
    }
}
