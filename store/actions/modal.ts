import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IModalState, ModalStatus } from '~/types/app';

/**
 * Transient in-app notification modal state.
 *
 * Deliberately kept out of the persisted whitelist in `store/index.ts` — a modal is a moment,
 * not a session fact. Persisting it used to resurrect a stale alert on cold start with no timer
 * running to take it back down.
 */

/** A single presentation of the modal. `id` identifies the presentation, not the content. */
export interface IModalItem extends IModalState {
    id: number;
    /** Resolved auto-dismiss delay in ms. `0` means "stay until dismissed". */
    durationMs: number;
}

export interface IModalSliceState {
    current: IModalItem | null;
    queue: IModalItem[];
    nextId: number;
}

/** Shortest an alert may stay up and still be readable. */
const MIN_DURATION_MS = 2_000;
/** Longest an auto-dismissing alert may block the screen. */
const MAX_DURATION_MS = 10_000;
/** Anything above this is read as milliseconds, below it as seconds. */
const SECONDS_THRESHOLD = 100;
/** Read-time model used when a caller does not specify a duration. */
const READ_BASE_MS = 2_200;
const READ_MS_PER_CHAR = 45;
const READ_MIN_MS = 3_000;
const READ_MAX_MS = 8_000;
/** Bad news needs longer on screen than good news. */
const STATUS_BONUS_MS: Record<ModalStatus, number> = { error: 1_500, warning: 1_200, info: 0, success: 0 };
/** Pending alerts beyond this are dropped oldest-first rather than queued indefinitely. */
const MAX_QUEUE_LENGTH = 3;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const bodyText = (state: IModalState): string => {
    const description = state.render?.description;
    if (typeof description === 'string') return description;
    if (description) return '';
    return state.message || '';
};

export const resolveDurationMs = (state: IModalState): number => {
    const { duration } = state;

    if (duration === 0) return 0;

    if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
        const ms = duration >= SECONDS_THRESHOLD ? duration : duration * 1_000;
        return clamp(ms, MIN_DURATION_MS, MAX_DURATION_MS);
    }

    const status = state.render?.status || state.status;
    const readMs = READ_BASE_MS + bodyText(state).length * READ_MS_PER_CHAR + (status ? STATUS_BONUS_MS[status] : 0);

    return clamp(readMs, READ_MIN_MS, READ_MAX_MS);
};

/** Two alerts with the same signature are the same alert — used to swallow duplicate dispatches. */
const signatureOf = (state: IModalState): string =>
    [
        state.status,
        state.title,
        state.message,
        typeof state.render?.description === 'string' ? state.render.description : state.render ? 'node' : '',
        state.render?.status,
    ].join('|');

/** Nothing to say, nothing to show. Guards against the empty modal the old reset action produced. */
const isEmpty = (state: IModalState): boolean => !state.render && !(state.message && state.message.trim());

const initialState: IModalSliceState = {
    current: null,
    queue: [],
    nextId: 1,
};

const modalSlice = createSlice({
    name: 'modal',

    initialState,

    reducers: {
        show: (state, { payload }: PayloadAction<IModalState>) => {
            if (isEmpty(payload)) return;

            const signature = signatureOf(payload);

            // Re-dispatching the alert already on screen (a re-render, a retried request) must not
            // restart its timer or swap its id — returning without mutating keeps the same state
            // reference, so no subscriber re-renders and the running dismissal timer survives.
            if (state.current && signatureOf(state.current) === signature) return;
            if (state.queue.some(item => signatureOf(item) === signature)) return;

            const item: IModalItem = {
                ...payload,
                open: true,
                id: state.nextId,
                durationMs: resolveDurationMs(payload),
            };

            state.nextId += 1;

            if (!state.current) {
                state.current = item;
                return;
            }

            state.queue.push(item);

            if (state.queue.length > MAX_QUEUE_LENGTH) state.queue.shift();
        },

        /**
         * Dismiss the visible alert and promote the next queued one.
         * Passing an id makes the dismissal idempotent: a timer that fires late for an alert that
         * has already been replaced is ignored instead of closing its successor early.
         */
        dismiss: (state, { payload }: PayloadAction<number | undefined>) => {
            if (!state.current) return;
            if (typeof payload === 'number' && payload !== state.current.id) return;

            state.current = state.queue.shift() || null;
        },

        /** Drop everything on screen and pending — used on logout / session teardown. */
        clear: state => {
            if (!state.current && !state.queue.length) return;

            state.current = null;
            state.queue = [];
        },
    },

    selectors: {
        selectCurrentModal: store => store.current,
        selectQueuedModals: store => store.queue,
    },
});

export const { actions: modalActions, selectors: modalSelectors } = modalSlice;

export default modalSlice;
