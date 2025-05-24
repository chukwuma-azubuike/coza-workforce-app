import { useState, useEffect, useCallback } from 'react';
import uniqBy from 'lodash/uniqBy';
import { IDefaultQueryParams } from '~/store/types';

export interface InfiniteResponse<T> {
    items: T[];
}

export interface InfiniteDataResult<T> {
    data: T[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    refetch: () => void;
    reset: () => void;
    hasNextPage: boolean;
    currentPage: number;
}

/**
 * useInfiniteData
 *
 * @param params – additional RTK Query parameters (besides paging)
 * @param queryHook – the RTK Query hook that fetches a paginated response.
 *                     It must accept an object parameter with at least a `page` number.
 * @param uniqKey – the key to use for deduplication (default: 'id')
 * @param skip – boolean for lazy fetching (default: false)
 */
function useInfiniteData<T, TParams>(
    params: TParams & IDefaultQueryParams,
    queryHook: (
        arg: TParams & { page: number },
        options?: Record<string | 'skip', any>
    ) => {
        data?: T[]; //TODO: TBD from backend. Type should be InfiniteResponse<T>
        isSuccess: boolean;
        isFetching: boolean;
        refetch: () => void;
    },
    uniqKey: string = '_id',
    skip?: boolean,
    refetchOnMountOrArgChange: boolean = true
): InfiniteDataResult<T> {
    const [page, setPage] = useState(1);
    const [mergedData, setMergedData] = useState<T[]>([]);

    // Reset when parameters change.
    // useEffect(() => {
    //     setPage(1);
    //     setMergedData([]);
    // }, [params]);

    // Invoke your RTK Query hook with the given parameters, and the current page.
    const { data, isSuccess, isFetching, refetch } = queryHook(
        { ...params, page },
        { skip, refetchOnMountOrArgChange }
    );

    const hasNextPage = !!(data?.length && params?.limit && data.length <= params.limit); // Rework logic one backend starts returning `hasMore`

    // When a new page is successfully fetched, merge it with the existing data.
    useEffect(() => {
        if (isSuccess && data && data?.length > 0) {
            setMergedData(prevData => uniqBy([...prevData, ...data], uniqKey));
        }
    }, [data, isSuccess, uniqKey]);

    // Trigger fetching the next page.
    const fetchNextPage = useCallback(() => {
        if (!isFetching && hasNextPage && !!params?.limit) {
            setPage(prevPage => prevPage + 1);
        }
    }, [data, isFetching, params?.limit]);

    // Reset the pagination.
    const reset = useCallback(() => {
        setPage(1);
        setMergedData([]);
        refetch();
    }, [refetch]);

    return {
        data: mergedData,
        isLoading: isFetching && page === 1,
        isFetchingNextPage: isFetching && page > 1,
        fetchNextPage,
        refetch,
        reset,
        hasNextPage: hasNextPage,
        currentPage: page,
    };
}

export default useInfiniteData;
