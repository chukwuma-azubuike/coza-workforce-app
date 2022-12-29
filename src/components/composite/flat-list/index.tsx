import React from 'react';
import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import If from '../if-container';
import Utils from '../../../utils';
import { RefreshControl } from 'react-native';
import Empty from '../../atoms/empty';

export interface IFlatListColumn {
    title?: string;
    dataIndex: string;
    render?: (elm: any, key: string | number) => JSX.Element;
}

export interface IFlatListComponentProps {
    data: any[];
    columns: any[];
    refreshing?: boolean;
    onRefresh?: () => void;
}

const FlatListComponent = ({
    data,
    columns,
    onRefresh,
    refreshing,
}: IFlatListComponentProps) => {
    const titles = React.useMemo(
        () => columns.map(column => column.title),
        [columns]
    );

    return (
        <>
            {data && data[0] ? (
                <>
                    {/* Is an array of arrays */}
                    <If condition={data[0][0]}>
                        <Box flex={1}>
                            <FlatList
                                refreshControl={
                                    onRefresh && (
                                        <RefreshControl
                                            onRefresh={onRefresh}
                                            refreshing={refreshing as boolean}
                                        />
                                    )
                                }
                                data={data}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Box
                                        _dark={{
                                            borderColor: 'muted.50',
                                        }}
                                        flex={1}
                                        p={3}
                                    >
                                        <Text
                                            fontSize="md"
                                            borderColor="gray.300"
                                            borderBottomWidth={0.2}
                                        >
                                            {Utils.capitalizeFirstChar(item[0])}
                                        </Text>
                                        <VStack py={3}>
                                            {columns.map((column, idx) =>
                                                column.render(item, idx)
                                            )}
                                        </VStack>
                                    </Box>
                                )}
                            />
                        </Box>
                    </If>
                    <If condition={!data[0][0]}>
                        <Box flex={1}>
                            <FlatList
                                data={data}
                                refreshControl={
                                    onRefresh && (
                                        <RefreshControl
                                            onRefresh={onRefresh}
                                            refreshing={refreshing as boolean}
                                        />
                                    )
                                }
                                keyExtractor={item => item.id}
                                ListHeaderComponent={() =>
                                    titles[0] ? (
                                        <Box
                                            bg="gray.50"
                                            py={3}
                                            flex={1}
                                            textAlign="left"
                                            w="full"
                                        >
                                            <HStack justifyContent="space-evenly">
                                                {titles.map((title, idx) => (
                                                    <Text
                                                        semi-bold
                                                        key={`title-${idx}`}
                                                    >
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
                                        flex={1}
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
                                                    return column.render(
                                                        item,
                                                        idx
                                                    );
                                                return (
                                                    <Text
                                                        color="gray.500"
                                                        _dark={{
                                                            color: 'warmGray.200',
                                                        }}
                                                        key={idx}
                                                        flex={1}
                                                        textAlign="left"
                                                        w="full"
                                                    >
                                                        {
                                                            item[
                                                                column.dataIndex as never
                                                            ]
                                                        }
                                                    </Text>
                                                );
                                            })}
                                        </HStack>
                                    </Box>
                                )}
                            />
                        </Box>
                    </If>
                </>
            ) : (
                <Empty />
            )}
        </>
    );
};

export default FlatListComponent;
