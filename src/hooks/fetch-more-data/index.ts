import React from 'react';

const useFetchMoreData = ({ dataSet, isSuccess }: { dataSet?: any[]; isSuccess: boolean }) => {
    const [data, setData] = React.useState<any[] | undefined>(dataSet);

    React.useEffect(() => {
        if (isSuccess) {
            setData((prev: any) => {
                if (dataSet && prev) {
                    return [...prev, ...dataSet];
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
