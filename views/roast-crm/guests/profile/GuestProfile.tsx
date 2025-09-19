import React, { useCallback } from 'react';
import { ContactChannel, Guest, MilestoneStatus } from '~/store/types';
import {
    useGetGuestByIdQuery,
    useUpdateGuestMutation,
    useGetEngagementsForGuestQuery,
    useAddEngagementMutation,
} from '~/store/services/roast-crm';
// import { toast } from 'sonner';
import { GuestHeader } from './GuestHeader';
import MilestonesCard from './MilestonesCard';
import { TimelineCard } from './TimelineCard';
import { Card, CardContent } from '~/components/ui/card';
import { getStageColor } from '../../utils/colors';
import { getProgressPercentage } from '../../utils/milestones';
import { handleCall, handleWhatsApp } from '../../utils/communication';
import { Skeleton } from '~/components/ui/skeleton';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ViewWrapper from '~/components/layout/viewWrapper';
import useRole from '~/hooks/role';

interface GuestProfileProps {}

const GuestProfile: React.FC<GuestProfileProps> = () => {
    const { user } = useRole();
    const { _id: guestId } = useLocalSearchParams() as unknown as Guest;
    const { data: guest, isLoading } = useGetGuestByIdQuery(guestId || '');
    const { data: engagements = [] } = useGetEngagementsForGuestQuery(guestId || '', { skip: !guestId });
    const [updateGuest] = useUpdateGuestMutation();
    const [addEngagement] = useAddEngagementMutation();

    const onBack = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    const handleMilestoneToggle = useCallback(
        async (milestoneId: string) => {
            if (!guest) return;

            try {
                const updatedMilestones = guest.milestones.map(m =>
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

    const handleAddNote = async (note: string) => {
        if (!guest) return;

        try {
            await addEngagement({
                guestId: guest._id,
                workerId: 'user1', // Should come from auth context in real app
                type: ContactChannel.WHATSAPP, // Using WhatsApp as the default channel
                notes: note,
            });
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
                    stageColor={getStageColor(guest.assimilationStage)}
                    progressPercentage={getProgressPercentage(guest.milestones)}
                />

                {/* Milestones Section */}
                <MilestonesCard milestones={guest.milestones} onToggle={handleMilestoneToggle} />

                {/* Timeline Section */}
                <TimelineCard
                    guestId={guest?._id}
                    workerId={user?._id}
                    engagements={engagements}
                    onAddNote={handleAddNote}
                />
            </View>
        </ViewWrapper>
    );
};

export default GuestProfile;
