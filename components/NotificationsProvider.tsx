import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAppDispatch } from '../store/hooks';
import { notificationActions } from '../store/actions/notifications';
import { IUser } from '~/store/types';
import { useAddDeviceTokenMutation } from '~/store/services/account';
import { getUniqueId } from 'react-native-device-info';
import { ENV } from '~/config/envConfig';

export const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    if (!Device.isDevice) {
        alert('Must use physical device for Push Notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
    }

    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            throw new Error('Project ID not found');
        }

        const deviceId = await getUniqueId();
        const expoPushToken = (
            await Notifications.getExpoPushTokenAsync({ projectId, deviceId, development: ENV !== 'production' })
        ).data;

        return expoPushToken;
    } catch (e) {
        return null;
    }
};

// Removed getActualFCMToken as it's now handled by RTK Query

export const NotificationsProvider: React.FC<{ children: React.ReactNode; user: IUser }> = ({ children, user }) => {
    const dispatch = useAppDispatch();
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    const { email } = user;
    const [addDeviceToken] = useAddDeviceTokenMutation();

    useEffect(() => {
        (async () => {
            try {
                const deviceId = await getUniqueId();
                // Get permission and set up channel
                await registerForPushNotificationsAsync();

                // Get the actual FCM token directly
                const { data: fcmToken } = await Notifications.getDevicePushTokenAsync();

                if (deviceId && fcmToken) {
                    const res = await addDeviceToken({
                        email,
                        deviceId,
                        fcmToken,
                    }).unwrap();
                }
            } catch (error) {}
        })();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            dispatch(notificationActions.setNotification(response.notification));
        });

        return () => {
            notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [dispatch]);

    return <>{children}</>;
};
