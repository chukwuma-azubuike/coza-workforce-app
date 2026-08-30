import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { ANDROID_WIDGET_NAME, WIDGET_CLICK } from '~/constants/widget';
import { REMINDER_COMPLETED_VIA } from '~/store/types';
import {
    IRoastWidgetSnapshot,
    WIDGET_SNAPSHOT_KEY,
    buildWidgetSnapshot,
    readWidgetSnapshot,
} from '~/utils/widget-bridge';
import { enqueueWidgetCompletion, removeWidgetCompletion } from '~/utils/widget-completion-queue';
import RoastWidget from './RoastWidget';

/**
 * The Android widget's brain, running in a **headless JS task**.
 *
 * This context has no store, no navigation, no rehydrated Redux and frequently no running
 * app at all — Android spins it up, calls this once, and tears it down. So nothing here
 * may dispatch, and nothing may assume a previous render happened.
 *
 * It has exactly two jobs: draw the widget from the snapshot the app left in AsyncStorage,
 * and turn a tap on a checkbox into a completed reminder.
 */

const signedOutSnapshot = (): IRoastWidgetSnapshot =>
    buildWidgetSnapshot({
        tasks: [],
        counts: { due: 0, overdue: 0, total: 0 },
        streak: null,
        isSignedIn: false,
    });

/**
 * Completes a reminder without opening the app.
 *
 * **Enqueue first, then try the network.** If the request is attempted first and the
 * process is killed mid-flight — which Android does aggressively to headless tasks — the
 * completion is simply gone, the reminder returns, and the worker learns the button does
 * not work. Queued first, the worst case is that the app re-sends something the server
 * already has, which the endpoint tolerates.
 */
const completeReminder = async (reminderId: string): Promise<void> => {
    await enqueueWidgetCompletion(reminderId);

    const baseUrl = process.env['EXPO_PUBLIC_ROAST_API_BASE_URL'];

    if (!baseUrl) {
        return;
    }

    try {
        // Read straight from SecureStore rather than through `Utils`: this runs outside the
        // app, and pulling in the app's utility surface would drag half the bundle into a
        // task that Android gives a few seconds to live.
        const raw = await SecureStore.getItemAsync('user_session');
        const token = raw ? JSON.parse(raw)?.token?.token : null;

        if (!token) {
            return;
        }

        const response = await fetch(`${baseUrl}/reminders/${reminderId}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ completedVia: REMINDER_COMPLETED_VIA.WIDGET }),
        });

        if (response.ok) {
            await removeWidgetCompletion(reminderId);
        }
    } catch {
        // Offline, or the process died. The entry stays queued and the app's outbox picks
        // it up on the next foreground.
    }
};

/**
 * Drops a completed row from the stored snapshot straight away.
 *
 * Without this the row sits there until the app next writes a snapshot — which, if the app
 * is not running, could be hours. A checkbox that visibly does nothing is indistinguishable
 * from a broken one.
 *
 * Matched on `reminderId`, not on `id`. The row's `id` is the task's composite id and the
 * button now carries the reminder's document id, because that is the only one the server
 * accepts — see `IRoastWidgetSnapshotItem.reminderId`.
 */
const removeFromSnapshot = async (snapshot: IRoastWidgetSnapshot, id: string): Promise<IRoastWidgetSnapshot> => {
    const items = snapshot.items.filter(item => item.reminderId !== id);

    const updated: IRoastWidgetSnapshot = {
        ...snapshot,
        items,
        totalItems: Math.max(0, snapshot.totalItems - 1),
        counts: {
            ...snapshot.counts,
            due: Math.max(0, snapshot.counts.due - 1),
            total: Math.max(0, snapshot.counts.total - 1),
        },
    };

    try {
        await AsyncStorage.setItem(WIDGET_SNAPSHOT_KEY, JSON.stringify(updated));
    } catch {
        // The render below still uses the updated value, so the tap looks right either way.
    }

    return updated;
};

const widgetTaskHandler = async (props: WidgetTaskHandlerProps): Promise<void> => {
    if (props.widgetInfo.widgetName !== ANDROID_WIDGET_NAME) {
        return;
    }

    let snapshot = (await readWidgetSnapshot()) ?? signedOutSnapshot();

    if (props.widgetAction === 'WIDGET_CLICK' && props.clickAction === WIDGET_CLICK.COMPLETE_REMINDER) {
        const reminderId = props.clickActionData?.['reminderId'];

        if (typeof reminderId === 'string' && reminderId) {
            // Redrawn before the network is attempted, so the row disappears on the tap
            // rather than whenever the request happens to come back.
            snapshot = await removeFromSnapshot(snapshot, reminderId);

            props.renderWidget({
                light: <RoastWidget snapshot={snapshot} />,
                dark: <RoastWidget snapshot={snapshot} isDark />,
            });

            await completeReminder(reminderId);

            return;
        }
    }

    switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED':
        case 'WIDGET_CLICK':
            props.renderWidget({
                light: <RoastWidget snapshot={snapshot} />,
                dark: <RoastWidget snapshot={snapshot} isDark />,
            });

            return;

        default:
            // `WIDGET_DELETED` — nothing to draw, and `renderWidget` is a no-op there anyway.
            return;
    }
};

export default widgetTaskHandler;
