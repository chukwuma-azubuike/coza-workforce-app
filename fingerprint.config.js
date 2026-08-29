/** @type {import('@expo/fingerprint').Config} */
const config = {
    sourceSkips: [
        // 'ExpoConfigRuntimeVersionIfString',
        'ExpoConfigVersions',
        // 'PackageJsonAndroidAndIosScriptsIfNotContainRun',
    ],

    /**
     * The widget's native source.
     *
     * `targets/` (the iOS WidgetKit extension) and `modules/` (the local App Group bridge)
     * are compiled into the binary but live outside `android/` and `ios/`, which are
     * gitignored build output. Without listing them here a Swift-only change does not move
     * the fingerprint, and EAS happily reuses a cached build that does not contain it —
     * which presents as "my widget fix did nothing" with no error anywhere.
     */
    extraSources: [
        { type: 'dir', filePath: 'targets', reasons: ['roast-widget-ios'] },
        { type: 'dir', filePath: 'modules', reasons: ['roast-widget-bridge'] },
    ],
};
module.exports = config;
