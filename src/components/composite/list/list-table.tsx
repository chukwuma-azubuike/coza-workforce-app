import React from 'react';
import { Text } from 'react-native';
import Loading from '@components/atoms/loading';

interface IListtableProps<C = any, H = any> {
    data?: (C | any)[];
    headerProps?: H;
    isLoading?: boolean;
    Header?: React.FC<H>;
    Column: React.FC<C>;
}

const ListTable: React.FC<IListtableProps> = ({ data, Column, Header, headerProps, isLoading }) => {
    return (
        <>
            {Header && <Header {...headerProps} />}
            {isLoading ? (
                <Loading style={{ marginTop: 8, height: 20 }} />
            ) : (
                data?.map((item, index) => {
                    return !!Column ? (
                        <Column {...item} />
                    ) : (
                        <Text key={index} style={{ height: 60, color: '#fff' }}>
                            {item.title}
                        </Text>
                    );
                })
            )}
        </>
    );
};

export default React.memo(ListTable);
