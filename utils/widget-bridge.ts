import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import APP_VARIANT from '@config/envConfig';
import ROAST_COPY from '~/constants/roast-copy';
import { IStreakState, ITaskCounts, ROAST_TASK_KIND, RoastTask } from '~/store/types';
import { reloadWidgets, setWidgetSnapshot } from '~/modules/roast-widget-bridge';

/**
 * The home-screen widget's data contract, and the app-side half of writing it.
 *
 * The delivery plan puts the widget itself in Phase 4 and this file in Phase 1 on
 * purpose: the snapshot is pure app-side code, it is small, and having it already correct
 * is what turns Phase 4 into rendering work instead of a rewrite. Everything below is
 * live now except `writeSnapshot`'s final hop into shared storage, which needs the native
 * targets and is marked accordingly.
 *
 * ## Why a snapshot at all
 *
 * A widget is not a screen. It has no network, no session, no Redux, and a refresh budget
 * the OS rations. It can only render a file the app left for it. So the app does all the
 * work — fetch, sort, truncate, redact — and the widget slices a pre-cooked list.
 */

/** Largest widget family shows six rows. Anything past that is `totalItems` arithmetic. */
export const WIDGET_ITEM_LIMIT = 6;

/** Where both platforms look. iOS reads it out of the App Group; Android out of prefs. */
export const WIDGET_SNAPSHOT_KEY = 'roast.widget.snapshot.v1';

export interface IRoastWidgetSnapshotItem {
    id: string;
    /** **First name only.** See `D-10` — this file is readable outside the app sandbox. */
    title: string;
    subtitle?: string;
    /** ISO. Drives the iOS timeline entries, so counts flip without spending refresh budget. */
    dueAt: string;
    isOverdue: boolean;
    kind: ROAST_TASK_KIND;
    /** Only a reminder can be completed from the widget — the rest need a screen. */
    completable: boolean;
    deepLink: string;
}

export interface IRoastWidgetSnapshot {
    /**
     * Contract version.
     *
     * A widget extension ships inside a binary and updates only when that binary does, so
     * an *older* widget will routinely read a *newer* app's snapshot. Versioning it is
     * what lets the widget bail to its last-known state instead of rendering garbage.
     */
    v: 1;
    /** False → the widget renders "Sign in to see your guests" and nothing else. */
    isSignedIn: boolean;
    generatedAt: string;
    counts: ITaskCounts;
    /** Already ordered and already truncated. Widgets slice; they never sort. */
    items: IRoastWidgetSnapshotItem[];
    streak: {
        current: number;
        isAtRisk: boolean;
        longest: number;
    };
    /** Total tasks, so "+N more in Roast" is honest when `items` is truncated. */
    totalItems: number;
}

/**
 * Builds the snapshot from what the app already has.
 *
 * Pure, so the redaction rule and the ordering rule are both testable without a device —
 * and the redaction rule is the one worth testing, because getting it wrong puts a guest's
 * full name on a lock screen that anyone walking past can read.
 *
 * Ordering is `isOverdue desc, dueAt asc`, matching the server's own ordering on
 * `/tasks/today`. Re-deriving it here rather than trusting the response is deliberate: the
 * widget and the Today screen disagreeing about "the next action" is the kind of bug
 * nobody reports and everybody notices.
 */
export const buildWidgetSnapshot = ({
    tasks,
    counts,
    streak,
    isSignedIn,
    hideGuestNames = false,
    generatedAt = new Date().toISOString(),
}: {
    tasks: RoastTask[];
    counts: ITaskCounts;
    streak: IStreakState | null;
    isSignedIn: boolean;
    hideGuestNames?: boolean;
    generatedAt?: string;
}): IRoastWidgetSnapshot => {
    if (!isSignedIn) {
        return {
            v: 1,
            isSignedIn: false,
            generatedAt,
            counts: { due: 0, overdue: 0, total: 0 },
            items: [],
            streak: { current: 0, isAtRisk: false, longest: 0 },
            totalItems: 0,
        };
    }

    const ordered = [...tasks]
        .filter(task => !task.completedAt)
        .sort((a, b) => {
            if (a.isOverdue !== b.isOverdue) {
                return a.isOverdue ? -1 : 1;
            }

            return Date.parse(a.dueAt) - Date.parse(b.dueAt);
        });

    return {
        v: 1,
        isSignedIn: true,
        generatedAt,
        counts,
        items: ordered.slice(0, WIDGET_ITEM_LIMIT).map(task => ({
            id: task._id,
            // `hideGuestNames` swaps the composed title for a neutral one. The server's
            // `title` already embeds the first name, so redaction cannot be a substring
            // edit — it has to replace the whole line.
            title: hideGuestNames ? neutralTitleFor(task.kind) : task.title,
            subtitle: hideGuestNames ? undefined : task.subtitle,
            dueAt: task.dueAt,
            isOverdue: task.isOverdue,
            kind: task.kind,
            completable: task.kind === ROAST_TASK_KIND.REMINDER,
            deepLink: task.deepLink,
        })),
        streak: {
            current: streak?.current ?? 0,
            isAtRisk: !!streak?.isAtRisk,
            longest: streak?.longest ?? 0,
        },
        totalItems: ordered.length,
    };
};

/** What a row says when names are hidden: the shape of the work, never who it is about. */
const neutralTitleFor = (kind: ROAST_TASK_KIND): string => {
    switch (kind) {
        case ROAST_TASK_KIND.REMINDER:
            return 'Your reminder';
        case ROAST_TASK_KIND.CALL_DUE:
            return 'A guest is due for a call';
        case ROAST_TASK_KIND.FOLLOW_UP:
            return 'A guest needs a follow-up';
        case ROAST_TASK_KIND.INVITE:
            return 'A guest to invite';
        case ROAST_TASK_KIND.NOTE:
            return 'A note to add';
        case ROAST_TASK_KIND.PROGRESS:
            return 'Progress to update';
        default:
            return 'Something to do';
    }
};

/**
 * The footer line — or `null` when the widget has nothing worth admitting.
 *
 * Shared by both platforms so the two widgets cannot word it differently.
 * ⚠️ Mirrored in `RoastWidgetView.swift`'s `footer`; the rule below is the contract.
 *
 * **The footer used to be unconditional and it did four unrelated jobs at identical
 * emphasis** — stale, "+N more", at-risk, and a healthy streak — while taking a full row's
 * worth of a surface that only has room for about four. Three of those four have better
 * homes: the streak is the pill in the header, "+N more" is the chip beside it, and a
 * healthy streak needs no sentence at all.
 *
 * What is left is the one thing the widget genuinely has to say and nothing else can: that
 * what you are looking at is old, or that your streak is about to end. Reclaiming the rest
 * of that space is what pays for the note under each row.
 */
export const widgetFooterFor = (
    snapshot: IRoastWidgetSnapshot,
    { isStale, relative }: { isStale: boolean; relative: string }
): string | null => {
    if (!snapshot.isSignedIn) {
        return null;
    }

    if (isStale) {
        return ROAST_COPY.today.stale(relative);
    }

    return snapshot.streak.isAtRisk ? ROAST_COPY.widget.footerAtRisk : null;
};

/**
 * Reads back what was last written.
 *
 * Used by the Android widget's headless task, which has no store to read from and only
 * this file to go on. A snapshot from a *newer* contract version is rejected rather than
 * coerced — see `v` above; a widget that renders a shape it does not understand is worse
 * than one that renders its previous frame.
 */
export const readWidgetSnapshot = async (): Promise<IRoastWidgetSnapshot | null> => {
    try {
        const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY);

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as IRoastWidgetSnapshot;

        return parsed?.v === 1 ? parsed : null;
    } catch {
        return null;
    }
};

/**
 * Asks Android to redraw.
 *
 * `require`d lazily rather than imported, and that is not a style choice: the widget
 * component imports `widgetFooterFor` from this file, so a top-level import here would be
 * a cycle — and a cycle that only bites at module-init time, which is the hardest kind to
 * diagnose. Deferring the resolution to call time breaks it cleanly.
 *
 * The component's *type* imports from here are `import type` and erase at build, so the
 * cycle is currently one edge rather than two. Do not rely on that: it would come back the
 * moment anything on that side needs a value from this file.
 *
 * Also keeps `react-native-android-widget` off the iOS import graph entirely.
 */
const requestAndroidWidgetUpdate = async (snapshot: IRoastWidgetSnapshot): Promise<void> => {
    if (Platform.OS !== 'android') {
        return;
    }

    try {
        const { requestWidgetUpdate } = require('react-native-android-widget');
        const RoastWidget = require('~/widgets/RoastWidget').default;
        const React = require('react');
        const { ANDROID_WIDGET_NAME } = require('~/constants/widget');

        await requestWidgetUpdate({
            widgetName: ANDROID_WIDGET_NAME,
            renderWidget: () => ({
                light: React.createElement(RoastWidget, { snapshot }),
                dark: React.createElement(RoastWidget, { snapshot, isDark: true }),
            }),
            // Nobody has placed the widget. Not a failure, and not worth logging on every
            // single write for the majority of users who never will.
            widgetNotFound: () => {},
        });
    } catch {
        // A dev client built before the plugin was added has no native side to talk to.
    }
};

/**
 * Persists the snapshot everywhere a widget can read it. **The only writer.**
 *
 * Three hops, in this order:
 *
 * 1. `AsyncStorage` — the app's own copy, and the one the Android headless task reads.
 * 2. The **iOS App Group** container, which is the only thing a WidgetKit extension can
 *    see, followed by a `reloadAllTimelines()`.
 * 3. An explicit Android redraw. The `updatePeriodMillis` floor is thirty minutes, so the
 *    explicit call is what actually keeps the widget fresh; the period is just the floor
 *    for a backgrounded app.
 *
 * Steps 2 and 3 are what make the sign-out clear real. A cleared file with no reload
 * request leaves the previous user's guest names rendered on the home screen until the
 * next refresh — on a shared campus handset, that is the whole risk, unmitigated.
 *
 * Every hop swallows its own failure. A widget that misses one update shows its last
 * frame; a write path that throws takes out sign-out.
 */
export const writeWidgetSnapshot = async (snapshot: IRoastWidgetSnapshot): Promise<void> => {
    const json = JSON.stringify(snapshot);

    try {
        await AsyncStorage.setItem(WIDGET_SNAPSHOT_KEY, json);
    } catch {
        // A stale widget is a papercut. A crash on the write path is not.
    }

    if (Platform.OS === 'ios') {
        const appGroup = APP_VARIANT.IOS_APP_GROUP;

        if (appGroup) {
            setWidgetSnapshot(appGroup, WIDGET_SNAPSHOT_KEY, json);
        } else {
            // No group configured — an older binary. Still worth asking for a reload so a
            // widget reading a previously-written snapshot is not left stale forever.
            reloadWidgets();
        }
    }

    await requestAndroidWidgetUpdate(snapshot);
};

/**
 * Replaces the snapshot with the signed-out state.
 *
 * **Clear-and-update, never clear-and-leave.** Deleting the file would leave the widget
 * rendering its last frame — a stranger's guest names, still on the home screen, with
 * nothing to trigger a redraw. Writing an empty signed-out snapshot is what actually
 * takes them off the glass.
 */
export const clearWidgetSnapshot = (): Promise<void> =>
    writeWidgetSnapshot(
        buildWidgetSnapshot({ tasks: [], counts: { due: 0, overdue: 0, total: 0 }, streak: null, isSignedIn: false })
    );
