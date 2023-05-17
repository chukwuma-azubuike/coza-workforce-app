import React from 'react';
import { Box, HStack, Text, VStack } from 'native-base';
import If from '../if-container';
import Utils from '../../../utils';
import { ActivityIndicator, FlatList, FlatListProps, RefreshControl, TouchableOpacity } from 'react-native';
import Empty from '../../atoms/empty';
import { FlatListSkeleton } from '../../layout/skeleton';
import moment from 'moment';
import { THEME_CONFIG } from '../../../config/appConfig';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { useNavigation } from '@react-navigation/native';

export interface IFlatListColumn {
    title?: string;
    dataIndex: string;
    render?: (elm: any, key: string | number) => JSX.Element;
}

export interface IFlatListComponentProps extends Partial<FlatListProps<any>> {
    data: any[];
    columns: any[];
    refreshing?: boolean;
    onRefresh?: () => void;
    isLoading?: boolean;
    emptyMessage?: string;
    navLink?: string;
    showHeader?: boolean;
    padding?: boolean | number;
    fetchMoreData?: () => void;
    emptySize?: number | string;
    showEmpty?: boolean;
}

const FlatListComponent: React.FC<IFlatListComponentProps> = props => {
    const {
        data,
        padding,
        columns,
        onRefresh,
        refreshing,
        emptySize,
        navLink,
        isLoading,
        showEmpty = true,
        emptyMessage,
        fetchMoreData,
        showHeader = true,
    } = props;
    const titles = React.useMemo(() => columns.map(column => column.title), [columns]);

    const handleMore = () => {
        if (fetchMoreData && !refreshing) {
            fetchMoreData();
        }
    };

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
                                nestedScrollEnabled
                                onEndReached={handleMore}
                                onEndReachedThreshold={0.1}
                                onScrollEndDrag={handleMore}
                                ListEmptyComponent={
                                    <Empty
                                        width={emptySize}
                                        isLoading={isLoading}
                                        message={emptyMessage}
                                        refresh={onRefresh}
                                    />
                                }
                                keyExtractor={item => item._id}
                                renderItem={({ item }) => (
                                    <ListComponent_1 item={item} showHeader={showHeader} columns={columns} />
                                )}
                                ListFooterComponentStyle={{ paddingBottom: 20 }}
                                ListFooterComponent={
                                    <ActivityIndicator
                                        size="small"
                                        hidesWhenStopped
                                        animating={refreshing}
                                        color={THEME_CONFIG.lightGray}
                                    />
                                }
                                {...props}
                            />
                        </Box>
                    </If>
                    <If condition={!data[0][0]}>
                        <Box flex={1}>
                            <FlatList
                                refreshControl={
                                    onRefresh && (
                                        <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                                    )
                                }
                                nestedScrollEnabled
                                ListEmptyComponent={
                                    <Empty
                                        width={emptySize}
                                        isLoading={isLoading}
                                        message={emptyMessage}
                                        refresh={onRefresh}
                                    />
                                }
                                onEndReached={handleMore}
                                onEndReachedThreshold={0.1}
                                onScrollEndDrag={handleMore}
                                keyExtractor={item => item._id}
                                ListHeaderComponent={() =>
                                    titles[0] ? (
                                        <Box bg="transparent" py={3} flex={1} textAlign="left" w="full">
                                            <HStack justifyContent="space-between" px={padding ? 3 : 0}>
                                                {titles.map((title, idx) => (
                                                    <Text semi-bold key={`title-${idx}`} _dark={{ color: 'gray.200' }}>
                                                        {title}
                                                    </Text>
                                                ))}
                                            </HStack>
                                        </Box>
                                    ) : null
                                }
                                renderItem={({ item }) => (
                                    <ListComponent_2
                                        item={item}
                                        padding={padding}
                                        columns={columns}
                                        navLink={navLink}
                                    />
                                )}
                                ListFooterComponentStyle={{ paddingBottom: 20 }}
                                ListFooterComponent={
                                    <ActivityIndicator
                                        size="small"
                                        hidesWhenStopped
                                        animating={refreshing}
                                        color={THEME_CONFIG.lightGray}
                                    />
                                }
                                {...props}
                            />
                        </Box>
                    </If>
                </>
            ) : isLoading ? (
                <FlatListSkeleton />
            ) : (
                showEmpty && (
                    <Empty width={emptySize} isLoading={isLoading} message={emptyMessage} refresh={onRefresh} />
                )
            )}
        </>
    );
};

export default FlatListComponent;

const ListComponent_1: React.FC<Partial<IFlatListComponentProps> & { item: any }> = React.memo(
    ({ item, showHeader, columns }) => {
        return (
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
                {showHeader ? (
                    <Text pb={3} fontSize="md" borderColor="gray.300" borderBottomWidth={0.2}>
                        {moment(item[0]).format() !== 'Invalid date'
                            ? moment(item[0]).format('Do MMMM, YYYY')
                            : Utils.capitalizeFirstChar(item[0])}
                    </Text>
                ) : null}
                <VStack flex={2} py={1}>
                    {columns?.map((column, idx) => column.render(item, idx))}
                </VStack>
            </Box>
        );
    }
);

const ListComponent_2: React.FC<Partial<IFlatListComponentProps> & { item: any }> = React.memo(
    ({ item, padding, columns, navLink }) => {
        const { isLightMode } = useAppColorMode();
        const { navigate } = useNavigation();

        const navigateTo = () => {
            if (navLink) navigate(navLink as never);
            return;
        };

        return (
            <TouchableOpacity
                disabled={false}
                delayPressIn={0}
                activeOpacity={0.6}
                accessibilityRole="button"
                onPress={item?.onPress || navigateTo}
            >
                <Box
                    borderBottomWidth={0.2}
                    _dark={{
                        borderColor: 'gray.500',
                    }}
                    _light={{
                        borderColor: 'gray.300',
                    }}
                    pl={padding ? ['0', '4'] : 0}
                    pr={padding ? ['0', '5'] : 0}
                    flex={1}
                    py={2}
                >
                    <HStack justifyContent="space-between" px={padding ? 3 : 0} alignItems="center" space={[2, 3]}>
                        {columns?.map((column, idx) => {
                            if (column.render) return column.render(item, idx);
                            return (
                                <Text
                                    color="gray.500"
                                    _dark={{
                                        color: 'gray.200',
                                    }}
                                    textAlign="left"
                                    key={idx}
                                    flex={1}
                                    w="full"
                                >
                                    {item[column.dataIndex as never]}
                                </Text>
                            );
                        })}
                    </HStack>
                </Box>
            </TouchableOpacity>
        );
    }
);
