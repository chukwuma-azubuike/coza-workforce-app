import RNFS from 'react-native-fs';
import { Alert } from 'react-native';
import XLSX from 'xlsx';

export const generateExcelFile = async (data: any[], fileName: string = 'Untitled file') => {
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}.xlsx`;

    // Write generated excel to Storage
    RNFS.writeFile(filePath, wbout, 'ascii')
        .then((r: any) => {})
        .catch((e: any) => {
            Alert.alert('Unable to generate file', e);
        });
    return { filePath };
};

export const writeToStorage = async (generatedFile: any, fileName: string) => {
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}.xlsx`;

    // Write generated excel to Storage
    RNFS.writeFile(filePath, generatedFile, 'ascii')
        .then((r: any) => {})
        .catch((e: any) => {
            Alert.alert('Unable to generate file', e);
        });
    return { filePath };
};
