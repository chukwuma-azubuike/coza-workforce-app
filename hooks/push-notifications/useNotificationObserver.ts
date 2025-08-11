import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

const useNotificationObserver = () => {
    useEffect(() => {
        let isMounted = true;

        const redirect = (notification: Notifications.Notification) => {
            const pathname = notification.request.content.data?.url;
            const params = notification.request.content.data?.content;

            if (pathname) {
                router.push({ pathname, params });
            }
        };

        Notifications.getLastNotificationResponseAsync().then(response => {
            if (!isMounted || !response?.notification) {
                return;
            }
            redirect(response?.notification);
        });

        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            redirect(response.notification);
        });

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, []);
};

export default useNotificationObserver;
