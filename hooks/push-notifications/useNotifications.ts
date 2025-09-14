import { useAppSelector } from '../../store/hooks';
import { notificationSelectors } from '../../store/actions/notifications';

export const useNotifications = () => {
    const expoPushToken = useAppSelector(notificationSelectors.selectExpoPushToken);
    const channels = useAppSelector(notificationSelectors.selectChannels);
    const notification = useAppSelector(notificationSelectors.selectNotification);
    const permissionStatus = useAppSelector(notificationSelectors.selectPermissionStatus);

    return {
        channels,
        notification,
        expoPushToken,
        permissionStatus,
    };
};
