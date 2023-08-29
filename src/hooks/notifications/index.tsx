import React from 'react';
import { useAddDeviceTokenMutation } from '../../store/services/account';
// import { getFCMToken } from '../../utils/notifications';
// import { getUniqueId } from 'react-native-device-info';
import { IUser } from '../../store/types';
import { Permission, PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';

export const useNotifications = (user: IUser) => {
    if (Platform.OS === 'android') {
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
        PermissionsAndroid.request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS as Permission, {
            title: 'Push Notifications',
            message: 'We ',
            buttonPositive: 'Okay',
            buttonNegative: 'No',
        });
    }

    const { email } = user;
    const [addDeviceToken] = useAddDeviceTokenMutation();

    React.useEffect(() => {
        // const sendFCMToken = async () => {
        //     const deviceId = await getUniqueId();
        //     const fcmToken = await getFCMToken();
        //     if (!!fcmToken && !!deviceId)
        //         addDeviceToken({
        //             email,
        //             fcmToken,
        //             deviceId,
        //         });
        // };
        // sendFCMToken();
    }, []);
};
