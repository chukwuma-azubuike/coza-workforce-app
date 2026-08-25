import { useCallback, useEffect, useRef, useState } from 'react';
import uniqBy from 'lodash/uniqBy';
import { IDefaultQueryParams, IPaginationParams } from '@store/types';
import useScreenFocus from '../focus';

interface InfiniteDataResult<T> {
    data: T[];
    isLoading: boolean;
    isFetching: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    pagination?: IPaginationParams;
    fetchNextPage: () => void;
    refetch: () => void;
}

/**
 * A paginated endpoint may return either:
 *  - a bare array of rows (legacy shape), or
 *  - an object wrapping the rows alongside pagination metadata: `{ data, pagination }`.
 */
type PaginatedResponse<T> = { data: T[]; pagination?: IPaginationParams };
type QueryResponse<T> = T[] | PaginatedResponse<T>;

const isPaginatedResponse = <T>(res: QueryResponse<T> | undefined): res is PaginatedResponse<T> =>
    !!res && !Array.isArray(res) && Array.isArray((res as PaginatedResponse<T>).data);

/**
 * useInfiniteData - Optimized hook for infinite scrolling with better state management
 *
 * Supports both response shapes described in {@link QueryResponse}. When pagination
 * metadata is present it is used to compute `hasNextPage`; otherwise the hook falls
 * back to a page-size heuristic (a short page means there is nothing more to load).
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
        data?: QueryResponse<T>;
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
    const [pagination, setPagination] = useState<IPaginationParams | undefined>(undefined);

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

    // Normalize either response shape into a plain rows array + optional pagination meta.
    const items = isPaginatedResponse<T>(queryData) ? queryData.data : queryData;
    const pageMeta = isPaginatedResponse<T>(queryData) ? queryData.pagination : undefined;

    // Reset page when screen is unfocused to allow cache tag in RTK Query to be invalidated
    useScreenFocus({
        onFocusExit: () => {
            setPage(1);
        },
    });

    // Restart pagination from the first page whenever the filter params change
    // (e.g. search term, zone or stage filter). For consumers with stable params
    // this key never changes, so existing behaviour is unaffected.
    const paramsKey = JSON.stringify(params);
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setPage(1);
        setMergedData([]);
        setPagination(undefined);
    }, [paramsKey]);

    useEffect(() => {
        if (isSuccess && items) {
            if (page === 1) {
                setMergedData(items);
            } else if (items.length > 0) {
                setMergedData(prevData => uniqBy([...prevData, ...items], uniqKey));
            }

            if (pageMeta) {
                setPagination(pageMeta);
            }

            // Prefer server pagination metadata; fall back to a page-size heuristic.
            const limit = pageMeta?.limit ?? params?.limit ?? 20;
            const totalPages =
                pageMeta?.totalPages ??
                (pageMeta?.total != null && limit ? Math.ceil(pageMeta.total / limit) : undefined);

            if (totalPages != null) {
                setHasNextPage(page < totalPages);
            } else {
                setHasNextPage(items.length >= (params?.limit || 20));
            }
        } else if (isSuccess && !items) {
            if (page === 1) {
                setMergedData([]);
            }
            setHasNextPage(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        isFetching,
        pagination,
        data: mergedData,
        isFetchingNextPage: page > 1 && isFetching,
        hasNextPage,
        fetchNextPage,
        refetch: performRefetch,
    };
}

export default useInfiniteData;
