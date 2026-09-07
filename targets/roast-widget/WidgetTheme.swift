import SwiftUI

/**
 The widget's design tokens.

 ⚠️ **Mirrored from `constants/widget-theme.ts`. Change one, change both.** There is no
 shared build between the JS bundle that draws the Android widget and this extension, so
 this is the same hand-mirroring `Snapshot.swift` lives under — with the difference that a
 drift here is silent and cosmetic rather than a decode failure, which makes it *more*
 likely to survive review.

 `accent`, `ember` and `overdue` resolve through the asset catalog rather than being
 written as hex here, because those three are declared in `expo-target.config.js` and the
 catalog is what gives them their light/dark pair. The rest are computed off the
 environment's own colours so they follow the system automatically.
 */
enum Theme {
    // MARK: - Type

    static let title = Font.system(size: 15, weight: .semibold)
    static let subtitle = Font.system(size: 12, weight: .regular)
    static let meta = Font.system(size: 11, weight: .medium)
    static let figure = Font.system(size: 13, weight: .bold)
    static let label = Font.system(size: 10, weight: .bold)

    /// Applied to `title`. Matches `letterSpacing: -0.2` on the Android side.
    static let titleTracking: CGFloat = -0.2
    /// Applied to uppercase status labels, so they read as labels rather than as words.
    static let labelTracking: CGFloat = 0.4

    // MARK: - Space

    static let headerGap: CGFloat = 8
    static let rowGap: CGFloat = 6
    static let rowPaddingH: CGFloat = 10
    static let rowPaddingV: CGFloat = 7
    static let railWidth: CGFloat = 3
    static let glyphColumn: CGFloat = 22
    /**
     Every button in the row's trailing cluster — Call, WhatsApp, Text and the checkbox.

     28 rather than the 32 the checkbox had to itself. Four controls where there was one
     means the cluster is now most of a row's trailing third, and the four points bought
     back per button are four characters of title on the narrowest device this renders on.
     Below 28 the targets stop being reliably hittable, so this is a floor.
     */
    static let action: CGFloat = 28
    /// Tight on purpose: the cluster should read as one control group, not four buttons.
    static let actionGap: CGFloat = 3

    // MARK: - Radius

    static let rowRadius: CGFloat = 12
    static let pillRadius: CGFloat = 11
    /// Half of `action` — the cluster is circular.
    static let actionRadius: CGFloat = 14

    // MARK: - Colour

    static let accent = Color("$accent")
    static let ember = Color("$ember")
    static let overdue = Color("$overdue")

    /// The container wash. Deliberately shallow — see the banding note in `09_WIDGET_UI_PLAN.md §5`.
    static var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [Color(.systemBackground), Color(.secondarySystemBackground)],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    static let rowFill = Color.primary.opacity(0.04)
    static let overdueFill = Color("$overdue").opacity(0.06)
    static let accentFill = Color("$accent").opacity(0.12)
    static let hairline = Color.primary.opacity(0.08)

    static var emberGradient: LinearGradient {
        LinearGradient(
            colors: [Color("$ember"), Color("$overdue").opacity(0.85)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
