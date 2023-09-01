import React from 'react';
import { Text } from 'react-native';

interface IListtableProps<C = any, H = any> {
    data?: (C | any)[];
    headerProps?: H;
    Header?: React.FC<H>;
    Column: React.FC<C>;
}

const ListTable: React.FC<IListtableProps> = ({ data, Column, Header, headerProps }) => {
    return (
        <>
            {Header && <Header {...headerProps} />}
            {data?.map((item, index) => {
                return !!Column ? (
                    <Column {...item} />
                ) : (
                    <Text key={index} style={{ height: 60, color: '#fff' }}>
                        {item.title}
                    </Text>
                );
            })}
        </>
    );
};

export default ListTable;
