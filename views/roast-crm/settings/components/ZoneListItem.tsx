import dayjs from 'dayjs';
import { Clock, Home, MapPin } from 'lucide-react-native';
import React, { Suspense, useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Zone } from '~/store/types';
import FlatListComponent from '~/components/composite/flat-list';
import { Badge } from '~/components/ui/badge';
const AddZoneModal = React.lazy(() => import('./AddModalZone'));
const EditZoneModal = React.lazy(() => import('./EditModalZone'));

const ZoneListItem: React.FC<Zone & { openModal: (zone: Zone) => void }> = ({ openModal, ...props }) => {
    const handleViewZone = () => {
        openModal({ ...props });
    };

    const { name, descriptions, coordinates, address, createdAt, departments } = props;

    return (
        <View className="py-4 w-full border-t border-t-border">
            <TouchableOpacity activeOpacity={0.6} onPress={handleViewZone}>
                <View className="flex-row items-start justify-between mb-2">
                    <View className="gap-1 flex-row justify-between items-center">
                        <Text className="font-bold text-3xl">{name}</Text>
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
                            <Badge variant="outline" key={dept.id}>
                                <Text className="text-base text-green-500">{dept.name}</Text>
                            </Badge>
                        ))}
                    </View>

                    {address && (
                        <View className="text-xs flex-row border border-blue-200 dark:border-blue-500/20 rounded-xl p-2 items-center gap-2">
                            <Home size={18} />
                            <Text className="line-clamp-none">{address}</Text>
                        </View>
                    )}

                    {descriptions && (
                        <View className="text-xs border border-blue-200 dark:border-blue-500/20 rounded-xl p-2">
                            <Text className="font-bold">Description: </Text>
                            <Text className="line-clamp-none">{descriptions}</Text>
                        </View>
                    )}

                    <View className="flex-row items-center justify-between text-xs">
                        <View className="flex-row items-center gap-2 text-foreground">
                            <Clock className="w-3 h-3" />
                            <Text className="text-base text-muted-foreground">Created on {dayjs(createdAt).format('DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const ZoneList: React.FC<{
    isLoading?: boolean;
    refetch?: () => void;
    zones: Zone[];
    handleViewZone?: (Guest: Zone) => void;
}> = ({ refetch, isLoading, zones }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editZoneModal, setEditZoneModal] = useState<Zone>();
    const handleAddZone = () => setModalVisible(!modalVisible);
    const handleEditZone = () => setEditZoneModal(undefined);

    const renderItemComponent = useCallback(
        ({ item }: { item: Zone; index: number }) => <ZoneListItem openModal={setEditZoneModal} {...item} />,
        []
    );

    return (
        <>
            <FlatListComponent
                data={zones}
                onRefresh={refetch}
                isLoading={isLoading}
                refreshing={isLoading}
                renderItemComponent={renderItemComponent}
                ListFooterComponentStyle={{ marginBottom: 0 }}
            />
            <Suspense fallback={null}>
                <AddZoneModal modalVisible={modalVisible} setModalVisible={handleAddZone} />
            </Suspense>
            <Suspense fallback={null}>
                <EditZoneModal zone={editZoneModal} modalVisible={modalVisible} setModalVisible={handleEditZone} />
            </Suspense>
        </>
    );
};

export default ZoneList;
