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

    colors: {
        $accent: { color: '#6B079C', darkColor: '#A855F7' },
        $ember: { color: '#F59E0B', darkColor: '#D97706' },
        $overdue: { color: '#DC2626', darkColor: '#F87171' },
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
