import React, { useCallback, useEffect, useRef, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, Dimensions, FlatList, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';
import { useColumnPagination } from './hooks/useColumnPagination';
import { useDragGesture } from './hooks/useDragGesture';
import { columnDataType, ItemType, KanbanBoardProps } from './types';
import { DataCard } from './components/DataCard';
import { DragContextValue } from './utils/DraggedCardContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EmptyState } from '../ui/empty-state';
import Empty from '../atoms/empty';

const ReactNativeKanbanBoard = <T extends ItemType, K>(props: KanbanBoardProps<T, K>) => {
    const [toColumnIndex, setToColumnIndex] = useState(0);
    const SCREEN_WIDTH = Dimensions.get('screen').width;
    const MAX_WIDTH = 640; // Define your max width for large screens
    const responsiveWidth = SCREEN_WIDTH > MAX_WIDTH ? MAX_WIDTH : SCREEN_WIDTH;
    const columnContainerWidth = props.columnWidth ?? SCREEN_WIDTH * 0.8;
    const scrollTriggerWidth = SCREEN_WIDTH * 0.3;
    const edgeColumnOff = columnContainerWidth * 1.5 - SCREEN_WIDTH * 0.5;
    const marginAlign = (responsiveWidth - columnContainerWidth) / 2;
    const centeredColumnPositionLeft = SCREEN_WIDTH - columnContainerWidth - marginAlign;

    const constants = {
        columnContainerWidth,
        scrollTriggerWidth,
        edgeColumnOff,
        marginAlign,
    };

    const columnPadding = props.gapBetweenColumns ?? 12;
    const columnsHorizontalScrollRef = useAnimatedRef<Animated.FlatList<K>>();
    const itemsVerticalScrollEnabledRef = useRef(false);

    const disableScroll = useCallback(() => {
        itemsVerticalScrollEnabledRef.current = false;
        columnsHorizontalScrollRef.current?.setNativeProps({
            scrollEnabled: false,
        });
    }, [columnsHorizontalScrollRef, itemsVerticalScrollEnabledRef]);

    function enableScrollers() {
        columnsHorizontalScrollRef.current?.setNativeProps({ scrollEnabled: true });
        itemsVerticalScrollEnabledRef.current = true;
    }

    const { paginate, updateCurrentColumnIndex } = useColumnPagination({
        columnsHorizontalScrollRef,
        constants,
    });
    const { pan, dragItem, dragX, dragY, setDragCard } = useDragGesture({
        paginate,
        toColumnIndex,
        onDrop: enableScrollers,
        onDragEndSuccess: props.onDragEnd,
    });

    useEffect(() => {
        setTimeout(() => {
            paginate('center');
        }, 200);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.columnWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            top: dragItem?.y,
            left: dragItem?.columnIndex === 0 ? 0 : centeredColumnPositionLeft,
            width: dragItem?.width,
            opacity: dragItem?.id ? 1 : 0,
            transform: [
                { translateY: dragY.value },
                { translateX: dragX.value },
                {
                    rotate: '8deg',
                    // TODO: Another rotating animation, but I prefer the basic
                    // rotate:
                    //     interpolate(dragX.value, [-scrollTriggerWidth, 0, scrollTriggerWidth], [12, 0, 12], 'extend') +
                    //     'deg',
                },
                // TODO; I don't really like the look of the scaling
                // {
                //     scale: interpolate(
                //         dragX.value,
                //         [-scrollTriggerWidth, 0, scrollTriggerWidth],
                //         [1.12, 1, 1.12],
                //         'extend'
                //     ),
                // },
            ],
        };
    }, [dragItem]);

    const handleItemLayout = useCallback(
        (_: ArrayLike<any> | null | undefined, index: number) => ({
            length: props?.itemHeight ?? 20,
            offset: (props?.itemHeight ?? 20) * index,
            index,
        }),
        [props?.itemHeight]
    );

    const renderColumn = ({ item: columnData, index: i }: { item: columnDataType<T, K>; index: number }) => {
        const isPotentiallyBeingMoveTo =
            dragItem?.columnIndex !== undefined && i !== dragItem.columnIndex && toColumnIndex === i;
        const isItemInFocusedColumn = i === toColumnIndex;

        const renderCard = ({ item }: { item: T }) => {
            const isBeingDragged = dragItem?.id === item.id;

            return (
                <DataCard
                    onPress={props.onPressCard}
                    disableScroll={disableScroll}
                    setDragCard={setDragCard}
                    renderItem={props.renderItem}
                    isDraggable={!dragItem && isItemInFocusedColumn}
                    itemColumnIndex={i}
                    item={item}
                    isBeingDragged={isBeingDragged}
                />
            );
        };

        return (
            <View
                key={i}
                style={[
                    props.columnContainerStyle,
                    {
                        flex: 1,
                        marginHorizontal: columnPadding,
                        width: columnContainerWidth - columnPadding * 2,
                    },
                    isPotentiallyBeingMoveTo ? props.columnContainerStyleOnDrag : {},
                ]}
            >
                {props.renderHeader && (
                    <View style={props.columnHeaderStyle}>
                        {props.renderHeader(columnData.header)}
                        <Text>{columnData.items.length}</Text>
                    </View>
                )}
                {props.renderColumnContainer ? (
                    props.renderColumnContainer(
                        <FlatList
                            className="flex-1"
                            data={columnData.items}
                            renderItem={renderCard}
                            extraData={isItemInFocusedColumn}
                            initialNumToRender={i === 0 ? 8 : 3}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(_, index) => `${i}-${index}`}
                            scrollEnabled={itemsVerticalScrollEnabledRef.current}
                            getItemLayout={props.itemHeight ? handleItemLayout : undefined}
                            ListEmptyComponent={<Empty width={160} message="No guests in this stage" />}
                        />,
                        columnData.header
                    )
                ) : (
                    <FlatList
                        style={{ flex: 1 }}
                        data={columnData.items}
                        renderItem={renderCard}
                        extraData={isItemInFocusedColumn}
                        initialNumToRender={i === 0 ? 8 : 3}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(_, index) => `${i}-${index}`}
                        scrollEnabled={itemsVerticalScrollEnabledRef.current}
                        getItemLayout={props.itemHeight ? handleItemLayout : undefined}
                        ListEmptyComponent={<Empty width={160} message="No guests in this stage" />}
                    />
                )}
            </View>
        );
    };

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const columnIndex =
            event.nativeEvent.contentOffset.x === 0
                ? 0
                : Math.round((event.nativeEvent.contentOffset.x + marginAlign) / columnContainerWidth);
        updateCurrentColumnIndex(columnIndex);
        setToColumnIndex(columnIndex);
    };

    return (
        <DragContextValue.Provider
            value={{
                setDragCard,
                dragCardY: dragItem?.id ? dragY : undefined,
                dragCardX: dragItem?.id ? dragX : undefined,
                dragCard: dragItem?.props,
            }}
        >
            <GestureHandlerRootView className="flex-1" style={{ paddingBottom: 0 }}>
                <GestureDetector gesture={pan}>
                    <View className="flex-1 pb-2">
                        <Animated.FlatList
                            ref={columnsHorizontalScrollRef}
                            horizontal
                            pagingEnabled
                            className="flex-1"
                            snapToInterval={columnContainerWidth}
                            snapToAlignment={'center'}
                            decelerationRate={'fast'}
                            onMomentumScrollEnd={onMomentumScrollEnd}
                            data={props.columnData}
                            renderItem={renderColumn}
                            contentContainerStyle={props.contentContainerStyle}
                            style={props.containerStyle}
                        />

                        {dragItem?.props && (
                            <Animated.View style={animatedStyle}>
                                {props.renderItem(dragItem.props as T, true)}
                            </Animated.View>
                        )}
                    </View>
                </GestureDetector>
            </GestureHandlerRootView>
        </DragContextValue.Provider>
    );
};

export default ReactNativeKanbanBoard;
