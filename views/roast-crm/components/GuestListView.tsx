import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import Empty from '~/components/atoms/empty';
import { FlatListSkeleton } from '~/components/layout/skeleton';
import PickerSelect from '~/components/ui/picker-select';
import { Text } from '~/components/ui/text';
import { ContactChannel, Guest, PipelineSubStage } from '~/store/types';
import { openPhoneAndPersist } from '../utils/communication';
import { getDaysSinceContact, getProgressPercentage } from '../utils/milestones';
import useZoneIndex from '../hooks/use-zone-index';
import { useAssimilationSubStagePositionIndex } from '../hooks/use-assimilation-stage-index';
import { THEME_CONFIG } from '~/config/appConfig';
import { Icon } from '@rneui/base';
import { useAppDispatch } from '~/store/hooks';
import type { IAppDispatch } from '~/store';

type ZoneIndex = Record<string, string>;
type SubStagePositionIndex = Record<string, number>;

const GuestRowComponent: React.FC<{
    guest: Guest;
    type?: 'own' | 'zone';
    zoneIndex: ZoneIndex;
    dispatch: IAppDispatch;
    subStagePositionIndex: SubStagePositionIndex;
    onGuestUpdate: (guestId: string, assimilationStageId: string) => Promise<void>;
    onViewGuest: (guest: Guest) => void;
    assimilationSubStages: Array<PipelineSubStage>;
}> = ({
    guest,
    onViewGuest,
    type = 'own',
    assimilationSubStages,
    onGuestUpdate,
    zoneIndex,
    subStagePositionIndex,
    dispatch,
}) => {
        const isOwn = type === 'own';

        const handleGuestMove = useCallback(
            (newStageId: string) => {
                onGuestUpdate(guest._id, newStageId);
            },
            [guest._id, onGuestUpdate]
        );

        const handleViewGuest = useCallback(() => {
            onViewGuest(guest);
        }, [guest, onViewGuest]);

        const progress = useMemo(
            () => getProgressPercentage(subStagePositionIndex[guest.assimilationSubStageId] as number),
            [guest.assimilationSubStageId, subStagePositionIndex]
        );

        const daysSinceContact = useMemo(
            () => getDaysSinceContact((guest?.lastContact as any) ?? guest.createdAt),
            [guest?.lastContact, guest?.createdAt]
        );

        return (
            <View className="py-4 w-full border-t border-t-border">
                <Pressable onPress={handleViewGuest}>
                    <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center gap-2 flex-1">
                            <Avatar alt="profile-avatar" className="w-12 h-12">
                                <AvatarFallback className="text-xs">
                                    <Text className="w-full text-center">
                                        {`${guest.firstName} ${guest.lastName}`
                                            .split(' ')
                                            .map(n => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </Text>
                                </AvatarFallback>
                            </Avatar>
                            <View>
                                <Text className="font-bold text-xl">
                                    {guest.firstName} {guest.lastName}
                                </Text>
                                {zoneIndex[guest.zoneId] && (
                                    <View className="flex-row gap-1 items-center">
                                        <Icon type="ionicon" name="location-outline" size={12} color={THEME_CONFIG.blue} />
                                        <Text className="text-xs text-foreground w-full">{zoneIndex[guest.zoneId]}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <PickerSelect
                            valueKey="_id"
                            labelKey="name"
                            className="!w-36 !h-10"
                            placeholder="Select stage"
                            items={assimilationSubStages}
                            value={guest?.assimilationSubStageId}
                            onValueChange={handleGuestMove}
                        />

                        {!isOwn && (
                            <View className="absolute -bottom-4 right-4 flex-row items-center gap-2 text-foreground flex-1 justify-center">
                                <Icon type="feather" size={12} name="clock" color={THEME_CONFIG.blue} />
                                <Text className="text-sm">
                                    {daysSinceContact === null
                                        ? 'No contact'
                                        : daysSinceContact === 0
                                            ? 'Today'
                                            : daysSinceContact === 1
                                                ? 'Yesterday'
                                                : `${daysSinceContact} days ago`}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="gap-3">
                        {isOwn && (
                            <View className="flex-row items-center justify-between text-xs w-full">
                                <Text className="text-foreground flex-1">Progress</Text>
                                <Text className="text-foreground flex-1 text-right">{progress}% complete</Text>
                            </View>
                        )}

                        {isOwn && (
                            <View className="w-full bg-secondary rounded-full h-2">
                                <View
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>
                        )}
                        {guest.nextAction && isOwn && (
                            <View className="text-xs bg-yellow-50 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 rounded p-2">
                                <Text className="font-bold">Next Action: </Text>
                                <Text className="line-clamp-none">{guest.nextAction}</Text>
                            </View>
                        )}

                        {isOwn && (
                            <View className="flex-row items-center justify-between text-xs">
                                <View className="flex-row items-center gap-2 text-foreground flex-1">
                                    <Icon type="feather" name="clock" color={THEME_CONFIG.blue} />
                                    <Text className="flex-1">
                                        {daysSinceContact === null
                                            ? 'No contact'
                                            : daysSinceContact === 0
                                                ? 'Today'
                                                : daysSinceContact === 1
                                                    ? 'Yesterday'
                                                    : `${daysSinceContact} days ago`}
                                    </Text>
                                </View>

                                <View className="flex-row gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2"
                                        onPress={openPhoneAndPersist(guest, ContactChannel.CALL, dispatch)}
                                    >
                                        <Icon type="feather" name="phone" color={THEME_CONFIG.blue} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2"
                                        onPress={openPhoneAndPersist(guest, ContactChannel.WHATSAPP, dispatch)}
                                    >
                                        <Icon type="ionicon" name="logo-whatsapp" color={THEME_CONFIG.success} />
                                    </Button>
                                </View>
                            </View>
                        )}
                    </View>
                </Pressable>
            </View>
        );
    };

export const GuestRow = React.memo(GuestRowComponent);

const GuestListView: React.FC<{
    isLoading?: boolean;
    refetch: () => void;
    type?: 'own' | 'zone';
    total?: number;
    displayGuests: Guest[];
    containerHeight?: number;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    handleViewGuest: (Guest: Guest) => void;
    assimilationSubStages: Array<PipelineSubStage>;
    onGuestUpdate: (guestId: string, assimilationStageId: string) => Promise<void>;
}> = ({
    type,
    handleViewGuest,
    refetch,
    isLoading,
    total,
    displayGuests,
    onGuestUpdate,
    assimilationSubStages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}) => {
        const dispatch = useAppDispatch();
        // Hoisted out of the row so the underlying queries are subscribed once for the
        // whole list rather than once per rendered row.
        const zoneIndex = useZoneIndex() as ZoneIndex;
        const subStagePositionIndex = useAssimilationSubStagePositionIndex() as SubStagePositionIndex;

        const renderItem = useCallback(
            ({ item }: { item: Guest }) => (
                <GuestRow
                    type={type}
                    guest={item}
                    dispatch={dispatch}
                    zoneIndex={zoneIndex}
                    onGuestUpdate={onGuestUpdate}
                    onViewGuest={handleViewGuest}
                    subStagePositionIndex={subStagePositionIndex}
                    assimilationSubStages={assimilationSubStages}
                />
            ),
            [type, dispatch, zoneIndex, subStagePositionIndex, assimilationSubStages, onGuestUpdate, handleViewGuest]
        );

        const keyExtractor = useCallback((item: Guest) => item._id, []);

        const handleEndReached = useCallback(() => {
            if (hasNextPage) {
                fetchNextPage?.();
            }
        }, [hasNextPage, fetchNextPage]);

        const listFooter = useMemo(
            () =>
                isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={THEME_CONFIG.lightGray} style={{ marginVertical: 16 }} />
                ) : null,
            [isFetchingNextPage]
        );

        return (
            <View className="px-2 flex-1">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold">Guests</Text>
                    <Badge variant="outline">
                        <Text className="text-base">{total ?? 0} {total && total === 1 ? "guest" : 'guests'}</Text>
                    </Badge>
                </View>

                {isLoading && (displayGuests?.length ?? 0) < 1 ? (
                    <FlatListSkeleton />
                ) : (
                    <FlashList
                        data={displayGuests}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.3}
                        removeClippedSubviews
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={listFooter}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        refreshControl={<RefreshControl refreshing={!!isLoading} onRefresh={refetch} />}
                        ListEmptyComponent={
                            <Empty width={320} isLoading={isLoading} message="No guests yet" refresh={refetch} />
                        }
                    />
                )}
            </View>
        );
    };

export default GuestListView;
