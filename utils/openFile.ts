import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export const openFile = async (filePath: string) => {
    if (!filePath) return;
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        Alert.alert('Sharing unavailable', 'Your device does not support file sharing.');
        return;
    }
    await Sharing.shareAsync(filePath, { dialogTitle: 'Open File' });
};
