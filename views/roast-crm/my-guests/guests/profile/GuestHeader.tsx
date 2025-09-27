import React from 'react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { Card, CardContent } from '~/components/ui/card';
import { Phone, MessageCircle, MapPin, Calendar } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { AssimilationStage, Guest } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

interface GuestHeaderProps {
    guest: Guest;
    stageColor: string;
    guestAssimilationSubStage: AssimilationStage;
    progressPercentage: number;
    onCall: () => void;
    onWhatsApp: () => void;
}

export function GuestHeader({
    guest,
    stageColor,
    progressPercentage,
    onCall,
    onWhatsApp,
    guestAssimilationSubStage,
}: GuestHeaderProps) {
    return (
        <Card className="mb-6">
            <CardContent className="p-6">
                <View className="flex items-start space-x-4 mb-4">
                    <Avatar alt="profile-avatar" className="w-16 h-16">
                        <AvatarFallback className="text-lg">
                            {`${guest.firstName} ${guest.lastName}`
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold mb-2">
                            {guest.firstName} {guest.lastName}
                        </Text>
                        <View className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className={stageColor}>
                                {guestAssimilationSubStage.charAt(0).toUpperCase() + guestAssimilationSubStage.slice(1)}
                            </Badge>
                            <Text className="text-sm text-gray-500">{progressPercentage}% complete</Text>
                        </View>
                        <Progress value={progressPercentage} className="mb-3" />
                    </View>
                </View>

                {/* Contact Actions */}
                <View className="flex space-x-2 mb-4">
                    <Button className="flex-1" onPress={onCall}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                    </Button>
                    <Button variant="outline" className="flex-1" onPress={onWhatsApp}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                    </Button>
                </View>

                {/* Contact Details */}
                <View className="space-y-3">
                    <View className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <Text>{guest.phoneNumber}</Text>
                    </View>
                    {guest.address && (
                        <View className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <Text className="text-sm">{guest.address}</Text>
                        </View>
                    )}
                    <View className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Text className="text-sm">Added {new Date(guest.createdAt).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Prayer Request */}
                {guest.comment && (
                    <View className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <Text className="font-medium text-blue-900 mb-1">Comment</Text>
                        <Text className="text-sm text-blue-800">{guest.comment}</Text>
                    </View>
                )}
            </CardContent>
        </Card>
    );
}
