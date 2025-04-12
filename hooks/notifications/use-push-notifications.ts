import { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getUniqueId } from 'react-native-device-info';
import { useAddDeviceTokenMutation } from '~/store/services/account';
import { IUser } from '~/store/types';

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
};
