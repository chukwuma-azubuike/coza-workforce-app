import React from 'react';
import { useAddDeviceTokenMutation } from '../../store/services/account';
import { getFCMToken } from '../../utils/notifications';
import { getDeviceId } from 'react-native-device-info';
import { IUser } from '../../store/types';

export const useNotifications = (user: IUser) => {
    const { email } = user;
    const deviceId = getDeviceId();
    const [addDeviceToken] = useAddDeviceTokenMutation();

    React.useEffect(() => {
        const sendFCMToken = async () => {
            const fcmToken = await getFCMToken();

            if (!!fcmToken && !!deviceId)
                addDeviceToken({
                    email,
                    fcmToken,
                    deviceId,
                });
        };

        sendFCMToken();
    }, []);
};
