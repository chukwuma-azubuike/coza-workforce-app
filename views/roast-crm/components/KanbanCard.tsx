import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { Guest } from '~/store/types';

import { Phone, MessageCircle, Clock, MapPin, PhoneIcon } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Text } from '~/components/ui/text';
import { handleCall, handleWhatsApp } from '../utils/communication';
import { getDaysSinceContact, getProgressPercentage } from '../utils/milestones';

import useZoneIndex from '../hooks/use-zone-index';
import { THEME_CONFIG } from '~/config/appConfig';
import { useAssimilationSubStagePositionIndex } from '../hooks/use-assimilation-stage-index';

interface KanbanCardProps {
    guest: Guest;
}

const KanbanUICard: React.FC<KanbanCardProps> = ({ guest }) => {
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
                                    <Text>
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
                                <View className="flex-row gap-1 items-center">
                                    <PhoneIcon size={12} />
                                    <Text className="text-xs text-foreground">{guest.phoneNumber}</Text>
                                    {zoneIndex[guest.zoneId] && <MapPin size={12} />}
                                    {zoneIndex[guest.zoneId] && (
                                        <Text className="text-xs text-foreground">{zoneIndex[guest.zoneId]}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="gap-3">
                        <View>
                            <View className="flex-row items-center justify-between text-xs mb-1">
                                <Text className="text-foreground">Progress</Text>
                                <Text className="text-foreground">{progress}% complete</Text>
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
                                <Text className="font-bold">Next Action: </Text>
                                <Text>{guest.nextAction}</Text>
                            </View>
                        )}

                        <View className="flex-row items-center justify-between text-xs">
                            <View className="flex-row items-center gap-2 text-foreground">
                                <Clock className="w-3 h-3" />
                                <Text>
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
                                <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleCall(guest)}>
                                    <Phone className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2"
                                    onPress={handleWhatsApp(guest)}
                                >
                                    <MessageCircle className="w-3 h-3" color={THEME_CONFIG.success} />
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
