import React, { useMemo } from 'react';
import { AssimilationStage, Guest } from '~/store/types';
import { useGetGuestByIdQuery, useGetTimelineQuery } from '~/store/services/roast-crm';
import { GuestHeader } from './GuestHeader';
import TimelineCard from './TimelineCard';
import { Card, CardContent } from '~/components/ui/card';
import { getStageColor } from '../../utils/colors';
import { getProgressPercentage } from '../../utils/milestones';
import { handleCall, handleWhatsApp } from '../../utils/communication';
import { Skeleton } from '~/components/ui/skeleton';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ViewWrapper from '~/components/layout/viewWrapper';
import useRole from '~/hooks/role';
import useAssimilationStageIndex, {
    useAssimilationSubStagePositionIndex,
} from '../../hooks/use-assimilation-stage-index';

const GuestProfile: React.FC = () => {
    const { user } = useRole();
    const guestParams = useLocalSearchParams() as unknown as Guest;
    const guestId = guestParams?._id;

    const { data: guestRemote, isLoading } = useGetGuestByIdQuery(guestParams?._id, { skip: !!guestParams });
    const { data: timeline = [], isLoading: loadingTimeline } = useGetTimelineQuery({ guestId }, { skip: !guestId });
    const assimilationStagesIndex = useAssimilationStageIndex();
    const guest = guestRemote ?? guestParams;

    const assimilationSubStagePositionIndex = useAssimilationSubStagePositionIndex();

    const progress = useMemo(
        () => getProgressPercentage(assimilationSubStagePositionIndex[guest.assimilationSubStageId] as number),
        [guest.assimilationSubStageId, assimilationSubStagePositionIndex]
    );

    if (!guestId || !guest || isLoading) {
        return (
            <View className="px-4 py-6 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 !h-60">
                            <View className="flex-row items-start gap-4">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <View className="gap-4 flex-1">
                                    <Skeleton className="h-5 rounded w-3/4" />
                                    <Skeleton className="h-3 rounded w-1/2" />
                                    <Skeleton className="h-3 rounded w-1/2" />
                                    <View className="gap-4 flex-1">
                                        <Skeleton className="h-5 rounded w-3/4" />
                                        <Skeleton className="h-3 rounded w-1/2" />
                                        <Skeleton className="h-3 rounded w-1/2" />
                                        <Skeleton className="h-3 rounded w-3/4 " />
                                    </View>
                                </View>
                            </View>
                        </CardContent>
                    </Card>
                ))}
            </View>
        );
    }

    return (
        <ViewWrapper scroll avoidKeyboard className="py-6 px-2">
            <View className="gap-6">
                {/* Guest Info Section */}
                <GuestHeader
                    guest={guest}
                    currentUser={user}
                    onCall={handleCall(guest)}
                    progressPercentage={progress}
                    onWhatsApp={handleWhatsApp(guest)}
                    assimilationStage={assimilationStagesIndex[guest?.assimilationStageId] ?? ''}
                    stageColor={getStageColor(assimilationStagesIndex[guest?.assimilationStageId] as AssimilationStage)}
                />

                {/* Milestones Section */}
                {/* TODO: TBD */}
                {/* <MilestonesCard milestones={guest?.milestones ?? []} onToggle={handleMilestoneToggle} /> */}

                {/* Timeline Section */}
                <TimelineCard
                    guestId={guest?._id}
                    assignedToId={user?._id}
                    timeline={timeline}
                    loading={loadingTimeline}
                />
            </View>
        </ViewWrapper>
    );
};

export default GuestProfile;
