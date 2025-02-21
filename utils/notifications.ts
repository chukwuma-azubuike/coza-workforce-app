import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// ...

// Get the FCM token
export const getFCMToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    return await messaging().getToken();
};

export const requestUserPermission = async () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    const authStatus = await messaging().requestPermission();
};
