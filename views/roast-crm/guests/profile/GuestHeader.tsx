import React from 'react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { Card, CardContent } from '~/components/ui/card';
import { Phone, MessageCircle, MapPin, Calendar } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Guest } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { Alert } from '~/components/ui/alert';

interface GuestHeaderProps {
    guest: Guest;
    stageColor: string;
    progressPercentage: number;
    onCall: () => void;
    onWhatsApp: () => void;
    assimilationStage: string;
}

export function GuestHeader({
    guest,
    stageColor,
    progressPercentage,
    onCall,
    onWhatsApp,
    assimilationStage,
}: GuestHeaderProps) {
    return (
        <Card>
            <CardContent className="p-6 gap-6">
                <View className="flex-row items-start gap-4">
                    <Avatar alt="profile-image" className="w-16 h-16">
                        <AvatarFallback className="text-lg">
                            <Text>
                                {`${guest.firstName} ${guest.lastName}`
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')}
                            </Text>
                        </AvatarFallback>
                    </Avatar>
                    <View className="flex-1 gap-1">
                        <Text className="text-2xl font-bold mb-2">
                            {guest.firstName} {guest.lastName}{' '}
                        </Text>
                        <View className="flex-row items-center gap-2 mb-2">
                            <Badge variant="secondary" className={stageColor}>
                                <Text className={stageColor}>
                                    {assimilationStage.charAt(0).toUpperCase() + assimilationStage.slice(1)}
                                </Text>
                            </Badge>
                            <Text className="text-muted-foreground">{progressPercentage}% complete</Text>
                        </View>
                        <Progress value={progressPercentage} />
                    </View>
                </View>

                {/* Contact Actions */}
                <View className="flex-row gap-2">
                    <Button
                        variant="outline"
                        icon={<Phone className="w-4 h-4 mr-2" />}
                        className="flex-1"
                        onPress={onCall}
                        size="sm"
                    >
                        Call
                    </Button>
                    <Button
                        icon={<MessageCircle className="w-4 h-4 mr-2" color={THEME_CONFIG.success} />}
                        variant="outline"
                        className="flex-1"
                        onPress={onWhatsApp}
                        size="sm"
                    >
                        WhatsApp
                    </Button>
                </View>

                {/* Contact Details */}
                <View className="gap-3">
                    <View className="flex-row items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <Text>{guest.phoneNumber}</Text>
                    </View>
                    {guest.address && (
                        <View className="flex-row items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <Text>{guest.address}</Text>
                        </View>
                    )}
                    <View className="flex-row items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Text>Added {new Date(guest.createdAt).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Prayer Request */}
                {guest.comment && (
                    <Alert className="rounded-lg border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-300/30">
                        <Text className="font-semibold">Comment</Text>
                        <Text>{guest.comment}</Text>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
