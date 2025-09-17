import React from 'react';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react-native';
import { Guest, MilestoneStatus, ContactChannel } from '~/store/types';
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
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { getStageColor } from '~/views/roast-crm/utils/colors';
import { handleCall, handleWhatsApp } from '~/views/roast-crm/utils/communication';

interface GuestProfileProps {
    guestId: string | null;
    onBack: () => void;
}

function GuestProfile({ guestId, onBack }: GuestProfileProps) {
    const { data: guest, isLoading } = useGetGuestByIdQuery(guestId || '');
    const { data: engagements = [] } = useGetEngagementsForGuestQuery(guestId || '', { skip: !guestId });
    const [updateGuest] = useUpdateGuestMutation();
    const [addEngagement] = useAddEngagementMutation();

    const getProgressPercentage = () => {
        if (!guest?.milestones?.length) return 0;
        const completed = guest.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / guest.milestones.length) * 100);
    };

    const handleMilestoneToggle = async (milestoneId: string) => {
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
                          completedAt: m.status === MilestoneStatus.COMPLETED ? undefined : new Date().toISOString(),
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
    };

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
            <View className="p-4 max-w-2xl mx-auto space-y-6">
                <View>
                    <Text>{!guest && !isLoading && 'Guest not found'}</Text>
                    <Button size="sm" onPress={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </View>
                <View className="animate-pulse space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <View className="flex items-start space-x-4">
                                    <View className="w-10 h-10 rounded-lg bg-gray-200" />
                                    <View className="space-y-4 flex-1">
                                        <View className="h-5 bg-gray-200 rounded w-3/4" />
                                        <View className="h-3 bg-gray-200 rounded w-1/2" />
                                        <View className="h-3 bg-gray-200 rounded w-1/2" />
                                        <View className="h-3 bg-gray-200 rounded w-3/4 " />
                                    </View>
                                </View>
                            </CardContent>
                        </Card>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View className="p-4 max-w-2xl mx-auto space-y-6">
            {/* Header with Back Button */}
            <View className="flex items-center mb-6">
                <Button size="sm" onPress={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </View>

            {/* Guest Info Section */}
            <GuestHeader
                guest={guest}
                stageColor={getStageColor(guest.assimilationStage)}
                progressPercentage={getProgressPercentage()}
                onCall={handleCall(guest)}
                onWhatsApp={handleWhatsApp(guest)}
            />

            {/* Milestones Section */}
            <MilestonesCard milestones={guest.milestones} onToggle={handleMilestoneToggle} />

            {/* Timeline Section */}
            <TimelineCard engagements={engagements} onAddNote={handleAddNote} />
        </View>
    );
}

export default GuestProfile;
