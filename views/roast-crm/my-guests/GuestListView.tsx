import { Clock, MessageCircle, MoreVertical, Phone } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import FlatListComponent from '~/components/composite/flat-list';
import PickerSelect from '~/components/ui/picker-select';
import { Text } from '~/components/ui/text';
import { Guest, MilestoneStatus } from '~/store/types';

export const GuestRow: React.FC<{ guest: Guest; index: number; onViewGuest: (guestId: string) => void }> = ({
    guest,
    onViewGuest,
}) => {
    const handleCall = () => {
        Linking.openURL(`tel:${guest.phone}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`https://wa.me/${guest.phone.replace(/\D/g, '')}`);
    };

    const getProgressPercentage = useCallback((milestones: Guest['milestones']) => {
        if (!milestones || milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
        return Math.round((completed / milestones.length) * 100);
    }, []);

    const getDaysSinceContact = useCallback((lastContact: Date | undefined | null) => {
        if (!lastContact) return null;
        const today = new Date();
        const contactDate = new Date(lastContact);
        const diffTime = today.getTime() - contactDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, []);

    const handleGuestMove = (guestId: string, newStage: Guest['assimilationStage']) => {
        // TODO: Update guest stage in backend
        // setGuests(prev =>
        //     prev.map(guest => (guest._id === guestId ? { ...guest, stage: newStage, lastContact: new Date() } : guest))
        // );
        // toast.success(`Guest moved to ${newStage} stage`);
    };

    const progress = useMemo(() => getProgressPercentage(guest.milestones), [guest.milestones, getProgressPercentage]);
    const daysSinceContact = useMemo(
        () => getDaysSinceContact(guest?.lastContact as any),
        [guest?.lastContact, getDaysSinceContact]
    );

    return (
        <View className="py-4 w-full border-t border-t-border">
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-row items-center gap-2">
                    <Avatar alt="profile-avatar" className="w-12 h-12">
                        <AvatarFallback className="text-xs">
                            <Text>
                                {guest.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()}
                            </Text>
                        </AvatarFallback>
                    </Avatar>
                    <View>
                        <Text className="font-bold text-xl">{guest.name}</Text>
                        <Text className="text-xs text-foreground">{guest.phone}</Text>
                    </View>
                </View>

                <View className="flex-row gap-4 items-center">
                    <PickerSelect
                        valueKey="value"
                        labelKey="label"
                        value={guest?.assimilationStage}
                        className="!w-28 !h-10"
                        items={[
                            { label: 'All', value: 'all' },
                            { label: 'Invited', value: 'invited' },
                            { label: 'Attended', value: 'attended' },
                            { label: 'Discipled', value: 'discipled' },
                            { label: 'Joined', value: 'joined' },
                        ]}
                        placeholder="Select stage"
                        onValueChange={value => handleGuestMove(guest._id, value)}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <TouchableOpacity
                                className="items-center justify-center p-2 rounded-full"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MoreVertical className="w-4 h-4" color="gray" />
                            </TouchableOpacity>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" alignOffset={8} className="rounded-2xl">
                            <DropdownMenuItem onPress={() => onViewGuest(guest._id)}>
                                <Text>View Profile</Text>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </View>
            </View>

            <View className="gap-3">
                <View className="flex-row items-center justify-between text-xs">
                    <Text className="text-foreground">Progress</Text>
                    <Text className="text-foreground">{progress}% complete</Text>
                </View>

                <View className="w-full bg-secondary rounded-full h-2">
                    <View
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </View>

                {guest.nextAction && (
                    <View className="text-xs bg-yellow-50 dark:bg-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 rounded p-2 flex-row">
                        <Text className="font-bold">Next: </Text>
                        <Text>{guest.nextAction}</Text>
                    </View>
                )}

                <View className="flex-row items-center justify-between text-xs">
                    <View className="flex-row items-center gap-2 text-foreground">
                        <Clock className="w-3 h-3" />
                        <Text>
                            {daysSinceContact === null
                                ? 'No contact'
                                : daysSinceContact === 0
                                ? 'Today'
                                : daysSinceContact === 1
                                ? 'Yesterday'
                                : `${daysSinceContact} days ago`}
                        </Text>
                    </View>

                    <View className="flex-row gap-2">
                        <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleCall}>
                            <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 px-2" onPress={handleWhatsApp}>
                            <MessageCircle className="w-3 h-3" />
                        </Button>
                    </View>
                </View>
            </View>
        </View>
    );
};

const GuestListView: React.FC<{
    displayGuests: Guest[];
    handleViewGuest: (id: string) => void;
    isLoading?: boolean;
    refetch: () => void;
    containerHeight: number;
}> = ({ handleViewGuest, refetch, isLoading, containerHeight, displayGuests }) => {
    const renderItemComponent = useCallback(
        ({ item }: { item: any; index: number }) => <GuestRow onViewGuest={handleViewGuest} guest={item} index={0} />,
        [GuestRow, handleViewGuest]
    );

    return (
        <View className="px-2 flex-1">
            <View className="flex-row items-center justify-between">
                <Text className="font-semibold">My Guests</Text>
                <Badge variant="outline">
                    <Text className="text-base">{displayGuests?.length} guests</Text>
                </Badge>
            </View>

            <FlatListComponent
                itemHeight={231.7}
                onRefresh={refetch}
                data={displayGuests}
                isLoading={isLoading}
                refreshing={isLoading}
                style={{ height: containerHeight }}
                renderItemComponent={renderItemComponent}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </View>
    );
};

export default GuestListView;
