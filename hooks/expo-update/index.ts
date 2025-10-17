import { useEffect } from 'react';
import * as Updates from 'expo-updates';

const useExpoUpdate = () => {
    const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
        // Update is available; download and apply it now
        Updates.fetchUpdateAsync()
            .then(() => {
                if (isUpdatePending) {
                    Updates.reloadAsync().catch();
                }
            })
            .catch()
            .finally();
    }, [isUpdateAvailable, isUpdatePending]);
};

export default useExpoUpdate;
