import React, { useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Badge } from '~/components/ui/badge';
import { Clock, Plus, Save, X, Phone, MessageCircle, MapPin, MessageSquare } from 'lucide-react-native';
import { ContactChannel } from '~/store/types';

import { Engagement } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { formatTimelineDate } from '../../../utils/time';

interface TimelineCardProps {
    engagements: Engagement[];
    onAddNote: (note: string) => Promise<void>;
}

export function TimelineCard({ engagements, onAddNote }: TimelineCardProps) {
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            await onAddNote(newNote);
            setNewNote('');
            setIsAddingNote(false);
        } catch (error) {
            // Error handling is done in the parent component
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
            case 'milestone':
                return <Clock className="w-4 h-4" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    const formattedTimelineDate = useCallback((timestamp: Date | string) => formatTimelineDate(timestamp), []);

    return (
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
                                        {item.type}
                                    </Badge>
                                    <Text className="text-xs text-gray-500">
                                        {formattedTimelineDate(item.timestamp)}
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
    );
}
