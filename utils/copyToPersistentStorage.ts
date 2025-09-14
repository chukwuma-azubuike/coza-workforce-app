import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const copyToPersistentStorage = async (fileUri: string) => {
    // Normalize the file path
    const normalizedPath = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;

    // Extract the original file name
    const fileName = normalizedPath.split('/').pop(); // e.g., "PHOTO-2024-10-06-14-49-02%202.jpg"

    // Define the destination path with the same name
    const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    try {
        await RNFS.copyFile(normalizedPath, destinationPath);
        return destinationPath;
    } catch (error) {
        throw error;
    }
};

export default copyToPersistentStorage;
