import AsyncStorage from '@react-native-async-storage/async-storage';
import ROAST_COPY from '~/constants/roast-copy';
import { IStreakState, ITaskCounts, ROAST_TASK_KIND, RoastTask } from '~/store/types';

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

/** The footer line, shared by both platforms so the two widgets cannot word it differently. */
export const widgetFooterFor = (snapshot: IRoastWidgetSnapshot): string => {
    if (!snapshot.isSignedIn) {
        return ROAST_COPY.widget.signedOut;
    }

    if (!snapshot.items.length) {
        return ROAST_COPY.widget.empty;
    }

    return snapshot.streak.isAtRisk
        ? ROAST_COPY.widget.footerAtRisk
        : ROAST_COPY.widget.footerHealthy(snapshot.streak.current);
};

/**
 * Persists the snapshot where the widgets will read it.
 *
 * Today it writes to `AsyncStorage` only, which no widget can see — the shared containers
 * do not exist until the native targets land in Phase 4 (`RE-N1` / `RE-N3`). That is the
 * intended state, not an omission: the contract, the ordering and the redaction are being
 * exercised in production from Phase 1 so that Phase 4 adds one hop rather than a data
 * model.
 *
 * ⚠️ **When the native targets land**, this function gains a second write — the iOS App
 * Group `UserDefaults` and the Android `SharedPreferences` the widget provider reads —
 * followed by a reload request to each. It must stay the *only* writer, so the clear on
 * logout has exactly one thing to undo.
 */
export const writeWidgetSnapshot = async (snapshot: IRoastWidgetSnapshot): Promise<void> => {
    try {
        await AsyncStorage.setItem(WIDGET_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
        // A stale widget is a papercut. A crash on the write path is not.
    }
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
