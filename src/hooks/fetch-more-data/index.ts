import React from 'react';
import uniqBy from 'lodash/uniqBy';

const useFetchMoreData = ({
    uniqKey,
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
    }, [isSuccess]);

    return { data: data || dataSet };
};

export default useFetchMoreData;
