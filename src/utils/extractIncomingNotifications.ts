import { RemoteMessage } from '../../types/app';

export const extractIncomingNotifications = (remoteMessage: RemoteMessage) => {
    return {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        deepLink: remoteMessage.data,
        data: remoteMessage.data,
    };
};
