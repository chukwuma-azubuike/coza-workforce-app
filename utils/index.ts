import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { IToken, IUser } from '../store/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import findIndex from 'lodash/findIndex';
import groupBy from 'lodash/groupBy';
import merge from 'lodash/merge';
import forEach from 'lodash/forEach';

dayjs.extend(utc);

class Utils {
    /************ Version Specific ************/

    static IOS16 = Platform.OS === 'ios' && +Platform.Version.substring(0, 4) >= 14.0;

    /************ String logic ************/

    static splitString(char: string, separator: string = ' ') {
        return char.split(separator).join(' ');
    }

    static capitalizeFirstChar(char: string = '', separator: string = ' ') {
        if (!char) {
            return '';
        }

        let splitChar = this.splitString(char, separator);
        let firstChar = splitChar.charAt(0).toUpperCase();
        let restChar = splitChar.slice(1, splitChar.length);

        return `${firstChar}${restChar.toLowerCase()}`;
    }

    static truncateString(str: string = '', num: number = 25) {
        if (str?.length > num) {
            return str.slice(0, num) + '...';
        }
        return str;
    }

    static formatEmail(email: string) {
        return this.splitString(email).toLowerCase().trim();
    }

    /**************** Sorting ****************/

    /**
     *
     * @param arrObject Array of sort
     * @param key Key to sort by
     * @returns Sorted Array
     */

    static sortStringAscending<D = Record<string, any>>(arrObject: Array<D> = [], key: keyof D) {
        if (arrObject && typeof key === 'string') {
            return [...arrObject].sort((a, b) => ((a as any)[key] > (b as any)[key] ? 1 : -1));
        }
        return [];
    }

    /**
     *
     * @param arrObject Array to sort
     * @param key Key to sort by
     * @param order Sort order 'asc' or 'desc' (default: 'desc')
     * @returns Sorted Array
     */

    static sortByDate = (arrObject: any[] | [], key: string, order: 'asc' | 'desc' = 'desc') => {
        return [...arrObject]?.sort((a, b) => {
            const multiplier = order === 'asc' ? 1 : -1;
            return multiplier * (dayjs(a[key]).unix() - dayjs(b[key]).unix());
        });
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

        var date1 = dayjs(date_1);
        var date2 = dayjs(date_2);

        var diff = Math.abs(date2.diff(date1));

        let hours = dayjs(diff).hour();
        let minutes = dayjs(diff).minute();

        const hrsMins = `${dayjs.utc(diff).format('HH:mm')} Hr(s)`;

        return { hours, minutes, hrsMins };
    }

    /************ Storage logic ************/
    /*********** Encrypted Storage ********/

    static storeUserSession = async (user: { token: IToken; profile: IUser }) => {
        try {
            await SecureStore.setItemAsync('user_session', JSON.stringify(user));
        } catch (error) {
            // There was an error on the native side
        }
    };

    static retrieveUserSession = async () => {
        try {
            const session = await SecureStore.getItemAsync('user_session');

            return session;
        } catch (error) {
            return false;
            // There was an error on the native side
        }
    };

    static removeUserSession = async () => {
        try {
            await SecureStore.deleteItemAsync('user_session');
        } catch (error) {
            // There was an error on the native side
        }
    };

    static clearStorage = async () => {
        try {
            await SecureStore.deleteItemAsync('user_session');
        } catch (error) {
            // There was an error on the native side
        }
    };

    /****************** Async Storage ****************/

    static retrieveCurrentUserData: () => Promise<any> = async () => {
        try {
            const userData = await SecureStore.getItemAsync('current_user');

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
            await SecureStore.deleteItemAsync('current_user');
            await SecureStore.deleteItemAsync('user_session');
        } catch (error) {}
    };

    /************ Native Permisisons logic ************/

    // Checks the current foreground location permission status.
    // If not granted, it requests permission.
    static checkLocationPermission = async (successCallBack?: () => void): Promise<string> => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                // Permission already granted.
                successCallBack && successCallBack();
                return status;
            } else {
                // Permission not granted or undetermined; request it.
                return await this.requestLocationPermission(successCallBack);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    };

    // Requests the foreground location permission.
    static requestLocationPermission = async (successCallBack?: () => void): Promise<string> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                successCallBack && successCallBack();
            }
            return status;
        } catch (error) {
            return Promise.reject(error);
        }
    };
    /************** Objects **************/

    static compareObjectValueByKey(obj1: any, obj2: any) {
        // Get the keys of obj1
        const obj1Keys = Object.keys(obj1);

        // Iterate over the keys
        for (let key of obj1Keys) {
            // Check if the corresponding key exists in obj2 and if their values are the same
            if (obj2.hasOwnProperty(key) && obj1[key] === obj2[key]) {
                continue;
            } else {
                return false;
            }
        }

        // If all corresponding keys have the same values, return true
        return true;
    }

    /************** Arrays ***************/

    // This functions groups a list (Array of objects) by a common key;
    /**
     *
     * @param array Array of objects
     * @param key common key
     * @param returnType
     * @returns 'entries' | 'values'
     */

    static groupListByKey<T = Record<any, any>>(
        array: T[] = [],
        key: string,
        returnType: 'entries' | 'values' = 'entries'
    ) {
        if (!array?.length) return [];

        const grouped =
            key === 'createdAt' || key === 'dateCreated' || key === 'updatedAt' || key === 'sortDateKey'
                ? groupBy(array, (item: any) => dayjs(item[key]).format('MMMM DD, YYYY'))
                : groupBy(array, key);

        return Object[returnType](grouped);
    }

    /**
     *
     * @param array Original List Array
     * @param newObject Updated object
     * @param keyValue Key value pair to be searched [key, value]
     * @returns Updated array
     */
    static replaceArrayItemByNestedKey = (array: any[], newObject: any, keyValue: string[]) => {
        if (!array || !array.length) return [];

        const originalList = array;
        const index = findIndex(originalList, keyValue);

        // Push if index doesn't exist
        if (index === -1) {
            return [newObject, ...originalList];
        }

        // Replace item at index
        originalList[index] = newObject;

        return originalList;
    };

    static mergeDuplicatesByKey = <T>(array: any[], key: keyof T = '_id' as keyof T) => {
        const grouped = groupBy(array, key);

        const merged: any[] = [];

        forEach(grouped, group => {
            const obj = merge({}, ...group);
            merged.push(obj);
        });

        return merged;
    };

    /************** convertToEpoc ***************/

    static concatDateTime = (date: string | Date, time: string | Date) => {
        const concatedTime = `${dayjs(date).format('YYYY-MM-DD')}T${dayjs(time).format('HH:mm:ss')}.000Z`;

        const res =
            date && !time
                ? dayjs(date).subtract(1, 'hour').unix()
                : time && !date
                ? dayjs(time).subtract(1, 'hour').unix()
                : time && date
                ? dayjs(concatedTime).subtract(1, 'hour').unix()
                : dayjs(date).unix();

        return res;
    };
}

export default Utils;

type GroupListByKey<A> = {
    key: keyof A;
    array: A[];
};
