import React, { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAppDispatch } from '../store/hooks';
import { notificationActions } from '../store/actions/notifications';
import { IUser } from '~/store/types';
import { useAddDeviceTokenMutation } from '~/store/services/account';
import * as Application from 'expo-application';
import { ENV } from '~/config/envConfig';
import { getDeviceId } from '~/utils/device';

export { getDeviceId };

/**
 * Android drops a notification addressed to a channel the device has never created —
 * silently, with no error to the app and none in the Expo receipt. So channels are
 * created on every launch regardless of auth state, before any push can arrive.
 */
export const setUpAndroidChannels = async () => {
    if (Platform.OS !== 'android') {
        return;
    }

    await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
    });
};

export const registerForPushNotificationsAsync = async () => {
    await setUpAndroidChannels();

    if (!Device.isDevice) {
        // alert('Must use physical device for Push Notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        return null;
    }

    try {
        const projectId =
            (Constants?.expoConfig?.extra as { eas?: { projectId?: string } })?.eas?.projectId ??
            Constants?.easConfig?.projectId;

        if (!projectId) {
            throw new Error('Project ID not found');
        }

        const expoPushToken = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
                development: ENV !== 'production',
            })
        ).data;

        return expoPushToken;
    } catch (e) {
        return null;
    }
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode; user: IUser }> = ({ children, user }) => {
    const dispatch = useAppDispatch();

    const { email, userId, _id } = user;
    const isAuthenticated = !!(userId ?? _id) && !!email;
    const [addDeviceToken] = useAddDeviceTokenMutation();

    /**
     * The identity this mount has already registered, as `email|deviceId|token`.
     *
     * Scoped to the mount deliberately. Within a session it collapses redundant
     * re-registrations — the rotation listener can fire with an unchanged token — but
     * it is empty again on every cold start, which is what preserves the heal path:
     * a row the backend deactivated after a failed send is reactivated by the next
     * launch's registration rather than being skipped forever as a duplicate.
     */
    const lastRegistered = useRef<string | null>(null);
    const inFlight = useRef<Promise<void> | null>(null);

    /**
     * Bumped on every session change and on unmount. A registration started under one
     * session must not land under the next: minting a token and resolving a device id
     * are both async, so a rotation arriving as the user signs out could otherwise POST
     * *after* logout deleted the row and quietly recreate it — recreating the shared-
     * handset leak this whole path exists to close.
     */
    const generation = useRef(0);

    /**
     * Registers this handset against the signed-in user.
     *
     * The backend upserts on `(userId, deviceId)` behind a unique compound index, so
     * calling this repeatedly is free — it replaces the token in place rather than
     * fanning out duplicate sends to one phone, and it flips a row that a failed send
     * deactivated back to `isActive: true`. That idempotence is what makes it safe to
     * call from the rotation listener below on every token change.
     */
    const registerDevice = useCallback(
        async (token?: string) => {
            // The provider mounts above auth with an empty user object, so without this
            // guard the effect POSTs `email: undefined` on every launch of a signed-out app.
            if (!isAuthenticated) {
                return;
            }

            const gen = generation.current;

            const run = async () => {
                try {
                    const expoPushToken = token ?? (await registerForPushNotificationsAsync());
                    const deviceId = await getDeviceId();

                    // The session may have ended while we were minting the token above.
                    if (generation.current !== gen || !deviceId || !expoPushToken) {
                        return;
                    }

                    const identity = `${email}|${deviceId}|${expoPushToken}`;

                    if (lastRegistered.current === identity) {
                        return;
                    }

                    // Keep the persisted slice in step: `useAuth` reads this token at
                    // logout, and a stale one there deletes the wrong row — or no row.
                    dispatch(notificationActions.setExpoPushToken(expoPushToken));

                    await addDeviceToken({
                        email,
                        deviceId,
                        expoPushToken,
                        platform: Platform.OS,
                        appVersion: Application.nativeApplicationVersion ?? undefined,
                    }).unwrap();

                    // Only after the server has it. Marking it earlier would let a failed
                    // POST suppress the retry that the next rotation or launch would make.
                    lastRegistered.current = identity;
                } catch (error) {}
            };

            // Mount registration and a rotation event arriving together would otherwise
            // race two POSTs for the same handset. Chain rather than drop: the second
            // call may carry a newer token than the one already in flight, and running
            // them in series is what lets the dedupe check above see the first result.
            const chained = (inFlight.current ?? Promise.resolve()).then(run, run);
            inFlight.current = chained;

            await chained;

            if (inFlight.current === chained) {
                inFlight.current = null;
            }
        },
        [isAuthenticated, email, addDeviceToken, dispatch]
    );

    useEffect(() => {
        // A different user signing in on this handset must re-register rather than be
        // treated as a duplicate of whoever was here before, and any registration still
        // in flight for the previous session must be abandoned rather than land now.
        generation.current += 1;
        lastRegistered.current = null;

        registerDevice();

        /**
         * Expo rotates push tokens on its own schedule. Without this listener the
         * registration above only ever runs at mount — login and cold start — so a user
         * who stays signed in and never force-quits stops receiving notifications the
         * moment their token rotates, with no symptom on either side: the backend keeps
         * accepting the send, Expo returns `DeviceNotRegistered` in a receipt nobody
         * reads, and the user concludes notifications were turned off.
         */
        const tokenListener = Notifications.addPushTokenListener(({ data }) => {
            registerDevice(data);
        });

        return () => {
            generation.current += 1;
            tokenListener.remove();
        };
    }, [registerDevice]);

    useEffect(() => {
        if (Platform.OS === 'android') {
            setUpAndroidChannels()
                .then(() => Notifications.getNotificationChannelsAsync())
                .then(channels => dispatch(notificationActions.setChannels(channels ?? [])))
                .catch(() => {});
        }

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            dispatch(notificationActions.setNotification(notification));
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            // Handle notification response here
            dispatch(notificationActions.setNotification(response.notification));
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, [dispatch]);

    return <>{children}</>;
};
