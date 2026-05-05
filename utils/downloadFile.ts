import { Alert } from 'react-native';
import { generateExcelFile, writeToStorage } from './generateFile';
import { openFile } from './openFile';

export const downloadFile = async (data: any[] = [], fileName: string) => {
    try {
        const { filePath } = await generateExcelFile(data, fileName);
        await openFile(filePath);
    } catch {
        Alert.alert('Unable to download file', 'An error occurred while trying to download the file.');
    }
};

export const downloadGeneratedExcelFile = async (file: string, fileName: string) => {
    try {
        const { filePath } = await writeToStorage(file, fileName);
        await openFile(filePath);
    } catch {
        Alert.alert('Unable to download file', 'An error occurred while trying to download the file.');
    }
};
