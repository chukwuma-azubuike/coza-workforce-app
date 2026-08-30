/**
 * The widget's design tokens.
 *
 * ⚠️ **Mirrored in `targets/roast-widget/WidgetTheme.swift`. Change one, change both.**
 * There is no shared build between a JS bundle and a Swift extension, so this is the same
 * hand-mirroring discipline `Snapshot.swift` already lives under — with the difference
 * that a drift here is silent and cosmetic rather than a decode failure, which makes it
 * *more* likely to survive review, not less.
 *
 * The rules the numbers encode:
 *
 * **Three type steps, not four.** The previous layout set four roles at 13/13/11/11, which
 * is one size wearing four hats. Title leads, subtitle supports, meta recedes.
 *
 * **One accent. Six kinds, one colour.** Tinting each task kind differently is the obvious
 * move and it is wrong: it turns a work surface into a toy and drowns the only signal that
 * matters. Shape carries the kind — see `widget-glyphs.ts` — and colour carries urgency.
 *
 * **Depth from gradient and hairline, never a fake shadow.** Neither WidgetKit nor
 * RemoteViews can draw a shadow, and a dark rectangle pretending to be one is exactly what
 * makes a widget look cheap.
 */

export const WIDGET_TYPE = {
    /** The row's content. The only thing on the surface set above 13. */
    title: { size: 15, weight: '600', letterSpacing: -0.2 },
    /** The note. First to shrink when the font scale is cranked up. */
    subtitle: { size: 12, weight: '400' },
    /** Times, "OVERDUE", the footer. Recedes on purpose. */
    meta: { size: 11, weight: '500' },
    /** The header count and the streak numeral. */
    figure: { size: 13, weight: '700' },
    /** Uppercase status labels. Tracked out so they read as labels, not words. */
    label: { size: 10, weight: '700', letterSpacing: 0.4 },
} as const;

export const WIDGET_SPACE = {
    containerPadding: 14,
    headerHeight: 24,
    headerGap: 8,
    rowGap: 6,
    rowPaddingH: 10,
    rowPaddingV: 7,
    /** The overdue rail. Present in every row — transparent when the row is not overdue. */
    railWidth: 3,
    glyphColumn: 22,
    /**
     * Every button in the row's trailing cluster — Call, WhatsApp, Text and the checkbox.
     *
     * 28 rather than the 32 the checkbox had alone. Four controls where there was one
     * means the cluster is now ~120dp of a ~300dp row, and the four dp bought back per
     * button is four characters of title on the narrowest handset that can hold this
     * widget. Below 28 the targets stop being reliably hittable, so this is the floor
     * rather than a preference.
     */
    action: 28,
    /** Tight on purpose: the cluster should read as one control group, not four buttons. */
    actionGap: 3,
} as const;

export const WIDGET_RADIUS = {
    container: 24,
    row: 12,
    pill: 11,
    /** Half of `WIDGET_SPACE.action` — the cluster is circular. */
    action: 14,
} as const;

/**
 * Light and dark, resolved by the caller.
 *
 * RemoteViews cannot read the theme, so the Android task handler renders whichever the
 * system reports and Android swaps. iOS resolves it through the asset catalog instead —
 * which is why `accent`, `ember` and `overdue` are *also* declared in
 * `targets/roast-widget/expo-target.config.js`, and why those three have to agree with
 * these by hand.
 */
export const WIDGET_COLOURS = {
    light: {
        backgroundFrom: '#FFFFFF',
        backgroundTo: '#F7F7F8',
        foreground: '#18181B',
        muted: '#71717A',
        hairline: '#00000014',
        rowFill: '#0000000A',
        overdueFill: '#DC26260F',
        accent: '#6B079C',
        accentFill: '#6B079C1F',
        overdue: '#DC2626',
        emberFrom: '#F59E0B',
        emberTo: '#EA580C',
    },
    dark: {
        backgroundFrom: '#1C1C1F',
        backgroundTo: '#131316',
        foreground: '#FAFAFA',
        muted: '#A1A1AA',
        hairline: '#FFFFFF14',
        rowFill: '#FFFFFF0D',
        overdueFill: '#F871711A',
        accent: '#A855F7',
        accentFill: '#A855F72E',
        overdue: '#F87171',
        emberFrom: '#F59E0B',
        emberTo: '#D97706',
    },
} as const;

/**
 * Either palette, widened.
 *
 * `typeof WIDGET_COLOURS.light` would be a type of *literal hex strings*, which the dark
 * palette — different literals — cannot satisfy. The template literal keeps the one
 * constraint that matters: `react-native-android-widget`'s `ColorProp` requires a leading
 * `#`, and it reads `#RRGGBBAA` web-style before re-ordering it to Android's `#AARRGGBB`.
 */
export type IWidgetPalette = Record<keyof (typeof WIDGET_COLOURS)['light'], `#${string}`>;
