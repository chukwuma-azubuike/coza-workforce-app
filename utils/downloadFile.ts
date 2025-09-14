import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { generateExcelFile, writeToStorage } from './generateFile';
import { openFile } from './openFile';

export const downloadFile = async (data: any[] = [], fileName: string) => {
    if (Platform.OS === 'android') {
        try {
            // Check for Permission (check if permission is already given or not)
            let isPermitedExternalStorage = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (!isPermitedExternalStorage) {
                // Ask for permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        buttonPositive: 'OK',
                        buttonNegative: 'Cancel',
                        buttonNeutral: 'Ask Me Later',
                        title: 'Storage permission needed',
                        message: 'We need access to store data on your local drive.',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Permission Granted (calling our exportDataToExcel function)
                    try {
                        const filePath = (await generateExcelFile(data, fileName))?.filePath;
                        openFile(filePath);
                    } catch (error) {
                        Alert.alert('Unable to download file', 'An error occured while trying to download the file.');
                    }
                } else {
                    // Permission denied
                    Alert.alert('Permission denied');
                }
            } else {
                // Already have Permission (calling our exportDataToExcel function)
                const filePath = (await generateExcelFile(data, fileName))?.filePath;
                openFile(filePath);
            }
        } catch (e) {
            Alert.alert('Failed');
            return;
        }
    } else {
        try {
            const filePath = (await generateExcelFile(data, fileName))?.filePath;
            openFile(filePath);
        } catch (error) {
            Alert.alert('Unable to download file', 'An error occured while trying to download the file.');
        }
    }
};

export const downloadGeneratedExcelFile = async (file: any[] = [], fileName: string) => {
    if (Platform.OS === 'android') {
        try {
            // Check for Permission (check if permission is already given or not)
            let isPermitedExternalStorage = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (!isPermitedExternalStorage) {
                // Ask for permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        buttonPositive: 'OK',
                        buttonNegative: 'Cancel',
                        buttonNeutral: 'Ask Me Later',
                        title: 'Storage permission needed',
                        message: 'We need access to store data on your local drive.',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Permission Granted (calling our exportDataToExcel function)
                    try {
                        const filePath = (await writeToStorage(file, fileName))?.filePath;
                        openFile(filePath);
                    } catch (error) {
                        Alert.alert('Unable to download file', 'An error occured while trying to download the file.');
                    }
                } else {
                    // Permission denied
                    Alert.alert('Permission denied');
                }
            } else {
                // Already have Permission (calling our exportDataToExcel function)
                const filePath = (await writeToStorage(file, fileName))?.filePath;
                openFile(filePath);
            }
        } catch (e) {
            Alert.alert('Failed');
            return;
        }
    } else {
        try {
            const filePath = (await writeToStorage(file, fileName))?.filePath;
            openFile(filePath);
        } catch (error) {
            Alert.alert('Unable to download file', 'An error occured while trying to download the file.');
        }
    }
};
