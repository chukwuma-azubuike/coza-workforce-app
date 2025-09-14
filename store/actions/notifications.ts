import { PayloadAction, asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';

export interface INotificationsState {
    expoPushToken: string;
    channels: Notifications.NotificationChannel[];
    notification?: Notifications.Notification;
    permissionStatus?: 'granted' | 'denied' | 'undetermined';
}

const initialState: INotificationsState = {
    expoPushToken: '',
    channels: [],
    notification: undefined,
    permissionStatus: undefined,
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
    },
    selectors: {
        selectExpoPushToken: store => store.expoPushToken,
        selectChannels: store => store.channels,
        selectNotification: store => store.notification,
        selectPermissionStatus: store => store.permissionStatus,
    },
});

export const { actions: notificationActions, selectors: notificationSelectors } = notificationsSlice;
export default notificationsSlice;
