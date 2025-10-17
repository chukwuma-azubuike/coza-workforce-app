import { useEffect } from 'react';
import * as Updates from 'expo-updates';

const useExpoUpdate = () => {
    const { isUpdateAvailable } = Updates.useUpdates();

    useEffect(() => {
        if (!isUpdateAvailable) return;

        // Update is available; download and apply it now
        Updates.fetchUpdateAsync()
            .then(() => {
                Updates.reloadAsync().catch();
            })
            .catch()
            .finally();
    }, [isUpdateAvailable]);
};

export default useExpoUpdate;
