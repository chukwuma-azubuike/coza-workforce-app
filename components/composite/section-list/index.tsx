import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, DefaultSectionT, SectionListData, SectionListRenderItem } from 'react-native';
import { View, SectionList, SectionListProps } from 'react-native';
import Empty from '~/components/atoms/empty';
import { FlatListSkeleton } from '~/components/layout/skeleton';
import { Text } from '~/components/ui/text';
import transformToSections from '~/utils/transformToSections';

interface SectionListComponentProps<D> extends Partial<SectionListProps<D>> {
    field: string;
    column: React.FC<D>;
    hasNextPage?: boolean;
    isLoading?: boolean;
    refetch?: () => void;
    extraProps?: Record<string, any>;
    fetchNextPage?: () => void;
    itemHeight?: number;
    emptyMessage?: string;
    isFetchingNextPage?: boolean;
}

const ITEM_HEIGHT = 80;

function SectionListComponent<D>({
    data,
    field,
    column: Column,
    fetchNextPage,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    extraProps,
    itemHeight,
    emptyMessage = 'No records',
    ...props
}: SectionListComponentProps<D>) {
    const sections = useMemo(() => transformToSections(data, field), [data, field]);

    const renderSectionHeader = useCallback(
        ({ section }: { section: SectionListData<D, DefaultSectionT> }) => (
            <View className="bg-background py-1 shadow-none" style={{ elevation: 0, shadowColor: 'transparent' }}>
                <Text className="text-muted-foreground font-semibold text-lg">{section.title}</Text>
            </View>
        ),
        []
    );

    const renderItem: SectionListRenderItem<D> = useCallback(
        ({ item }) => <Column {...(item as any)} {...extraProps} />,
        [extraProps]
    );

    return (
        <View className="px-2 flex-1">
            {isLoading && sections?.length < 1 ? (
                <FlatListSkeleton />
            ) : sections?.length < 1 ? (
                <Empty width={160} isLoading={isLoading} message={emptyMessage} refresh={refetch} />
            ) : (
                <SectionList
                    {...props}
                    windowSize={15}
                    initialNumToRender={15}
                    maxToRenderPerBatch={15}
                    renderItem={renderItem}
                    sections={sections as any[]}
                    stickySectionHeadersEnabled
                    keyboardShouldPersistTaps="always"
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item, index) => (item as any)?._id || `${index}`}
                    onEndReached={() => {
                        if (hasNextPage && fetchNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    refreshing={isLoading}
                    onRefresh={refetch}
                    ListFooterComponent={
                        isFetchingNextPage ? <ActivityIndicator size="small" style={{ margin: 10 }} /> : null
                    }
                    getItemLayout={(_, index) => ({
                        length: itemHeight || ITEM_HEIGHT,
                        offset: (itemHeight || ITEM_HEIGHT) * index,
                        index,
                    })}
                />
            )}
        </View>
    );
}

export default SectionListComponent;
