import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// ...

// Get the FCM token
export const getFCMToken = async () => {
    return await messaging().getToken();
};

export const requestUserPermission = async () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
};
