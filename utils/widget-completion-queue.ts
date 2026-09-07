import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reminder completions made from the widget, waiting for the app to confirm them.
 *
 * ## Why this is not the Redux outbox
 *
 * A widget tap runs in a **headless JS task** — a separate context with no store, no
 * `PersistGate` and no rehydrated state. It cannot dispatch. Reaching into redux-persist's
 * serialised blob from outside the store would work right up until the app happened to be
 * running too, at which point one context's write silently discards the other's.
 *
 * So the headless task writes here, to a plain AsyncStorage list that both contexts can
 * append to safely, and the app drains it into the real outbox on its next foreground.
 * From that point the existing retry, ordering and idempotency machinery owns it.
 *
 * The headless task **enqueues before it attempts the network**, exactly as the tray
 * handler does. A completion lost between the tap and the request is the single most
 * corrosive bug this feature can have: the reminder comes back, and the worker learns the
 * button does not work.
 */
export const WIDGET_COMPLETION_QUEUE_KEY = 'roast.widget.completions.v1';

export interface IWidgetCompletion {
    reminderId: string;
    /** ISO. Kept so a completion that reaches the server late is still honest about when it happened. */
    at: string;
}

const read = async (): Promise<IWidgetCompletion[]> => {
    try {
        const raw = await AsyncStorage.getItem(WIDGET_COMPLETION_QUEUE_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        // A queue we cannot read is a queue we treat as empty. Never a crash: this runs in
        // a headless task where a throw is an unhandled rejection nobody sees.
        return [];
    }
};

/** Appends one completion. Deduplicated on `reminderId` — a double tap is one completion. */
export const enqueueWidgetCompletion = async (reminderId: string): Promise<void> => {
    try {
        const queue = await read();

        if (queue.some(entry => entry.reminderId === reminderId)) {
            return;
        }

        await AsyncStorage.setItem(
            WIDGET_COMPLETION_QUEUE_KEY,
            JSON.stringify([...queue, { reminderId, at: new Date().toISOString() }])
        );
    } catch {
        // Best effort.
    }
};

export const removeWidgetCompletion = async (reminderId: string): Promise<void> => {
    try {
        const queue = await read();

        await AsyncStorage.setItem(
            WIDGET_COMPLETION_QUEUE_KEY,
            JSON.stringify(queue.filter(entry => entry.reminderId !== reminderId))
        );
    } catch {
        // Best effort.
    }
};

/**
 * Reads the queue and clears it in one go, for the app to hand to the outbox.
 *
 * Clearing before the entries are safely in the outbox is deliberate: the outbox is
 * persisted and retries, so a handover that fails mid-way loses at most the entries the
 * caller had not enqueued yet — whereas leaving them here would replay every completion on
 * every foreground for the life of the install.
 */
export const drainWidgetCompletions = async (): Promise<IWidgetCompletion[]> => {
    const queue = await read();

    if (queue.length) {
        try {
            await AsyncStorage.removeItem(WIDGET_COMPLETION_QUEUE_KEY);
        } catch {
            // Best effort.
        }
    }

    return queue;
};
