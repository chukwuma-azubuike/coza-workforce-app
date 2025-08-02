import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAppDispatch } from '../store/hooks';
import { notificationActions } from '../store/actions/notifications';

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myNotificationChannel', {
            name: 'A channel is needed for the permissions prompt to appear',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID not found');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                dispatch(notificationActions.setExpoPushToken(token));
            }
        });

        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then(channels =>
                dispatch(notificationActions.setChannels(channels ?? []))
            );
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            dispatch(notificationActions.setNotification(notification));
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            // Handle notification response here
            console.log(response);
        });

        return () => {
            notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [dispatch]);

    return <>{children}</>;
};

// Helper function to schedule notifications
export const schedulePushNotification = async ({
    title,
    body,
    data,
    seconds = 2,
}: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    seconds?: number;
}) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
        },
    });
};
