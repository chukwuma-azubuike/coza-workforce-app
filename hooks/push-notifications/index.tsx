import { useState, useEffect, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import messaging from '@react-native-firebase/messaging';
import { getUniqueId } from 'react-native-device-info';
import { useAddDeviceTokenMutation } from '~/store/services/account';
import { IUser } from '~/store/types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export const usePushNotifications = (user: IUser) => {
    const { email } = user;
    const [addDeviceToken] = useAddDeviceTokenMutation();

    const requestPermission = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

            if (!hasPermission) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, {
                    title: 'Push Notifications',
                    message: 'We need your permission to send you push notifications',
                    buttonPositive: 'Okay',
                    buttonNegative: 'No',
                });

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.warn('Push notification permissions are not granted.');
                    return false;
                }
            }
        }

        const authStatus = await messaging().requestPermission();
        const isAuthorized =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!isAuthorized) {
            console.warn('Push notification permissions are not granted.');
        }
        return isAuthorized;
    };

    const getToken = async () => {
        try {
            if (Platform.OS === 'ios') {
                const apnsToken = await messaging().getAPNSToken();
                if (!apnsToken) {
                    console.warn('APNs token is null. Check APNs setup.');
                    return;
                }
                console.log('APNs Token:', apnsToken);
            }

            const fcmToken = await messaging().getToken();
            console.log('FCM Token:', fcmToken);

            return fcmToken;
        } catch (error) {
            console.error('Error fetching push notification token:', error);
        }
    };

    const handleForegroundNotification = () => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('Foreground message received:', remoteMessage);
            Alert.alert('New notification', JSON.stringify(remoteMessage.notification));
        });
        return unsubscribe;
    };

    const handleBackgroundNotifications = () => {
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Background message received:', remoteMessage);
        });

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification opened from background:', remoteMessage);
        });

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification opened from quit state:', remoteMessage);
                }
            });
    };

    useEffect(() => {
        (async () => {
            const hasPermission = await requestPermission();
            if (hasPermission) {
                const fcmToken = await getToken();
                const deviceId = await getUniqueId();

                // TODO: TBD whether to use this
                const expoPushToken = await registerForPushNotificationsAsync();

                if (!!fcmToken && !!deviceId) {
                    await addDeviceToken({
                        email,
                        fcmToken,
                        deviceId,
                    });
                }
            }
        })();

        handleBackgroundNotifications();
        const unsubscribe = handleForegroundNotification();

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
        }
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);
};

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
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // EAS projectId is used here.
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
            console.log(token);
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}
