import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export const openFile = async (downloadedFilePath: string) => {
    if (downloadedFilePath) {
        Sharing.isAvailableAsync()
            .then(value => {
                if (value)
                    Sharing.shareAsync(`file://${downloadedFilePath}`, { dialogTitle: 'Open File' }).catch(error => {
                        Alert.alert(JSON.stringify(error));
                    });
            })
            .catch(error => {
                Alert.alert(JSON.stringify(error));
            });
    }
};
