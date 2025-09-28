import React, { useCallback } from 'react';
import { AssimilationStage, Guest, MilestoneStatus } from '~/store/types';
import { useGetGuestByIdQuery, useUpdateGuestMutation, useGetTimelineQuery } from '~/store/services/roast-crm';
import { GuestHeader } from './GuestHeader';
import MilestonesCard from './MilestonesCard';
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
import useAssimilationStageIndex from '../../hooks/use-assimilation-stage-index';

interface GuestProfileProps {}

const GuestProfile: React.FC<GuestProfileProps> = () => {
    const { user } = useRole();
    const guestParams = useLocalSearchParams() as unknown as Guest;
    const guestId = guestParams?._id;

    const { data: guestRemote, isLoading } = useGetGuestByIdQuery(guestParams?._id, { skip: !!guestParams });
    const { data: timeline = [], isLoading: loadingTimeline } = useGetTimelineQuery({ guestId }, { skip: !guestId });
    const [updateGuest] = useUpdateGuestMutation();
    const assimilationStagesIndex = useAssimilationStageIndex();

    const guest = guestRemote ?? guestParams;

    const handleMilestoneToggle = useCallback(
        async (milestoneId: string) => {
            if (!guest) return;

            try {
                const updatedMilestones = guest?.milestones?.map(m =>
                    m._id === milestoneId
                        ? {
                              ...m,
                              status:
                                  m.status === MilestoneStatus.COMPLETED
                                      ? MilestoneStatus.PENDING
                                      : MilestoneStatus.COMPLETED,
                              completedAt:
                                  m.status === MilestoneStatus.COMPLETED ? undefined : new Date().toISOString(),
                          }
                        : m
                );

                await updateGuest({
                    _id: guest._id,
                    milestones: updatedMilestones,
                    lastContact: new Date().toISOString(),
                });
                // toast.success('Milestone updated');
            } catch (error) {
                // toast.error('Failed to update milestone');
            }
        },
        [guest]
    );

    const handleAddNote = async () => {
        if (!guest) return;

        try {
            // toast.success('Note added');
        } catch (error) {
            // toast.error('Failed to add note');
            throw error; // Re-throw to handle in the component
        }
    };

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
                    onCall={handleCall(guest)}
                    onWhatsApp={handleWhatsApp(guest)}
                    progressPercentage={getProgressPercentage(guest.milestones)}
                    assimilationStage={assimilationStagesIndex[guest?.assimilationSubStageId] ?? ''}
                    stageColor={getStageColor(
                        assimilationStagesIndex[guest?.assimilationSubStageId] as AssimilationStage
                    )}
                />

                {/* Milestones Section */}
                <MilestonesCard milestones={guest?.milestones ?? []} onToggle={handleMilestoneToggle} />

                {/* Timeline Section */}
                <TimelineCard
                    guestId={guest?._id}
                    assignedToId={user?._id}
                    timeline={timeline}
                    loading={loadingTimeline}
                    onAddNote={handleAddNote}
                />
            </View>
        </ViewWrapper>
    );
};

export default GuestProfile;
