import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { roastCRMActions, roastCRMSelectors } from '~/store/actions/roast-crm';
import { useAppSelector } from '~/store/hooks';

const useCacheSync = async () => {
    const netInfo = useNetInfo();
    const isOnline = netInfo.isConnected;
    const dispatch = useDispatch();
    const cacheStore = useAppSelector(store => roastCRMSelectors.selectFetchCache(store));

    const initialize = async () => {
        if (cacheStore && cacheStore?.length > 0) {
            const networkCalls = cacheStore.map(({ fn, payload }) => {
                return fn(payload);
            });

            const fetchPromises = Promise.allSettled(networkCalls);

            try {
                const results = await fetchPromises;

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        const cacheKey = cacheStore[index].cacheKey;
                        dispatch(roastCRMActions.removeFetchCache(cacheKey));
                    } else {
                        console.log('Failed -->', result, index);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        if (isOnline) {
            (async () => await initialize())();
        }
    }, [isOnline]);
};

export default useCacheSync;
