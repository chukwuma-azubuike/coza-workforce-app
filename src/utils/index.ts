import { Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import EncryptedStorage from 'react-native-encrypted-storage';
import { IToken, IUser } from '../store/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { isValidPhoneNumber } from 'libphonenumber-js';
import findIndex from 'lodash/findIndex';
class Utils {
    /************ Version Specific ************/

    static IOS16 = Platform.OS === 'ios' && +Platform.Version.substring(0, 4) >= 14.0;

    /************ String logic ************/

    static splitString(char: string, separator: string = ' ') {
        return char.split(separator).join(' ');
    }

    static capitalizeFirstChar(char: string, separator: string = ' ') {
        if (!char) {
            return '';
        }

        let splitChar = this.splitString(char, separator);
        let firstChar = splitChar.charAt(0).toUpperCase();
        let restChar = splitChar.slice(1, splitChar.length);

        return `${firstChar}${restChar.toLowerCase()}`;
    }

    static truncateString(str: string, num: number = 25) {
        if (str?.length > num) {
            return str.slice(0, num) + '...';
        }
        return str;
    }

    static formatEmail(email: string) {
        return this.splitString(email).toLowerCase();
    }

    /**************** Sorting ****************/

    /**
     *
     * @param arrObject Array of sort
     * @param key Key to sort by
     * @returns Sorted Array
     */

    static sortStringAscending = (arrObject: any[], key: string) =>
        [...arrObject].sort((a, b) => (a[key] > b[key] ? 1 : -1));

    /**
     *
     * @param arrObject Array to sort
     * @param key Key to sort by
     * @returns Sorted Array
     */

    static sortByDate = (arrObject: any[], key: string) => {
        return [...arrObject].sort((a, b) => moment(b[key]).unix() - moment(a[key]).unix());
    };

    /*************** Filters ****************/

    /**
     *
     * @param arr Array
     * @param citeria filter key
     * @returns Array
     */

    static filter(arr?: any[], citeria?: any) {
        if (arr) {
            return arr.filter(elm => elm !== citeria);
        }
        return [];
    }

    /********** Date and Time Logic ***********/

    /**
     *
     * @param date_1 string
     * @param date_2 string
     * @returns {string, string, string}
     */

    static timeDifference(date_1: string, date_2: string) {
        if (!date_1 || !date_2) {
            return { hours: '--:--', minutes: '--:--' };
        }

        var date1 = moment(date_1);
        var date2 = moment(date_2);

        var diff = Math.abs(date2.diff(date1));

        let hours = moment(diff).hours();
        let minutes = moment(diff).minutes();

        const hrsMins = `${moment.utc(diff).format('HH:mm')} Hr(s)`;

        return { hours, minutes, hrsMins };
    }

    /************ Storage logic ************/
    /*********** Encrypted Storage ********/

    static storeUserSession = async (user: { token: IToken; profile: IUser }) => {
        try {
            await EncryptedStorage.setItem('user_session', JSON.stringify(user));
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

            if (userData) {
                return JSON.parse(userData);
            }

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

    static checkLocationPermission = async () => {
        const isIOS = Platform.OS === 'ios';

        check(isIOS ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            .then(result => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        break;
                    case RESULTS.DENIED:
                        break;
                    case RESULTS.LIMITED:
                        break;
                    case RESULTS.GRANTED:
                        break;
                    case RESULTS.BLOCKED:
                        break;
                }
            })
            .catch(error => {});
    };

    static requestLocationPermission = async () => {
        const isIOS = Platform.OS === 'ios';

        request(isIOS ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, {
            title: 'Location Access',
            message: 'This App needs access to your location',
            buttonPositive: 'OK',
            buttonNegative: 'DENY',
        }).then(result => {});
    };

    /************** Arrays ***************/

    // This functions groups a list (Array of objects) by a common key;
    static groupListByKey = (array: any[] = [], key: string) => {
        const map: any = {};

        if (!array?.length || !array) {
            return [];
        }

        for (let i = 0; i < array.length; i++) {
            let keyInMap = array[i][key];

            if (key === 'createdAt' || key === 'dateCreated' || key === 'updatedAt') {
                keyInMap = moment(array[i][key]).format('MMMM Do, YYYY');
            }

            if (map[keyInMap]) {
                map[keyInMap] = [...map[keyInMap], array[i]];
            } else {
                map[keyInMap] = [array[i]];
            }
        }
        return Object.entries(map);
    };

    /**
     *
     * @param array Original List Array
     * @param newObject Updated object
     * @param keyValue Key value pair to be searched
     * @returns Updated array
     */
    static replaceArrayItemByNestedKey = (array: any[], newObject: any, keyValue: any[]) => {
        if (!array || !array.length) return [];

        const originalList = array;
        const index = findIndex(originalList, keyValue);

        // Replace item at index
        originalList[index] = newObject;

        return originalList;
    };

    /************** validatePhoneNumber ***************/

    static validatePhoneNumber = (phoneNumber: string) => {
        const errors: Record<string, string> = {};

        if (!isValidPhoneNumber(phoneNumber)) {
            errors.phoneNumber = 'Invalid phone number';
        }

        return errors;
    };
}

export default Utils;

type GroupListByKey<A> = {
    key: keyof A;
    array: A[];
};
