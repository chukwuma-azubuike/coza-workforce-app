import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

const useNotificationObserver = () => {
    useEffect(() => {
        let isMounted = true;

        const redirect = (notification: Notifications.Notification) => {
            const pathname = notification.request.content.data?.url;
            const params = notification.request.content.data?.content;

            if (pathname && typeof params === 'object') {
                router.push({ pathname, params });
            } else {
                router.push('/');
            }
        };

        Notifications.getLastNotificationResponseAsync().then(response => {
            if (!isMounted || !response?.notification) {
                return;
            }
            // TODO TBD
            redirect(response?.notification);
        });

        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            try {
                redirect(response.notification);
            } catch (error) {
                console.error(error);
            }
        });

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, []);
};

export default useNotificationObserver;
