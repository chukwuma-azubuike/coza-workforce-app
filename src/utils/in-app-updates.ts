import SpInAppUpdates, {
    IAUUpdateKind,
    StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import { Platform } from 'react-native';

const appUpdates = new SpInAppUpdates(
    false // isDebug
);
// curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info

const inAppUpdates = () => {
    appUpdates.checkNeedsUpdate().then(result => {
        if (result.shouldUpdate) {
            let updateOptions: StartUpdateOptions = { forceUpgrade: true };
            if (Platform.OS === 'android') {
                // android only, on iOS the user will be promped to go to your app store page
                updateOptions = {
                    updateType: IAUUpdateKind.IMMEDIATE,
                };
            }
            appUpdates.startUpdate(updateOptions);
        }
    });
};

export default inAppUpdates;
