import { Linking, Platform } from 'react-native';

const openLocationSettings = () => {
    if (Platform.OS === 'android') {
        Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    }

    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
    }
};

export default openLocationSettings;
