import {
    Alert,
    Linking,
    NativeModules,
    PermissionsAndroid,
    Platform,
    ToastAndroid,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import EncryptedStorage from 'react-native-encrypted-storage';
import { IToken, IUser } from '../store/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Utils {
    /************ String logic ************/

    static splitString(char: string, separator: string = ' ') {
        return char.split(separator).join(' ');
    }

    static capitalizeFirstChar(char: string, separator: string = ' ') {
        let splitChar = this.splitString(char, separator);
        let firstChar = splitChar.charAt(0).toUpperCase();
        let restChar = splitChar.slice(1, splitChar.length);

        return `${firstChar}${restChar.toLowerCase()}`;
    }

    static truncateString(str: string, num: number = 25) {
        if (str.length > num) {
            return str.slice(0, num) + '...';
        }
        return str;
    }

    /*************** Filters ****************/
    static filter(arr?: any[], citeria?: any) {
        if (arr) return arr.filter(elm => elm !== citeria);
        return [];
    }

    /************ Storage logic ************/
    /*********** Encrypted Storage ********/

    static storeUserSession = async (user: {
        token: IToken;
        profile: IUser;
    }) => {
        try {
            await EncryptedStorage.setItem(
                'user_session',
                JSON.stringify(user)
            );
        } catch (error) {
            // There was an error on the native side
        }
    };

    static retrieveUserSession = async () => {
        try {
            const session = await EncryptedStorage.getItem('user_session');

            return session;
        } catch (error) {
            return false;
            // There was an error on the native side
        }
    };

    static removeUserSession = async () => {
        try {
            await EncryptedStorage.removeItem('user_session');
        } catch (error) {
            // There was an error on the native side
        }
    };

    static clearStorage = async () => {
        try {
            await EncryptedStorage.clear();
        } catch (error) {
            // There was an error on the native side
        }
    };

    /****************** Async Storage ****************/

    static storeCurrentUserData = async (data: IUser) => {
        try {
            await AsyncStorage.setItem('current_user', JSON.stringify(data));
        } catch (error) {}
    };

    static retrieveCurrentUserData: () => Promise<any> = async () => {
        try {
            const userData = await AsyncStorage.getItem('current_user');

            if (userData) return JSON.parse(userData);

            return;
        } catch (error) {
            return;
        }
    };

    static clearCurrentUserStorage = async () => {
        try {
            await AsyncStorage.clear();
        } catch (error) {}
    };

    /************ Native Permisisons logic ************/

    static hasPermissionIOS = async () => {
        const openSetting = () => {
            Linking.openSettings().catch(() => {
                Alert.alert('Unable to open settings');
            });
        };
        const status = await Geolocation.requestAuthorization('whenInUse');

        if (status === 'granted') {
            return true;
        }

        if (status === 'denied') {
            Alert.alert('Location permission denied');
        }

        if (status === 'disabled') {
            Alert.alert(
                `Turn on Location Services to allow COZA Global App to determine your location.`,
                '',
                [
                    { text: 'Go to Settings', onPress: openSetting },
                    { text: "Don't Use Location", onPress: () => {} },
                ]
            );
        }

        return false;
    };

    static hasLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const hasPermission = await this.hasPermissionIOS();
            return hasPermission;
        }

        if (Platform.OS === 'android' && Platform.Version < 23) {
            return true;
        }

        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) {
            return true;
        }

        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }

        if (status === PermissionsAndroid.RESULTS.DENIED) {
            ToastAndroid.show(
                'Location permission denied by user.',
                ToastAndroid.LONG
            );
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            ToastAndroid.show(
                'Location permission revoked by user.',
                ToastAndroid.LONG
            );
        }

        return false;
    };

    // Localisation
    static locale =
        Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale.substring(3, 5)
            : NativeModules.I18nManager.localeIdentifier.substring(3, 5);
}

export default Utils;
