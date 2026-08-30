import WidgetKit
import SwiftUI

/**
 The widget itself.

 `systemMedium` only — the decision recorded in `04_WIDGET_SPEC.md §9`. Small and large
 remain supported by the snapshot contract (it carries six items where medium shows two),
 so adding them later is a view, not a data change.
 */
struct RoastWidget: Widget {
    let kind: String = "RoastWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                RoastWidgetView(entry: entry)
                    // A gradient rather than `.fill.tertiary`, which is a flat wash.
                    // Neither WidgetKit nor RemoteViews can draw a shadow, so depth has to
                    // come from a gradient and a hairline — and a dark rectangle faking a
                    // shadow is exactly what makes a widget look cheap. The two stops sit
                    // within a few percent of each other on purpose: this is depth, not
                    // decoration, and a wider spread bands on low-end panels.
                    .containerBackground(for: .widget) { Theme.backgroundGradient }
            } else {
                // Pre-17 widgets paint their own background and take their own padding;
                // `containerBackground` does not exist there.
                RoastWidgetView(entry: entry)
                    .padding(14)
                    .background(Theme.backgroundGradient)
            }
        }
        .configurationDisplayName("Roast")
        .description("Who needs you today, and your streak.")
        .supportedFamilies([.systemMedium])
    }
}

@main
struct RoastWidgetBundle: WidgetBundle {
    var body: some Widget {
        RoastWidget()
    }
}
