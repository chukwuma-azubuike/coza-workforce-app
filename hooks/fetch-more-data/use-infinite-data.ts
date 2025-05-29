import { useCallback, useEffect, useRef, useState } from 'react';
import uniqBy from 'lodash/uniqBy';
import { IDefaultQueryParams } from '@store/types';

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
    const [hasNextPage, setHasNextPage] = useState(true);
    
    // Use refs to track loading states and prevent race conditions
    const isFetchingRef = useRef(false);
    const abortController = useRef<AbortController | null>(null);

    // Reset when parameters change
    useEffect(() => {
        setPage(1);
        setMergedData([]);
        setHasNextPage(true);
        
        // Cleanup any ongoing requests
        if (abortController.current) {
            abortController.current.abort();
        }
    }, [JSON.stringify(params)]); // Deep compare params to prevent unnecessary resets

    // Invoke RTK Query hook with current page
    const { 
        data, 
        isSuccess, 
        isFetching, 
        refetch 
    } = queryHook(
        { ...params, page },
        { 
            skip: skip || isFetchingRef.current, 
            refetchOnMountOrArgChange 
        }
    );

    // Update merged data when new data arrives
    useEffect(() => {
        if (isSuccess && data) {
            if (data.length === 0) {
                setHasNextPage(false);
            } else {
                setMergedData(prevData => {
                    const newData = page === 1 ? data : uniqBy([...prevData, ...data], uniqKey);
                    return newData;
                });
                
                // Check if we've reached the end
                if (data.length < (params?.limit || 20)) {
                    setHasNextPage(false);
                }
            }
            isFetchingRef.current = false;
        }
    }, [data, isSuccess, page, uniqKey, params?.limit]);

    // Debounced fetchNextPage to prevent rapid firing
    const fetchNextPage = useCallback(() => {
        if (!isFetchingRef.current && hasNextPage && !isFetching) {
            isFetchingRef.current = true;
            
            // Create new abort controller for this request
            if (abortController.current) {
                abortController.current.abort();
            }
            abortController.current = new AbortController();

            setPage(prevPage => prevPage + 1);
        }
    }, [hasNextPage, isFetching]);

    // Cleanup function
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    return {
        data: mergedData,
        isLoading: page === 1 && isFetching,
        isFetchingNextPage: page > 1 && isFetching,
        hasNextPage,
        fetchNextPage,
        refetch: () => {
            setPage(1);
            setMergedData([]);
            setHasNextPage(true);
            isFetchingRef.current = false;
            refetch();
        }
    };
}

export default useInfiniteData;
