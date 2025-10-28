import { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import FlatListComponent from '~/components/composite/flat-list';
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

export const GuestRow: React.FC<{
    guest: Guest;
    index: number;
    onGuestUpdate: (guestId: string, assimilationStageId: string) => Promise<void>;
    onViewGuest: (guest: Guest) => void;
    assimilationSubStages: Array<PipelineSubStage>;
}> = ({ guest, onViewGuest, assimilationSubStages, onGuestUpdate }) => {
    const dispatch = useAppDispatch();

    const zoneIndex = useZoneIndex();
    const handleGuestMove = async (newStageId: string) => {
        onGuestUpdate(guest._id, newStageId);
    };

    const handleViewGuest = () => {
        onViewGuest(guest);
    };

    const assimilationSubStagePositionIndex = useAssimilationSubStagePositionIndex();

    const progress = useMemo(
        () => getProgressPercentage(assimilationSubStagePositionIndex[guest.assimilationSubStageId] as number),
        [guest.assimilationSubStageId, assimilationSubStagePositionIndex]
    );

    const daysSinceContact = useMemo(
        () => getDaysSinceContact((guest?.lastContact as any) ?? guest.createdAt),
        [guest?.lastContact, guest?.createdAt, getDaysSinceContact]
    );

    return (
        <View className="py-4 w-full border-t border-t-border">
            <Pressable onPress={handleViewGuest}>
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-row items-center gap-2">
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
                            <View className="flex-row gap-1 items-center">
                                <Icon type="ionicon" name="location-outline" size={12} color={THEME_CONFIG.blue} />
                                <Text className="text-xs text-foreground w-full">{zoneIndex[guest.zoneId]}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-1 items-center">
                        <PickerSelect
                            valueKey="_id"
                            labelKey="name"
                            className="!w-36 !h-10"
                            placeholder="Select stage"
                            items={assimilationSubStages}
                            value={guest?.assimilationSubStageId}
                            onValueChange={handleGuestMove}
                        />
                    </View>
                </View>

                <View className="gap-3">
                    <View className="flex-row items-center justify-between text-xs w-full">
                        <Text className="text-foreground flex-1">Progress</Text>
                        <Text className="text-foreground flex-1 text-right">{progress}% complete</Text>
                    </View>

                    <View className="w-full bg-secondary rounded-full h-2">
                        <View
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    {guest.nextAction && (
                        <View className="text-xs bg-yellow-50 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 rounded p-2">
                            <Text className="font-bold">Next Action: </Text>
                            <Text className="line-clamp-none">{guest.nextAction}</Text>
                        </View>
                    )}

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
                </View>
            </Pressable>
        </View>
    );
};

const GuestListView: React.FC<{
    isLoading?: boolean;
    refetch: () => void;
    displayGuests: Guest[];
    containerHeight: number;
    handleViewGuest: (Guest: Guest) => void;
    assimilationSubStages: Array<PipelineSubStage>;
    onGuestUpdate: (guestId: string, assimilationStageId: string) => Promise<void>;
}> = ({
    handleViewGuest,
    refetch,
    isLoading,
    containerHeight,
    displayGuests,
    onGuestUpdate,
    assimilationSubStages,
}) => {
    const renderItemComponent = useCallback(
        ({ item }: { item: any; index: number }) => (
            <GuestRow
                onGuestUpdate={onGuestUpdate}
                assimilationSubStages={assimilationSubStages}
                onViewGuest={handleViewGuest}
                guest={item}
                index={0}
            />
        ),
        [GuestRow, handleViewGuest]
    );

    return (
        <View className="px-2 flex-1">
            <View className="flex-row items-center justify-between">
                <Text className="font-semibold">My Guests</Text>
                <Badge variant="outline">
                    <Text className="text-base">{displayGuests?.length} guests</Text>
                </Badge>
            </View>

            <FlatListComponent
                itemHeight={231.7}
                onRefresh={refetch}
                data={displayGuests}
                isLoading={isLoading}
                refreshing={isLoading}
                style={{ height: containerHeight }}
                renderItemComponent={renderItemComponent}
                ListFooterComponentStyle={{ marginBottom: 0 }}
            />
        </View>
    );
};

export default GuestListView;
