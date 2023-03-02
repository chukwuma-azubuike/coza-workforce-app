import React from 'react';
import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import If from '../if-container';
import Utils from '../../../utils';
import { RefreshControl } from 'react-native';
import Empty from '../../atoms/empty';
import { FlatListSkeleton } from '../../layout/skeleton';
import moment from 'moment';

export interface IFlatListColumn {
    title?: string;
    dataIndex: string;
    render?: (elm: any, key: string | number) => JSX.Element;
}

export interface IFlatListComponentProps {
    data: any[];
    columns: any[];
    padding?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    isLoading?: boolean;
    emptyMessage?: string;
    emptySize?: number | string;
}

const FlatListComponent = ({
    data,
    padding,
    columns,
    onRefresh,
    refreshing,
    emptySize,
    isLoading,
    emptyMessage,
}: IFlatListComponentProps) => {
    const titles = React.useMemo(() => columns.map(column => column.title), [columns]);

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
                                        <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                                    )
                                }
                                data={data}
                                nestedScrollEnabled
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Box
                                        _dark={{
                                            borderColor: 'muted.50',
                                        }}
                                        _light={{
                                            borderColor: 'gray.300',
                                        }}
                                        flex={1}
                                        p={2}
                                    >
                                        <Text pb={3} fontSize="md" borderColor="gray.300" borderBottomWidth={0.2}>
                                            {moment(item[0]).format() !== 'Invalid date'
                                                ? moment(item[0]).format('Do MMMM, YYYY')
                                                : Utils.capitalizeFirstChar(item[0])}
                                        </Text>
                                        <VStack py={1}>{columns.map((column, idx) => column.render(item, idx))}</VStack>
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
                                        <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                                    )
                                }
                                nestedScrollEnabled
                                keyExtractor={item => item.id}
                                ListHeaderComponent={() =>
                                    titles[0] ? (
                                        <Box bg="transparent" py={3} flex={1} textAlign="left" w="full">
                                            <HStack justifyContent="space-evenly" px={padding ? 3 : 0}>
                                                {titles.map((title, idx) => (
                                                    <Text semi-bold key={`title-${idx}`}>
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
                                            borderColor: 'gray.500',
                                        }}
                                        _light={{
                                            borderColor: 'gray.300',
                                        }}
                                        pl={['0', '4']}
                                        pr={['0', '5']}
                                        flex={1}
                                        py={2}
                                    >
                                        <HStack
                                            justifyContent="space-between"
                                            px={padding ? 3 : 0}
                                            alignItems="center"
                                            space={[2, 3]}
                                        >
                                            {columns.map((column, idx) => {
                                                if (column.render) return column.render(item, idx);
                                                return (
                                                    <Text
                                                        color="gray.500"
                                                        _dark={{
                                                            color: 'gray.200',
                                                        }}
                                                        key={idx}
                                                        flex={1}
                                                        textAlign="left"
                                                        w="full"
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
                    </If>
                </>
            ) : isLoading ? (
                <FlatListSkeleton />
            ) : (
                <Empty width={emptySize} isLoading={isLoading} message={emptyMessage} refresh={onRefresh} />
            )}
        </>
    );
};

export default FlatListComponent;
