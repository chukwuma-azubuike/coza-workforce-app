import { RemoteMessage } from '../types/app';
import { INotificationPayload, NOTIFICATION_TYPES_ROUTING } from '../src/constants/notification-types';

export const extractIncomingNotifications = (remoteMessage: RemoteMessage) => {
    const data = remoteMessage.data as INotificationPayload['data'];

    return {
        data: remoteMessage.data,
        body: remoteMessage.notification?.body,
        title: remoteMessage.notification?.title,
        tabKey: NOTIFICATION_TYPES_ROUTING[data.type].tabKey,
        deepLink: NOTIFICATION_TYPES_ROUTING[data.type].routeName,
    };
};
