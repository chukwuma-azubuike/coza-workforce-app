import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const toArrayBuffer = async (fileUri: string): Promise<ArrayBuffer> => {
    try {
        // Adjust file URI for iOS if needed
        const normalizedPath = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;

        // Check if the file exists
        const fileExists = await RNFS.exists(normalizedPath);
        if (!fileExists) {
            throw new Error('File does not exist at path: ' + normalizedPath);
        }

        // Read file content as Base64
        const base64Data = await RNFS.readFile(normalizedPath, 'base64');

        // Convert Base64 to binary data (ArrayBuffer)
        const binaryString = atob(base64Data);
        const buffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(buffer);

        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }

        return buffer;
    } catch (error) {
        throw error; // Re-throw to handle at a higher level
    }
};

export default toArrayBuffer;
