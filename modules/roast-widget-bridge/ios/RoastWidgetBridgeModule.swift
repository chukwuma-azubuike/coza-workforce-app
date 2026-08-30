import ExpoModulesCore
import WidgetKit

/**
 * Bridges the Roast widget snapshot into the App Group container.
 *
 * Deliberately tiny. Everything that decides *what* the widget shows — ordering,
 * truncation, the first-name-only redaction — lives in `utils/widget-bridge.ts`, on the
 * JS side, where it is shared with Android and can be changed over the air. This module
 * only moves an already-composed string across the sandbox boundary, because that is the
 * one thing JS cannot do.
 */
public class RoastWidgetBridgeModule: Module {
    public func definition() -> ModuleDefinition {
        Name("RoastWidgetBridge")

        Function("setSnapshot") { (appGroup: String, key: String, json: String) -> Bool in
            // A nil suite means the App Group entitlement is missing from this build.
            // Reported rather than thrown: the app must keep working with a stale widget.
            guard let defaults = UserDefaults(suiteName: appGroup) else {
                return false
            }

            defaults.set(json, forKey: key)

            // Without this the widget keeps its last frame until WidgetKit next feels like
            // waking it — up to fifteen minutes. At sign-out that frame is the previous
            // user's guest names, still on the home screen.
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }

            return true
        }

        Function("reloadWidgets") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
