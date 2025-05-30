import { useCallback, useEffect, useState } from 'react';
import uniqBy from 'lodash/uniqBy';
import { IDefaultQueryParams } from '@store/types';
import useScreenFocus from '../focus';

interface InfiniteDataResult<T> {
    data: T[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    refetch: () => void;
}

/**
 * useInfiniteData - Optimized hook for infinite scrolling with better state management
 *
 * @param params – additional RTK Query parameters (besides paging)
 * @param queryHook – the RTK Query hook that fetches a paginated response
 * @param uniqKey – the key to use for deduplication (default: '_id')
 * @param skip – boolean for lazy fetching (default: false)
 * @param refetchOnMountOrArgChange – whether to refetch on mount or when arguments change
 */
function useInfiniteData<T, TParams>(
    params: TParams & IDefaultQueryParams,
    queryHook: (
        arg: TParams & { page: number },
        options?: Record<string | 'skip', any>
    ) => {
        data?: T[];
        isLoading: boolean;
        isSuccess: boolean;
        isFetching: boolean;
        refetch: () => void;
        isUninitialized: boolean;
    },
    uniqKey: string = '_id',
    skip?: boolean,
    refetchOnMountOrArgChange: boolean = true
): InfiniteDataResult<T> {
    const [page, setPage] = useState(1);
    const [mergedData, setMergedData] = useState<T[]>([]);
    const [hasNextPage, setHasNextPage] = useState(true);

    const {
        data: queryData,
        isSuccess,
        isLoading,
        isFetching,
        isUninitialized,
        refetch: rtkQueryRefetch,
    } = queryHook(
        { ...params, page },
        {
            skip: skip,
            refetchOnMountOrArgChange,
        }
    );

    // Reset page when screen is unfocused to allow cache tag in RTK Query to be invalidated
    useScreenFocus({
        onFocusExit: () => {
            setPage(1);
        },
    });

    useEffect(() => {
        if (isSuccess && queryData) {
            if (page === 1) {
                setMergedData(queryData);
            } else {
                if (queryData.length > 0) {
                    setMergedData(prevData => uniqBy([...prevData, ...queryData], uniqKey));
                }
            }

            if (queryData.length < (params?.limit || 20)) {
                setHasNextPage(false);
            } else {
                setHasNextPage(true);
            }
        } else if (isSuccess && !queryData) {
            if (page === 1) {
                setMergedData([]);
            }
            setHasNextPage(false);
        }
    }, [queryData, isSuccess, page, uniqKey]);

    const fetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetching) {
            setPage(prevPage => prevPage + 1);
        }
    }, [hasNextPage, isFetching]);

    const performRefetch = useCallback(() => {
        setPage(1);
        if (!isUninitialized) {
            rtkQueryRefetch();
        }
    }, [isUninitialized, rtkQueryRefetch]);

    return {
        isLoading,
        data: mergedData,
        isFetchingNextPage: page > 1 && isFetching,
        hasNextPage,
        fetchNextPage,
        refetch: performRefetch,
    };
}

export default useInfiniteData;
