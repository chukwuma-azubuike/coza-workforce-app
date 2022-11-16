import React from 'react';
import { Box, FlatList, HStack, Text } from 'native-base';

export interface IFlatListColumn {
    title?: string;
    dataIndex: string;
    render?: (elm: any, key: string | number) => JSX.Element;
}

export interface IFlatListComponentProps {
    columns: any[];
    data: any[];
}

const FlatListComponent = ({ columns, data }: IFlatListComponentProps) => {
    const titles = React.useMemo(
        () => columns.map(column => column.title),
        [columns]
    );

    return (
        <Box>
            <FlatList
                data={data}
                keyExtractor={item => item.id}
                ListHeaderComponent={() =>
                    titles.length > 0 ? (
                        <Box bg="gray.50" py={3}>
                            <HStack justifyContent="space-evenly">
                                {titles.map((title, idx) => (
                                    <Text semi-bold key={idx}>
                                        {title}
                                    </Text>
                                ))}
                            </HStack>
                        </Box>
                    ) : null
                }
                renderItem={({ item }) => (
                    <Box
                        borderBottomWidth={0.2}
                        _dark={{
                            borderColor: 'muted.50',
                        }}
                        borderColor="gray.300"
                        pl={['0', '4']}
                        pr={['0', '5']}
                        py={3}
                    >
                        <HStack
                            justifyContent="space-between"
                            alignItems="center"
                            space={[2, 3]}
                            px={3}
                        >
                            {columns.map((column, idx) => {
                                if (column.render)
                                    return column.render(item, idx);
                                return (
                                    <Text
                                        color="gray.500"
                                        _dark={{
                                            color: 'warmGray.200',
                                        }}
                                    >
                                        {item[column.dataIndex as never]}
                                    </Text>
                                );
                            })}
                        </HStack>
                    </Box>
                )}
            />
        </Box>
    );
};

export default FlatListComponent;
