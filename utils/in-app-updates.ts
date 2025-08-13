import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from 'sp-react-native-in-app-updates';
import { Platform } from 'react-native';

const appUpdates = new SpInAppUpdates(
    false // isDebug
);

const inAppUpdates = async () => {
    const result = await appUpdates.checkNeedsUpdate();

    if (result.shouldUpdate) {
        let updateOptions: StartUpdateOptions = { forceUpgrade: true };
        if (Platform.OS === 'android') {
            // android only, on iOS the user will be promped to go to your app store page
            updateOptions = {
                updateType: IAUUpdateKind.FLEXIBLE,
            };
        }
        appUpdates.startUpdate(updateOptions);
    }
};

export default inAppUpdates;
