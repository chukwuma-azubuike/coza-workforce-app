/**
 * Names and identifiers shared between the app, the Android widget task handler and the
 * iOS extension.
 *
 * These strings appear in three places that cannot import from each other — JS, Kotlin
 * generated from the config plugin, and Swift — so a change here has to be mirrored into
 * `targets/roast-widget/Snapshot.swift` by hand. That mirroring is the reason they are
 * collected in one file with this warning on them rather than inlined at each call site.
 */

/** Must match the `name` in the `react-native-android-widget` plugin config in `app.json`. */
export const ANDROID_WIDGET_NAME = 'RoastToday';

/** Mirrored in `Snapshot.swift`. Both read the same key out of the App Group. */
export const WIDGET_SNAPSHOT_STORAGE_KEY = 'roast.widget.snapshot.v1';

/** The medium layout shows two rows; the snapshot carries six so a resize has headroom. */
export const WIDGET_VISIBLE_ROWS = 2;

/**
 * How old a snapshot may be before the footer stops sounding live.
 *
 * A widget quietly showing yesterday's tasks as if they were today's is worse than one
 * that admits it is stale — the first costs trust in everything the widget says.
 */
export const WIDGET_STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export const WIDGET_CLICK = {
    OPEN_APP: 'OPEN_APP',
    OPEN_URI: 'OPEN_URI',
    /** Completes a reminder in place. Carries `{ reminderId }` in `clickActionData`. */
    COMPLETE_REMINDER: 'ROAST_COMPLETE_REMINDER',
} as const;
