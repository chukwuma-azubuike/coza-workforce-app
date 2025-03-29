import React from 'react';
import { ActivityIndicator, FlatList, FlatListProps, RefreshControl, TouchableOpacity, View } from 'react-native';
import If from '../if-container';
import Utils from '@utils/index';
import Empty from '../../atoms/empty';
import { FlatListSkeleton } from '../../layout/skeleton';
import moment from 'moment';
import { THEME_CONFIG } from '@config/appConfig';
import { useNavigation } from '@react-navigation/native';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import useAppColorMode from '@hooks/theme/colorMode';
import VStackComponent from '@components/layout/v-stack';

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
                            renderItem={({ item }) => (
                                <ListComponent_1 item={item} showHeader={showHeader} columns={columns} />
                            )}
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
                            ListHeaderComponent={() =>
                                titles[0] ? (
                                    <View style={{ paddingVertical: 6, flex: 1, width: '100%' }}>
                                        <HStackComponent
                                            style={{
                                                justifyContent: 'space-between',
                                                paddingHorizontal: padding ? 3 : 0,
                                            }}
                                        >
                                            {titles.map((title, idx) => (
                                                <TextComponent bold key={`title-${idx}`}>
                                                    {title}
                                                </TextComponent>
                                            ))}
                                        </HStackComponent>
                                    </View>
                                ) : null
                            }
                            renderItem={({ item }) => (
                                <ListComponent_2 item={item} padding={padding} columns={columns} navLink={navLink} />
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
                    <TextComponent pb={3} fontSize="md" style={{ borderColor: textColor }}>
                        {moment(item[0]).format() !== 'Invalid date'
                            ? moment(item[0]).format('Do MMMM, YYYY')
                            : Utils.capitalizeFirstChar(item[0])}
                    </TextComponent>
                ) : null}
                <VStackComponent style={{ paddingHorizontal: 1 }}>
                    {columns?.map((column, idx) => column.render(item, idx))}
                </VStackComponent>
            </View>
        );
    }
);

const ListComponent_2: React.FC<Partial<IFlatListComponentProps> & { item: any }> = React.memo(
    ({ item, padding, columns, navLink }) => {
        const { navigate } = useNavigation();
        const { textColor } = useAppColorMode();

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
                <View
                    style={{
                        borderColor: textColor,
                        flex: 1,
                        paddingVertical: 4,
                        paddingHorizontal: padding ? 6 : 0,
                    }}
                >
                    <HStackComponent style={{ alignItems: 'center', justifyContent: 'space-between' }} space={6}>
                        {columns?.map((column, idx) => {
                            if (column.render) return column.render(item, idx);
                            return (
                                <TextComponent key={idx} style={{ textAlign: 'left', flex: 1, width: '100%' }}>
                                    {item[column.dataIndex as never]}
                                </TextComponent>
                            );
                        })}
                    </HStackComponent>
                </View>
            </TouchableOpacity>
        );
    }
);
