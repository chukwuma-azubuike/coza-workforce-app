import React, { useState } from 'react';
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    MapPin,
    Calendar,
    CheckCircle,
    Plus,
    Clock,
    MessageSquare,
    Save,
    X,
} from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Textarea } from '~/components/ui/textarea';
import { Progress } from '~/components/ui/progress';
import { Checkbox } from '~/components/ui/checkbox';
import {
    useAddEngagementMutation,
    useGetEngagementsForGuestQuery,
    useGetGuestByIdQuery,
    useUpdateGuestMutation,
} from '~/store/services/roast-crm';
import { AssimilationStage, ContactChannel, Guest, MilestoneStatus } from '~/store/types';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { getStageColor } from '../utils/colors';
import { handleCall, handleWhatsApp } from '../utils/communication';

interface GuestProfileProps {
    guestId: string | null;
    onBack: () => void;
}

export function GuestProfile({ guestId, onBack }: GuestProfileProps) {
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);

    // RTK Query hooks
    const { data: guest, isLoading: isLoadingGuest } = useGetGuestByIdQuery(guestId!, { skip: !guestId });
    const { data: engagements = [] } = useGetEngagementsForGuestQuery(guestId!, { skip: !guestId });
    const [updateGuest] = useUpdateGuestMutation();
    const [addEngagement] = useAddEngagementMutation();

    if (!guestId || isLoadingGuest) {
        return (
            <View className="p-4 text-center">
                <Text>{!guestId ? 'Guest not found' : 'Loading...'}</Text>
                <Button onPress={onBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </View>
        );
    }

    const getProgressPercentage = () => {
        if (!guest) return 0;
        const completed = guest.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / guest.milestones.length) * 100);
    };

    const handleMilestoneToggle = async (milestoneId: string) => {
        if (!guest) return;

        const updatedMilestones = guest.milestones.map(m =>
            m._id === milestoneId
                ? {
                      ...m,
                      status:
                          m.status === MilestoneStatus.COMPLETED ? MilestoneStatus.PENDING : MilestoneStatus.COMPLETED,
                      completedAt: m.status === MilestoneStatus.COMPLETED ? undefined : new Date().toISOString(),
                  }
                : m
        );

        try {
            await updateGuest({
                _id: guest._id,
                milestones: updatedMilestones,
                lastContact: new Date().toISOString(),
            }).unwrap();
            // toast.success('Milestone updated');
        } catch (error) {
            // toast.error('Failed to update milestone');
        }
    };

    const handleAddNote = async () => {
        if (!guest || !newNote.trim()) return;

        try {
            await addEngagement({
                guestId: guest._id,
                workerId: guest.assignedToId!,
                type: ContactChannel.CALL,
                notes: newNote,
            }).unwrap();

            setNewNote('');
            setIsAddingNote(false);
            // toast.success('Note added');
        } catch (error) {
            // toast.error('Failed to add note');
        }
    };

    const getTimelineIcon = (type: string) => {
        switch (type) {
            case ContactChannel.CALL:
                return <Phone className="w-4 h-4" />;
            case ContactChannel.WHATSAPP:
                return <MessageCircle className="w-4 h-4" />;
            case ContactChannel.VISIT:
                return <MapPin className="w-4 h-4" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    if (!guest) return null;

    return (
        <View className="p-4 max-w-2xl mx-auto">
            {/* Header */}
            <View className="flex items-center mb-6">
                <Button variant="ghost" size="sm" onPress={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </View>

            {/* Guest Info Card */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <View className="flex items-start space-x-4 mb-4">
                        <Avatar alt="profile-avatar" className="w-16 h-16">
                            <AvatarFallback className="text-lg">
                                {guest.name.split(' ')[0]}
                                {guest.name.split(' ')[1]}
                            </AvatarFallback>
                        </Avatar>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold mb-2">{`${guest.name || ''}`}</Text>
                            <View className="flex items-center space-x-2 mb-2">
                                <Badge variant="secondary" className={getStageColor(guest.assimilationStage)}>
                                    {guest.assimilationStage.charAt(0).toUpperCase() + guest.assimilationStage.slice(1)}
                                </Badge>
                                <Text className="text-sm text-gray-500">{getProgressPercentage()}% complete</Text>
                            </View>
                            <Progress value={getProgressPercentage()} className="mb-3" />
                        </View>
                    </View>

                    {/* Contact Actions */}
                    <View className="flex space-x-2 mb-4">
                        <Button className="flex-1" onPress={handleCall(guest)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                        </Button>
                        <Button variant="outline" className="flex-1" onPress={handleWhatsApp(guest)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                        </Button>
                    </View>

                    {/* Contact Details */}
                    <View className="space-y-3">
                        <View className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <Text>{guest.phone}</Text>
                        </View>
                        {guest.address && (
                            <View className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                <Text className="text-sm">{guest.address}</Text>
                            </View>
                        )}
                        <View className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <Text className="text-sm">Added {new Date(guest.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    {/* Prayer Request */}
                    {guest.comment && (
                        <View className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <Text className="font-medium text-2xl text-blue-900 mb-1">Comment</Text>
                            <Text className="text-sm text-blue-800">{guest.comment}</Text>
                        </View>
                    )}
                </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <Text>Assimilation Milestones</Text>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <View className="space-y-3">
                        {guest.milestones.map((milestone, index) => (
                            <View key={milestone._id} className="flex items-center space-x-3">
                                <Checkbox
                                    checked={milestone.status === MilestoneStatus.COMPLETED}
                                    onCheckedChange={() => handleMilestoneToggle(milestone._id)}
                                />
                                <View className="flex-1">
                                    <Text
                                        className={
                                            milestone.status === MilestoneStatus.COMPLETED
                                                ? 'line-through text-gray-500'
                                                : ''
                                        }
                                    >
                                        {milestone.title}
                                    </Text>
                                    {milestone.status === MilestoneStatus.COMPLETED && milestone.completedAt && (
                                        <Text className="text-xs text-gray-500 ml-2">
                                            ✓ {new Date(milestone.completedAt).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <View className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <Text>Engagement Timeline</Text>
                        </CardTitle>
                        <Button size="sm" onPress={() => setIsAddingNote(true)} disabled={isAddingNote}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Note
                        </Button>
                    </View>
                </CardHeader>
                <CardContent>
                    {/* Add Note Form */}
                    {isAddingNote && (
                        <View className="mb-4 p-4 border rounded-lg bg-gray-50">
                            <Textarea
                                placeholder="Add a note about your interaction..."
                                value={newNote}
                                onChangeText={e => setNewNote(e)}
                                className="mb-3"
                            />
                            <View className="flex space-x-2">
                                <Button size="sm" onPress={handleAddNote}>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onPress={() => {
                                        setIsAddingNote(false);
                                        setNewNote('');
                                    }}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </Button>
                            </View>
                        </View>
                    )}

                    {/* Timeline Items */}
                    <View className="space-y-4">
                        {engagements.map((item, index) => (
                            <View key={item._id} className="flex space-x-3">
                                <View className="flex flex-col items-center">
                                    <View className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        {getTimelineIcon(item.type)}
                                    </View>
                                    {index < engagements.length - 1 && <View className="w-px bg-gray-200 h-8 mt-2" />}
                                </View>
                                <View className="flex-1 pb-4">
                                    <View className="flex items-center justify-between mb-1">
                                        <Badge variant="outline" className="capitalize">
                                            {item.type.toLowerCase()}
                                        </Badge>
                                        <Text className="text-xs text-gray-500">
                                            {formatTimeAgo(new Date(item.timestamp))}
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-gray-700">{item.notes}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {engagements.length === 0 && (
                        <View className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <Text>No interactions recorded yet</Text>
                            <Text className="text-sm">Add your first note to start tracking engagement</Text>
                        </View>
                    )}
                </CardContent>
            </Card>
        </View>
    );
}
