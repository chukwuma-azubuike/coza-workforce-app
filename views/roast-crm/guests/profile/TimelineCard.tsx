import React, { useCallback, useState } from 'react';
import { Card, CardHeader, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Badge } from '~/components/ui/badge';
import { Clock, Plus, Save, X } from 'lucide-react-native';
import { ContactChannel, Timeline } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { formatTimelineDate, getTimelineIcon } from '../../utils/time';
import PickerSelect from '~/components/ui/picker-select';
import { useAddTimelineMutation } from '~/store/services/roast-crm';
import { Skeleton } from '~/components/ui/skeleton';

interface TimelineCardProps {
    guestId: string;
    assignedToId: string;
    timeline: Timeline[];
    loading: boolean;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ timeline, guestId, loading, assignedToId }) => {
    const [newNote, setNewNote] = useState('');
    const [channel, setChannel] = useState(ContactChannel.CALL);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [addTimeline, { isLoading }] = useAddTimelineMutation();

    const handleAddEngagement = async () => {
        if (!newNote.trim()) return;

        try {
            await addTimeline({
                notes: newNote,
                title: 'Timeline',
                assignedToId,
                channel,
                guestId,
            });

            setNewNote('');
            setIsAddingNote(false);
        } catch (error) {
            // Error handling is done in the parent component
        }
    };

    const getTimeline = useCallback((timestamp: string | Date) => formatTimelineDate(timestamp), [formatTimelineDate]);
    const getIcon = useCallback((type: string) => getTimelineIcon(type), [getTimelineIcon]);

    return (
        <Card>
            <View className="flex-row items-center justify-between">
                <CardHeader className="flex-row items-start justify-between flex-1">
                    <View className="flex-row items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <Text className="text-lg font-bold">Engagement Timeline</Text>
                    </View>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isAddingNote}
                        className="!h-10 !w-[8.4rem]"
                        onPress={() => setIsAddingNote(true)}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Add Note
                    </Button>
                </CardHeader>
            </View>

            <CardContent className="gap-6">
                {/* Add Note Form */}
                {isAddingNote && (
                    <View className="gap-4">
                        <Textarea
                            placeholder="Add a note about your interaction..."
                            value={newNote}
                            onChangeText={e => setNewNote(e)}
                            className="line-clamp-6"
                        />
                        <View className="flex-row justify-between gap-4">
                            <View className="flex-1">
                                <PickerSelect
                                    valueKey="value"
                                    labelKey="label"
                                    value={channel}
                                    className="!h-12"
                                    items={[
                                        { label: ContactChannel.CALL, value: ContactChannel.CALL },
                                        { label: ContactChannel.WHATSAPP, value: ContactChannel.WHATSAPP },
                                        { label: ContactChannel.VISIT, value: ContactChannel.VISIT },
                                        { label: ContactChannel.SMS, value: ContactChannel.SMS },
                                    ]}
                                    placeholder="Select Engagement Type"
                                    onValueChange={setChannel}
                                />
                            </View>
                            <View className="flex-row gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onPress={() => {
                                        setIsAddingNote(false);
                                        setNewNote('');
                                    }}
                                >
                                    <X className="w-4 h-4 mr-1 text-destructive" />
                                </Button>
                                <Button
                                    size="sm"
                                    loadingText=""
                                    variant="outline"
                                    isLoading={isLoading}
                                    onPress={handleAddEngagement}
                                    disabled={!channel || !newNote}
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                </Button>
                            </View>
                        </View>
                    </View>
                )}

                {/* Timeline Loading */}
                {loading && (
                    <View className="gap-4">
                        {[...Array(4)].map((_, index) => (
                            <View key={index} className="flex-row gap-3">
                                <View className="items-center box-border pb-4">
                                    <Skeleton className="w-10 h-10 bg-blue-100 dark:bg-blue-600/40 rounded-full flex-row items-center justify-center text-blue-600" />
                                    <View className="w-px bg-border min-h-[1rem] flex-1 mt-2" />
                                </View>
                                <View className="flex-1 gap-2">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Skeleton className="w-8 h-4" />
                                    </View>
                                    <Skeleton className="w-full h-4 text-sm text-muted-foreground" />
                                    <Skeleton className="w-full h-4 text-sm text-muted-foreground" />
                                    <Skeleton className="w-[60%] h-4 text-sm text-muted-foreground" />
                                    <Skeleton className="w-[40%] h-4 text-sm text-muted-foreground" />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Timeline Items */}
                <View className="gap-4">
                    {timeline.map((item, index) => (
                        <View key={item._id} className="flex-row gap-3">
                            <View className="items-center box-border pb-4">
                                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-600/40 rounded-full flex-row items-center justify-center text-blue-600">
                                    {getIcon(item.channel)}
                                </View>
                                {index < timeline.length - 1 && (
                                    <View className="w-px bg-border min-h-[1rem] flex-1 mt-2" />
                                )}
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Badge variant="outline" className="capitalize">
                                        <Text>{item.channel}</Text>
                                    </Badge>
                                    <Text className="text-sm text-muted-foreground">{getTimeline(item.createdAt)}</Text>
                                </View>
                                <Text className="line-clamp-none">{item.notes}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {timeline.length === 0 && !loading && (
                    <View className="text-center flex-row gap-4">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <View>
                            <Text className="text-muted-foreground">No interactions recorded yet</Text>
                            <Text className="text-sm text-muted-foreground">
                                Add your first note to start tracking engagement
                            </Text>
                        </View>
                    </View>
                )}
            </CardContent>
        </Card>
    );
};

export default TimelineCard;
