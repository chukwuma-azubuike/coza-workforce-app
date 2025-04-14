import { useEffect, useState } from 'react';
import uniqBy from 'lodash/uniqBy';

interface UseFetchMoreDataProps<T> {
    uniqKey?: keyof T;
    dataSet?: T[];
    isSuccess: boolean;
}

const useFetchMoreData = <T>({ uniqKey = '_id' as keyof T, dataSet = [], isSuccess }: UseFetchMoreDataProps<T>) => {
    const [data, setData] = useState<T[]>([]);

    useEffect(() => {
        if (isSuccess && dataSet.length > 0) {
            setData(prevData => {
                if (!prevData.length) return dataSet;
                return uniqBy([...prevData, ...dataSet], item => item[uniqKey]);
            });
        }
    }, [dataSet, isSuccess, uniqKey]);

    return { data };
};

export default useFetchMoreData;
