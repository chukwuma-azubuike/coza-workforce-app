import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { ContactChannel, Guest } from '~/store/types';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Text } from '~/components/ui/text';
import { openPhoneAndPersist } from '../utils/communication';
import { getDaysSinceContact, getProgressPercentage } from '../utils/milestones';

import useZoneIndex from '../hooks/use-zone-index';
import { THEME_CONFIG } from '~/config/appConfig';
import { useAssimilationSubStagePositionIndex } from '../hooks/use-assimilation-stage-index';
import { Icon } from '@rneui/base';
import { useAppDispatch } from '~/store/hooks';

interface KanbanCardProps {
    guest: Guest;
}

const KanbanUICard: React.FC<KanbanCardProps> = ({ guest }) => {
    const dispatch = useAppDispatch();

    const zoneIndex = useZoneIndex();
    const assimilationSubStagePositionIndex = useAssimilationSubStagePositionIndex();

    const progress = useMemo(
        () => getProgressPercentage(assimilationSubStagePositionIndex[guest.assimilationSubStageId] as number),
        [guest.assimilationSubStageId, assimilationSubStagePositionIndex]
    );

    const daysSinceContact = useMemo(
        () => getDaysSinceContact(guest?.lastContact ?? (guest?.createdAt as any)),
        [guest?.lastContact, guest?.createdAt]
    );

    return (
        <View className="bg-background rounded-3xl">
            <Card>
                <CardContent className="p-4">
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
                                <Text className="font-bold text-xl">{`${guest.firstName} ${guest.lastName}`}</Text>
                                <View className="flex-row gap-1 items-center flex-1">
                                    <Icon type="feather" name="phone" size={12} color={THEME_CONFIG.blue} />
                                    <Text className="text-xs text-foreground">{guest.phoneNumber}</Text>
                                    {zoneIndex[guest.zoneId] && (
                                        <Icon
                                            type="ionicon"
                                            name="location-outline"
                                            size={12}
                                            color={THEME_CONFIG.blue}
                                        />
                                    )}
                                    {zoneIndex[guest.zoneId] && (
                                        <Text className="text-xs text-foreground w-full">
                                            {zoneIndex[guest.zoneId]}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="gap-3">
                        <View>
                            <View className="flex-row items-center justify-between text-xs mb-1">
                                <Text className="text-foreground flex-1">Progress</Text>
                                <Text className="text-foreground flex-1 text-right">{progress}% complete</Text>
                            </View>

                            <View className="w-full bg-secondary rounded-full h-2">
                                <View
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>
                        </View>

                        {guest.nextAction && (
                            <View className="text-xs bg-yellow-50 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 rounded p-2">
                                <Text className="font-bold flex-1">Next Action: </Text>
                                <Text className="flex-1">{guest.nextAction}</Text>
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
                </CardContent>
            </Card>
        </View>
    );
};

export default memo(KanbanUICard);

KanbanUICard.displayName = 'KanbanUICard';
