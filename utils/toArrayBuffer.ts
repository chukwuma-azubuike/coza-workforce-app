import { File } from 'expo-file-system';

const toArrayBuffer = async (fileUri: string): Promise<ArrayBuffer> => {
    const normalizedUri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
    const file = new File(normalizedUri);
    if (!file.exists) {
        throw new Error('File does not exist at path: ' + normalizedUri);
    }
    const base64Data = await file.base64();
    const binaryString = atob(base64Data);
    const buffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(buffer);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return buffer;
};

export default toArrayBuffer;
