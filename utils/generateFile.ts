import { File, Paths } from 'expo-file-system';
import XLSX from 'xlsx';

export const generateExcelFile = async (data: any[], fileName: string = 'Untitled file') => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout: string = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const file = new File(Paths.document, `${fileName}.xlsx`);
    file.write(wbout, { encoding: 'base64' });
    return { filePath: file.uri };
};

export const writeToStorage = async (generatedFile: string, fileName: string) => {
    const file = new File(Paths.document, `${fileName}.xlsx`);
    file.write(generatedFile, { encoding: 'base64' });
    return { filePath: file.uri };
};
