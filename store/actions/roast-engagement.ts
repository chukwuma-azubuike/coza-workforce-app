import { PayloadAction, createSlice } from '@reduxjs/toolkit';
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
    /** The `dueAt` this schedule was made for — the diff compares against it. */
    dueAt: string;
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
}

const initialState: IRoastEngagementState = {
    cachedFeed: null,
    streak: null,
    outbox: [],
    scheduled: {},
    lastSyncAt: null,
    lastPingLocalDate: null,
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

        /** Replaces the whole ledger — the scheduler reconciles wholesale, never row by row. */
        setScheduled(state, { payload }: PayloadAction<Record<string, IScheduledRecord>>) {
            state.scheduled = payload;
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
         * teardown in `hooks/auth`.
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
    },
});

export const { actions: roastEngagementActions, selectors: roastEngagementSelectors } = roastEngagementState;
export default roastEngagementState;
