import React from 'react';
import { Alert, BackHandler, Linking } from 'react-native';
import VersionCheck from 'react-native-version-check';

const checkVersion = async () => {
    try {
        let updateNeeded = await VersionCheck.needUpdate();

        if (updateNeeded && updateNeeded.isNeeded) {
            Alert.alert(
                'Kindly Update',
                'You will have to update your app to the latest version.',
                [
                    {
                        text: 'Update',
                        onPress: () => {
                            BackHandler.exitApp();
                            Linking.openURL(updateNeeded.storeUrl);
                        },
                    },
                ],
                { cancelable: false }
            );
        }
    } catch (error) {}
};

export default checkVersion;
