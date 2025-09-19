import React, { useCallback, useState } from 'react';
import { Card, CardHeader, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Badge } from '~/components/ui/badge';
import { Clock, Plus, Save, X } from 'lucide-react-native';
import { ContactChannel, Engagement } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { formatTimelineDate, getTimelineIcon } from '../../utils/time';
import PickerSelect from '~/components/ui/picker-select';
import { useAddEngagementMutation } from '~/store/services/roast-crm';

interface TimelineCardProps {
    guestId: string;
    workerId: string;
    engagements: Engagement[];
    onAddNote: (note: string) => Promise<void>;
}

export function TimelineCard({ engagements, guestId, workerId }: TimelineCardProps) {
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [timelineType, setTimeLineType] = useState<string>();
    const [addEngagement, { isLoading }] = useAddEngagementMutation();

    const handleAddEngagement = async () => {
        if (!newNote.trim()) return;

        try {
            await addEngagement({
                guestId,
                workerId,
                type: ContactChannel.CALL,
                notes: 'Initial contact made',
            });

            setNewNote('');
            setIsAddingNote(false);
        } catch (error) {
            // Error handling is done in the parent component
        }
    };

    const getTimeline = useCallback((timestamp: string | Date) => formatTimelineDate(timestamp), [formatTimelineDate]);
    const getIcon = useCallback((type: string) => getTimelineIcon(type), [getTimelineIcon]);

    const handleSubmitTimeline = async () => {};

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
                        className='!h-10 !w-[8.4rem]'
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
                                    value={timelineType}
                                    className="!w-full !h-12"
                                    items={[
                                        { label: ContactChannel.CALL, value: ContactChannel.CALL },
                                        { label: ContactChannel.WHATSAPP, value: ContactChannel.WHATSAPP },
                                        { label: ContactChannel.VISIT, value: ContactChannel.VISIT },
                                        { label: ContactChannel.SMS, value: ContactChannel.SMS },
                                    ]}
                                    placeholder="Select Engagement Type"
                                    onValueChange={setTimeLineType}
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
                                    loadingText=''
                                    variant="outline"
                                    isLoading={isLoading}
                                    onPress={handleAddEngagement}
                                    disabled={!timelineType || !newNote}
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                </Button>
                            </View>
                        </View>
                    </View>
                )}

                {/* Timeline Items */}
                <View className="gap-4">
                    {engagements.map((item, index) => (
                        <View key={item._id} className="flex-row gap-3">
                            <View className="items-center box-border pb-4">
                                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-600/40 rounded-full flex-row items-center justify-center text-blue-600">
                                    {getIcon(item.type)}
                                </View>
                                {index < engagements.length - 1 && (
                                    <View className="w-px bg-border min-h-[1rem] flex-1 mt-2" />
                                )}
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Badge variant="outline" className="capitalize">
                                        <Text>{item.type}</Text>
                                    </Badge>
                                    <Text className="text-sm text-muted-foreground">{getTimeline(item.timestamp)}</Text>
                                </View>
                                <Text className="line-clamp-none">{item.notes}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {engagements.length === 0 && (
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
}
