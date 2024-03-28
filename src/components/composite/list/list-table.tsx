import Loading from '@components/atoms/loading';
import React from 'react';
import { Text } from 'react-native';

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
                <Loading mt={8} h={10} w="full" />
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
