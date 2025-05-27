import { Text } from '~/components/ui/text';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, FlatListProps, RefreshControl, TouchableOpacity, View } from 'react-native';
import If from '../if-container';
import Utils from '@utils/index';
import Empty from '../../atoms/empty';
import { FlatListSkeleton } from '../../layout/skeleton';
import dayjs from 'dayjs';
import { THEME_CONFIG } from '@config/appConfig';
import { useNavigation } from '@react-navigation/native';
import useAppColorMode from '@hooks/theme/colorMode';

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
    itemHeight?: number;
    padding?: boolean | number;
    fetchMoreData?: () => void;
    emptySize?: number;
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
        itemHeight = 60,
        showHeader = true,
    } = props;
    const titles = React.useMemo(() => columns.map(column => column.title), [columns]);

    const handleMore = useCallback(() => {
        if (fetchMoreData && !refreshing) {
            fetchMoreData();
        }
    }, [refreshing]);

    const handleItemLayout = useCallback(
        (_: ArrayLike<any> | null | undefined, index: number) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
        }),
        [itemHeight]
    );

    const renderItem1 = useCallback(
        ({ item }: any) => <ListComponent_1 item={item} showHeader={showHeader} columns={columns} />,
        [showHeader, columns]
    );

    const renderItem2 = useCallback(
        ({ item }: any) => <ListComponent_2 item={item} padding={padding} columns={columns} navLink={navLink} />,
        [padding, navLink, columns]
    );

    const listHeaderComponent = useCallback(
        () =>
            titles[0] ? (
                <View style={{ paddingVertical: 6, flex: 1, width: '100%' }}>
                    <View className="justify-between">
                        {titles.map((title, idx) => (
                            <Text key={`title-${idx}`} className="font-bold">
                                {title}
                            </Text>
                        ))}
                    </View>
                </View>
            ) : null,
        [titles]
    );

    return (
        <>
            {data && data[0] ? (
                <>
                    {/* Is an array of arrays */}
                    <If condition={data[0][0]}>
                        <FlatList
                            refreshControl={
                                onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                            }
                            style={{ flex: 1 }}
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
                            keyExtractor={item => item?._id}
                            renderItem={renderItem1}
                            getItemLayout={handleItemLayout}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
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
                    </If>
                    <If condition={!data[0][0]}>
                        <FlatList
                            refreshControl={
                                onRefresh && <RefreshControl onRefresh={onRefresh} refreshing={refreshing as boolean} />
                            }
                            style={{ flex: 1 }}
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
                            keyExtractor={item => item?._id}
                            ListHeaderComponent={listHeaderComponent}
                            renderItem={renderItem2}
                            getItemLayout={handleItemLayout}
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

export default React.memo(FlatListComponent);

const ListComponent_1: React.FC<Partial<IFlatListComponentProps> & { item: any }> = React.memo(
    ({ item, showHeader, columns }) => {
        const { textColor } = useAppColorMode();

        return (
            <View
                style={{
                    borderColor: textColor,
                    padding: 4,
                    flex: 1,
                }}
            >
                {showHeader ? (
                    <Text className="pb-3 text-lg font-semibold text-muted-foreground">
                        {dayjs(item[0]).format() !== 'Invalid Date'
                            ? dayjs(item[0]).format('DD MMMM, YYYY')
                            : Utils.capitalizeFirstChar(item[0])}
                    </Text>
                ) : null}
                <View className="px-1">{columns?.map((column, idx) => column.render(item, idx))}</View>
            </View>
        );
    }
);

const ListComponent_2: React.FC<Partial<IFlatListComponentProps> & { item: any }> = React.memo(
    ({ item, padding, columns, navLink }) => {
        const { navigate } = useNavigation();
        const { textColor } = useAppColorMode();

        const navigateTo = useCallback(() => {
            if (navLink) navigate(navLink as never);
            return;
        }, [navLink]);

        return (
            <TouchableOpacity
                disabled={false}
                delayPressIn={0}
                activeOpacity={0.6}
                accessibilityRole="button"
                onPress={item?.onPress || navigateTo}
            >
                <View
                    style={{
                        borderColor: textColor,
                        flex: 1,
                        paddingVertical: 4,
                        paddingHorizontal: padding ? 6 : 0,
                    }}
                >
                    <View className="items-center justify-between gap-2">
                        {columns?.map((column, idx) => {
                            if (column.render) return column.render(item, idx);
                            return (
                                <Text key={idx} className="text-left flex-1 w-100%">
                                    {item[column.dataIndex as never]}
                                </Text>
                            );
                        })}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
);
