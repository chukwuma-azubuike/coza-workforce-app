import React, { Suspense, useState } from 'react';
import { View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useGetCampusZonesQuery } from '~/store/services/roast-crm';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';
import { Skeleton } from '~/components/ui/skeleton';
import ErrorBoundary from '~/components/composite/error-boundary';
import { useGetCampusesQuery } from '~/store/services/campus';
import useRole from '~/hooks/role';
import { FloatButton } from '~/components/atoms/button';
import Loading from '~/components/atoms/loading';

const AddZoneModal = React.lazy(() => import('./components/AddModalZone'));
const ZoneList = React.lazy(() => import('./components/ZoneListItem'));

type TabValues = 'zones' | 'assimilation' | 'coordinators';

const Settings: React.FC = () => {
    const { user } = useRole();
    const [selectedZone, setSelectedZone] = useState<string>();
    const [selectedCampus, setSelectedCampus] = useState<string>(user?.campus._id as string);
    const [selectedTab, setSelectedTab] = useState<TabValues>('zones');

    const { isLoading, data: zones = [] } = useGetCampusZonesQuery(selectedCampus as string, { skip: !selectedCampus });
    const { data: campuses = [] } = useGetCampusesQuery();

    const [modalVisible, setModalVisible] = useState(false);
    const handleAddZone = () => setModalVisible(!modalVisible);

    if (isLoading) {
        return (
            <View className="p-4 gap-6 flex-1">
                <Skeleton className="w-2/5 h-7" />
                <Skeleton className="w-full h-6" />
                <View className="gap-6 flex-row flex-wrap">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="min-w-[40%] h-28 flex-1" />
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-12" />
                    ))}
                </View>
            </View>
        );
    }

    return (
        <>
            <View className="gap-6 px-2 pt-4 flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between gap-4">
                    <Text className="text-2xl font-bold">Settings</Text>
                    <View className="flex-row flex-1 gap-4">
                        <View className="flex-1">
                            <PickerSelect
                                valueKey="_id"
                                items={campuses}
                                className="!h-10"
                                placeholder="Campus"
                                labelKey="campusName"
                                value={selectedCampus}
                                onValueChange={setSelectedCampus}
                            />
                        </View>
                        <View className="flex-1">
                            <PickerSelect
                                valueKey="_id"
                                items={zones}
                                labelKey="name"
                                value={selectedZone}
                                className="!h-10"
                                placeholder="Zone"
                                onValueChange={setSelectedZone}
                            />
                        </View>
                    </View>
                </View>

                <Tabs value={selectedTab} onValueChange={setSelectedTab as any} className="gap-6 flex-1">
                    <TabsList>
                        <TabsTrigger value="zones">
                            <Text>Zones</Text>
                        </TabsTrigger>
                        <TabsTrigger value="assimilation">
                            <Text>Assimilation</Text>
                        </TabsTrigger>
                        <TabsTrigger value="coordinators">
                            <Text>Coordinators</Text>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="zones" className="flex-1">
                        <ErrorBoundary>
                            <Suspense fallback={<Loading cover />}>
                                <ZoneList zones={zones} isLoading={isLoading} />
                            </Suspense>
                        </ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="assimilation">
                        <ErrorBoundary></ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="coordinators">
                        <ErrorBoundary></ErrorBoundary>
                    </TabsContent>
                </Tabs>
            </View>

            {selectedTab === 'zones' && (
                <FloatButton
                    iconName="plus"
                    className="!p-2"
                    onPress={handleAddZone}
                    iconType="font-awesome-5"
                    iconClassname="!w-4 !h-4"
                >
                    Add Zone
                </FloatButton>
            )}
            <Suspense fallback={null}>
                <AddZoneModal modalVisible={modalVisible} setModalVisible={handleAddZone} />
            </Suspense>
        </>
    );
};

export default Settings;
