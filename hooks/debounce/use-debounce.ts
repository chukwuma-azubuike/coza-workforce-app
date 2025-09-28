import { useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';

const useDebounce = (fn: (arg?: any) => void, delay: number = 300) => {
    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                fn(value);
            }, delay),
        [fn]
    );

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return debouncedSearch;
};

export default useDebounce;
