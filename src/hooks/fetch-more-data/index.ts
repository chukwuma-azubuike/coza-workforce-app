import React from 'react';
import uniqBy from 'lodash/uniqBy';
import spreadDependencyArray from '@utils/spreadDependencyArray';

const useFetchMoreData = ({
    uniqKey = '_id',
    dataSet,
    isSuccess,
}: {
    dataSet?: any[];
    isSuccess: boolean;
    uniqKey: string | number;
}) => {
    const [data, setData] = React.useState<any[] | undefined>(dataSet);

    React.useEffect(() => {
        if (isSuccess) {
            setData((prev: any) => {
                if (dataSet && prev) {
                    return uniqBy([...prev, ...dataSet], uniqKey);
                } else if (!prev && dataSet) {
                    return dataSet;
                }
                return prev;
            });
        }
    }, [isSuccess, ...spreadDependencyArray(dataSet)]);

    return { data: (data as any[]) || (dataSet as any[]) };
};

export default useFetchMoreData;
