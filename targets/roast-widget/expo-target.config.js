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
     * Matches the app. WidgetKit itself works from iOS 14, so the widget ships to
     * everybody; interactive completion needs iOS 17 and is gated with `@available`
     * inside `RoastWidgetView.swift` rather than by raising this floor.
     */
    deploymentTarget: '15.1',

    frameworks: ['SwiftUI', 'WidgetKit', 'AppIntents'],

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
