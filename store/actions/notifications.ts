import { PayloadAction, asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';

export interface INotificationsState {
    expoPushToken: string;
    channels: Notifications.NotificationChannel[];
    notification?: Notifications.Notification;
    permissionStatus?: 'granted' | 'denied' | 'undetermined';
    /**
     * Unread inbox rows, as last reported by a push payload's `badge`.
     *
     * A cached hint, not the truth — quiet hours suppress the push while still writing
     * the row, so this drifts low between opens. The unread-count endpoint is the source
     * of truth after any read action.
     */
    unreadCount: number;
}

const initialState: INotificationsState = {
    expoPushToken: '',
    channels: [],
    notification: undefined,
    permissionStatus: undefined,
    unreadCount: 0,
};

export const createNotificationsSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

const notificationsSlice = createNotificationsSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setExpoPushToken: (state, { payload }: PayloadAction<string>) => {
            state.expoPushToken = payload;
        },
        setChannels: (state, { payload }: PayloadAction<Notifications.NotificationChannel[]>) => {
            state.channels = payload;
        },
        setNotification: (state, { payload }: PayloadAction<Notifications.Notification | undefined>) => {
            state.notification = payload;
        },
        setPermissionStatus: (state, { payload }: PayloadAction<'granted' | 'denied' | 'undetermined'>) => {
            state.permissionStatus = payload;
        },

        /**
         * ⚠️ Callers must not pass `0` for a payload that simply carried no `badge`.
         * `LOW` priority notifications omit it deliberately, and a missing badge means
         * "leave the count alone", never "the user has read everything" — see
         * `getBadgeCount`, which returns `undefined` rather than coercing.
         */
        setUnreadCount: (state, { payload }: PayloadAction<number>) => {
            state.unreadCount = Math.max(0, payload);
        },

        /**
         * Wipes push state at a session boundary. This slice is persisted, so without
         * an explicit reset the previous user's push token survives logout, rehydrates
         * into the next session on the same handset, and is then sent as *their*
         * delete key at logout. `permissionStatus` is deliberately reset too — it is a
         * property of the OS, but re-reading it on the next launch is cheap and stale
         * `granted` state is worse than an extra check.
         */
        reset: () => initialState,
    },
    selectors: {
        selectExpoPushToken: store => store.expoPushToken,
        selectChannels: store => store.channels,
        selectNotification: store => store.notification,
        selectPermissionStatus: store => store.permissionStatus,
        selectUnreadCount: store => store.unreadCount,
    },
});

export const { actions: notificationActions, selectors: notificationSelectors } = notificationsSlice;
export default notificationsSlice;
