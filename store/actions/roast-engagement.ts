import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IMirrorRecord, MIRROR_PROVIDER } from '~/utils/device-mirror';
import { ITaskCounts, IStreakState, RoastTask } from '../types';

/** One deferred mutation, waiting for a network. */
export interface IOutboxEntry {
    /** Client-generated. Doubles as the `Idempotency-Key` for CREATE. */
    id: string;
    kind: 'COMPLETE' | 'SNOOZE' | 'CREATE' | 'DELETE' | 'PING';
    payload: unknown;
    queuedAt: string;
    /** Bumped on each failed flush, so a permanently-failing entry can be dropped. */
    attempts: number;
}

/** What the scheduler believes the OS currently holds, keyed by reminder id. */
export interface IScheduledRecord {
    /** The identifier Expo returned. Ours is deterministic; theirs is not guaranteed to be. */
    notificationId: string;
    /** The `dueAt` this schedule was made for. Kept for debugging and for the widget. */
    dueAt: string;
    /**
     * `contentKeyFor(reminder)` as at the moment it was scheduled — what the diff compares.
     *
     * Optional because entries persisted by a build that predates it exist on devices in
     * the wild. Those mismatch on the first reconcile after the upgrade and are rescheduled
     * once, which is how an already-installed app picks up the new tray buttons.
     */
    contentKey?: string;
}

export interface IRoastEngagementState {
    /** Last successful `/tasks/today`, for the offline render and the widget snapshot. */
    cachedFeed: { tasks: RoastTask[]; counts: ITaskCounts; generatedAt: string } | null;

    /** Last known streak, so the header renders instantly on cold start rather than popping in. */
    streak: IStreakState | null;

    /**
     * Mutations made with no network, applied in order on reconnect.
     *
     * Completions arrive here from the notification response handler, which can run with
     * no network and no UI at all. Losing one means a reminder the worker already
     * dismissed comes back — the single most corrosive bug this feature can have, because
     * it teaches them the button does not work.
     */
    outbox: IOutboxEntry[];

    /** The scheduler's ledger. See `utils/local-notifications.ts`. */
    scheduled: Record<string, IScheduledRecord>;

    /** `serverTime` from the last `/reminders/sync`, sent as `since` on the next one. */
    lastSyncAt: string | null;

    /** Local date of the last successful engagement ping. Gates the at-risk schedule. */
    lastPingLocalDate: string | null;

    /**
     * Milestones whose celebration has already played on this device.
     *
     * The server's `milestoneReached` is only non-null on the single response that crossed
     * the threshold — a worker who crosses 30 days while the app is closed would otherwise
     * never see it. Tracking what has been *shown* against the server's `milestonesAwarded`
     * is what lets the celebration wait for them, and play exactly once when it does.
     */
    celebratedMilestones: number[];

    /** The Today explainer is a one-time thing. Cleared with the session, deliberately. */
    hasSeenTodayIntro: boolean;

    /**
     * Device-store mirrors this handset has written, keyed by reminder id.
     *
     * Local rather than server-side for the same reason `scheduled` is: it describes what
     * *this phone* did, not what the reminder is. Two handsets signed into one account
     * mirror independently and neither should be able to delete the other's.
     *
     * This is also the sign-out teardown's only handle on data that has left the app —
     * see `deleteAllMirrors`.
     */
    mirrored: Record<string, IMirrorRecord>;

    /**
     * Which store new reminders go to unless the worker says otherwise. `null` is off.
     *
     * Deliberately **not** on `IRoastNotificationPrefs`. The available providers differ by
     * platform, and a preference that syncs would put "Reminders" — an iOS-only concept —
     * onto the same worker's Android handset, where it means nothing.
     */
    mirrorDefault: MIRROR_PROVIDER | null;
}

const initialState: IRoastEngagementState = {
    cachedFeed: null,
    streak: null,
    outbox: [],
    scheduled: {},
    lastSyncAt: null,
    lastPingLocalDate: null,
    celebratedMilestones: [],
    hasSeenTodayIntro: false,
    mirrored: {},
    mirrorDefault: null,
};

const roastEngagementState = createSlice({
    name: 'roast-engagement-state',

    initialState,

    reducers: {
        setCachedFeed(state, { payload }: PayloadAction<IRoastEngagementState['cachedFeed']>) {
            state.cachedFeed = payload;
        },

        setStreak(state, { payload }: PayloadAction<IStreakState>) {
            state.streak = payload;
        },

        setLastPingLocalDate(state, { payload }: PayloadAction<string>) {
            state.lastPingLocalDate = payload;
        },

        setLastSyncAt(state, { payload }: PayloadAction<string>) {
            state.lastSyncAt = payload;
        },

        /**
         * Queues a mutation for the next flush.
         *
         * Keyed on `id`, so re-queuing the same entry replaces rather than appends: the
         * tray handler enqueues before it attempts the network, and a retry that also
         * fails must not leave two copies to apply twice.
         */
        enqueue(state, { payload }: PayloadAction<IOutboxEntry>) {
            const existing = state.outbox.findIndex(entry => entry.id === payload.id);

            if (existing >= 0) {
                state.outbox[existing] = payload;
                return;
            }

            state.outbox.push(payload);
        },

        dequeue(state, { payload }: PayloadAction<string>) {
            state.outbox = state.outbox.filter(entry => entry.id !== payload);
        },

        recordAttempt(state, { payload }: PayloadAction<string>) {
            const entry = state.outbox.find(item => item.id === payload);

            if (entry) {
                entry.attempts += 1;
            }
        },

        dismissTodayIntro(state) {
            state.hasSeenTodayIntro = true;
        },

        markMilestoneCelebrated(state, { payload }: PayloadAction<number>) {
            if (!state.celebratedMilestones.includes(payload)) {
                state.celebratedMilestones.push(payload);
            }
        },

        /** Replaces the whole ledger — the scheduler reconciles wholesale, never row by row. */
        setScheduled(state, { payload }: PayloadAction<Record<string, IScheduledRecord>>) {
            state.scheduled = payload;
        },

        /**
         * Records a mirror this device wrote.
         *
         * Row by row rather than wholesale, unlike `setScheduled`: a mirror is created by
         * a deliberate act on one reminder, and a worker who mirrors one reminder while
         * the reconcile is mid-flight on another must not have theirs overwritten by a
         * snapshot taken before it existed.
         */
        setMirror(state, { payload }: PayloadAction<{ reminderId: string; record: IMirrorRecord }>) {
            state.mirrored[payload.reminderId] = payload.record;
        },

        clearMirror(state, { payload }: PayloadAction<string>) {
            delete state.mirrored[payload];
        },

        setMirrorDefault(state, { payload }: PayloadAction<MIRROR_PROVIDER | null>) {
            state.mirrorDefault = payload;
        },

        /**
         * Wipes engagement state at a session boundary.
         *
         * This slice is persisted and `cachedFeed` holds **guest first names**. Without an
         * explicit reset they rehydrate into the next person's session on a shared campus
         * handset — the same leak `notificationsSlice.reset` exists to close, with the
         * difference that these names are also on the lock screen and the widget.
         *
         * Cancelling the OS schedules is the other half and does not live here; see the
         * teardown in `hooks/auth` — which must also delete the device mirrors *before*
         * dispatching this, since this is what erases the only record of them.
         */
        reset: () => initialState,
    },

    selectors: {
        selectCachedFeed: store => store.cachedFeed,
        selectStreak: store => store.streak,
        selectOutbox: store => store.outbox,
        selectScheduled: store => store.scheduled,
        selectLastSyncAt: store => store.lastSyncAt,
        selectLastPingLocalDate: store => store.lastPingLocalDate,
        selectCelebratedMilestones: store => store.celebratedMilestones,
        selectHasSeenTodayIntro: store => store.hasSeenTodayIntro,
        selectMirrored: store => store.mirrored,
        selectMirrorDefault: store => store.mirrorDefault,
    },
});

export const { actions: roastEngagementActions, selectors: roastEngagementSelectors } = roastEngagementState;
export default roastEngagementState;
