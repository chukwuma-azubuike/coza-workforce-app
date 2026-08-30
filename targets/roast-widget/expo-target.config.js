/**
 * The Roast home-screen widget target.
 *
 * @type {import('@bacons/apple-targets/app.plugin').ConfigFunction}
 */
module.exports = config => ({
    type: 'widget',
    name: 'RoastWidget',
    displayName: 'Roast',

    /**
     * The leading dot appends to the app's bundle id, which `app.config.js` has already
     * suffixed per variant. So this resolves to `com.cozaworkforceapp.roastwidget` in
     * production and `com.cozaworkforceapp.staging.roastwidget` for dev and preview,
     * without the variant logic being written down twice.
     */
    bundleIdentifier: '.roastwidget',

    /**
     * 16.0, not the app's 15.1 — forced by `AppIntents`.
     *
     * That framework does not exist before iOS 16, and this plugin has no way to weak-link
     * it (there is no build-settings escape hatch in the target config). Linked as
     * required against a 15.1 target, dyld cannot load the extension at all on iOS 15: the
     * widget does not appear, with no error surfaced anywhere.
     *
     * So the floor moves to where the framework actually exists. iOS 15 devices keep the
     * whole app and simply have no widget. Interactive completion still needs iOS 17 and
     * is gated with `@available` inside `RoastWidgetView.swift`, which is what the iOS 16
     * deep-link fallback is for.
     */
    deploymentTarget: '16.0',

    frameworks: ['SwiftUI', 'WidgetKit', 'AppIntents'],

    /** Falls back to the app's team; set explicitly so a missing app-level value is loud. */
    appleTeamId: config.ios?.appleTeamId,

    /**
     * ⚠️ **`light` / `dark`, not `color` / `darkColor`.**
     *
     * `@bacons/apple-targets` v5 reads `color.light` and `color.dark` (see
     * `build/with-widget.js`, `withConfigColors`). Its README still shows the older
     * `{ color, darkColor }` shape in one example, and that shape is not an error — the
     * keys are simply never read, so every colorset is generated **empty**.
     *
     * An empty colorset still resolves: `Color("$accent")` finds the asset and gets no
     * colour, which paints as nothing. On a dark widget that is invisible, and it took out
     * every glyph and every filled control on the surface at once — the kind icon, the
     * mark-done circle, the contact buttons' fill and the streak flame — while leaving
     * everything drawn from `.primary`, `.secondary` or `Color.white` looking perfectly
     * correct. Nothing failed loudly; the widget just quietly rendered as text.
     *
     * These three names are also mirrored in `constants/widget-theme.ts` as hex, which is
     * why the Android widget was unaffected and could not have caught this.
     */
    colors: {
        $accent: { light: '#3B82F6', dark: '#3B82F6' },
        $ember: { light: '#F59E0B', dark: '#D97706' },
        $overdue: { light: '#DC2626', dark: '#F87171' },
    },

    /**
     * Mirrors the app's App Group so both processes reach the same container. Reading it
     * from the resolved config rather than hardcoding is what keeps the staging widget out
     * of production data — see `app.config.js`.
     */
    entitlements: {
        'com.apple.security.application-groups':
            config.ios?.entitlements?.['com.apple.security.application-groups'] ?? [],
    },
});
