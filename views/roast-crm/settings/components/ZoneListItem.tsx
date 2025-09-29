import dayjs from 'dayjs';
import { Clock, MapPin } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Zone } from '~/store/types';
import FlatListComponent from '~/components/composite/flat-list';

const ZoneListItem: React.FC<Zone> = ({ name, descriptions, coordinates, address, createdAt, departments }) => {
    const handleViewZone = () => {
        // onViewZone(guest);
    };

    return (
        <View className="py-4 w-full border-t border-t-border">
            <Pressable onPress={handleViewZone}>
                <View className="flex-row items-start justify-between mb-2">
                    <View className="gap-1">
                        <Text className="font-bold text-xl">{name}</Text>
                        <View className="flex-row gap-1 items-center">
                            <MapPin size={14} />
                            <Text className="text-xs text-foreground">
                                {coordinates.lat ?? ''}, {coordinates.long ?? ''}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="gap-3">
                    <View className="flex-row flex-wrap gap-2">
                        {departments?.map(dept => (
                            <Text key={dept.id} className="font-bold text-muted-foreground">
                                • {dept.name}
                            </Text>
                        ))}
                    </View>

                    {address && (
                        <View className="text-xs flex-row bg-blue-50 dark:bg-blue-400/20 border border-blue-200 dark:border-blue-500/20 rounded p-2">
                            <Text className="font-bold">Address: </Text>
                            <Text className="line-clamp-none">{address}</Text>
                        </View>
                    )}

                    {descriptions && (
                        <View className="text-xs bg-blue-50 dark:bg-blue-400/20 border border-blue-200 dark:border-blue-500/20 rounded p-2">
                            <Text className="font-bold">Description: </Text>
                            <Text className="line-clamp-none">{descriptions}</Text>
                        </View>
                    )}

                    <View className="flex-row items-center justify-between text-xs">
                        <View className="flex-row items-center gap-2 text-foreground">
                            <Clock className="w-3 h-3" />
                            <Text>Created on {dayjs(createdAt).format('DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
};

const ZoneList: React.FC<{
    isLoading?: boolean;
    refetch?: () => void;
    zones: Zone[];
    handleViewZone?: (Guest: Zone) => void;
}> = ({
    refetch,
    isLoading,

    zones,
}) => {
    const renderItemComponent = useCallback(
        ({ item }: { item: Zone; index: number }) => <ZoneListItem {...item} />,
        []
    );

    return (
        <FlatListComponent
            data={zones}
            onRefresh={refetch}
            isLoading={isLoading}
            refreshing={isLoading}
            renderItemComponent={renderItemComponent}
            ListFooterComponentStyle={{ marginBottom: 0 }}
        />
    );
};

export default ZoneList;
