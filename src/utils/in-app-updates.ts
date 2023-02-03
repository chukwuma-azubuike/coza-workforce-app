import SpInAppUpdates, {
    IAUUpdateKind,
    StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const appUpdates = new SpInAppUpdates(
    false // isDebug
);
// curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info

export const needsLogoutList = ['1.0.9'];

const inAppUpdates = async () => {
    let needsLogout = false;

    const localVersion = DeviceInfo.getVersion();

    const result = await appUpdates.checkNeedsUpdate();

    const storeVersion = result.storeVersion;

    if (needsLogoutList.includes(localVersion)) {
        needsLogout = true;
    }

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

    return {
        needsLogout,
        storeVersion,
    };
};

export default inAppUpdates;
