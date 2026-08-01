import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import AvatarComponent from '~/components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '~/constants';
import Empty from '~/components/atoms/empty';
import { FlatListSkeleton } from '~/components/layout/skeleton';
import { Icon } from '@rneui/base';
import { THEME_CONFIG } from '~/config/appConfig';
import { ContactChannel } from '~/store/types';
import { openPhoneNumber } from '../utils/communication';
import useRole from '~/hooks/role';
import {
    useGetActiveWorkersQuery,
    useGetInactiveWorkersQuery,
    useGetZeroEngagementWorkersQuery,
} from '~/store/services/roast-crm';
import type { ZoneWorkerEntry } from '~/store/types/roast-crm';

type ZoneWorkersFilter = 'active' | 'inactive' | 'zero-engagement';

const workerName = (worker: ZoneWorkerEntry) =>
    worker.name ?? [worker.firstName, worker.lastName].filter(Boolean).join(' ') ?? 'Worker';

const workerId = (worker: ZoneWorkerEntry) => worker.workerId ?? worker._id ?? '';

function WorkerRow({
    worker,
    onPress,
    canContact,
}: {
    worker: ZoneWorkerEntry;
    onPress: () => void;
    canContact: boolean;
}) {
    return (
        <Pressable onPress={onPress}>
            <Card>
                <CardContent className="p-4 flex-row items-center gap-4">
                    <AvatarComponent
                        imageUrl={worker.pictureUrl || AVATAR_FALLBACK_URL}
                        alt={`${workerName(worker)}-picture`}
                    />
                    <View className="flex-1">
                        <Text className="font-semibold">{workerName(worker)}</Text>
                        {!!worker.zoneName && <Text className="text-muted-foreground">{worker.zoneName}</Text>}
                        {typeof worker.daysSinceActive === 'number' && (
                            <Text className="text-muted-foreground">
                                {worker.daysSinceActive === 0
                                    ? 'Active today'
                                    : `${worker.daysSinceActive} days since last active`}
                            </Text>
                        )}
                    </View>
                    {canContact && !!worker.phoneNumber && (
                        <View className="flex-row gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onPress={openPhoneNumber(worker.phoneNumber, ContactChannel.CALL)}
                            >
                                <Icon type="feather" name="phone" color={THEME_CONFIG.blue} />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onPress={openPhoneNumber(worker.phoneNumber, ContactChannel.WHATSAPP)}
                            >
                                <Icon type="ionicon" name="logo-whatsapp" color={THEME_CONFIG.success} />
                            </Button>
                        </View>
                    )}
                </CardContent>
            </Card>
        </Pressable>
    );
}

function WorkerListSection({
    workers,
    isLoading,
    onPressWorker,
    emptyMessage,
    canContact,
}: {
    workers: ZoneWorkerEntry[];
    isLoading: boolean;
    onPressWorker: (worker: ZoneWorkerEntry) => void;
    emptyMessage: string;
    canContact: boolean;
}) {
    if (isLoading) return <FlatListSkeleton />;
    if (!workers.length) return <Empty width={320} message={emptyMessage} />;

    return (
        <View className="gap-3">
            {workers.map(worker => (
                <WorkerRow
                    key={workerId(worker)}
                    worker={worker}
                    onPress={() => onPressWorker(worker)}
                    canContact={canContact}
                />
            ))}
        </View>
    );
}

export function ZoneWorkers() {
    const { filter, zoneId, zoneName } = useLocalSearchParams<{
        filter: ZoneWorkersFilter;
        zoneId?: string;
        zoneName?: string;
    }>();

    const [activeTab, setActiveTab] = useState<ZoneWorkersFilter>(filter ?? 'active');

    const { isZonalCoordinator, isCampusPastor, isPCU, isInternship, isQC, isSuperAdmin } = useRole();
    const canContactWorker = isZonalCoordinator || isCampusPastor || isPCU || isInternship || isQC || isSuperAdmin;

    const { data: activeWorkers = [], isLoading: loadingActive } = useGetActiveWorkersQuery(
        { zoneId: zoneId as string },
        { skip: !zoneId }
    );
    const { data: inactiveWorkers = [], isLoading: loadingInactive } = useGetInactiveWorkersQuery(
        { zoneId: zoneId as string },
        { skip: !zoneId }
    );
    const { data: zeroEngagementWorkers = [], isLoading: loadingZeroEngagement } = useGetZeroEngagementWorkersQuery({
        zoneId: zoneId || undefined,
    });

    const handlePressWorker = (worker: ZoneWorkerEntry) => {
        router.push({
            pathname: '/roast-crm/worker-profile',
            params: {
                workerId: workerId(worker),
                name: workerName(worker),
                pictureUrl: worker.pictureUrl,
                zone: worker.zoneName ?? zoneName,
            } as any,
        });
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as ZoneWorkersFilter)}
            className="flex-1 bg-background"
        >
            <View className="px-4 pt-4 pb-2">
                <TabsList>
                    <TabsTrigger value="active">
                        <Text>Active</Text>
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                        <Text>Inactive</Text>
                    </TabsTrigger>
                    <TabsTrigger value="zero-engagement">
                        <Text>Needs Attention</Text>
                    </TabsTrigger>
                </TabsList>
            </View>

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
                <TabsContent value="active">
                    <WorkerListSection
                        workers={activeWorkers}
                        isLoading={loadingActive}
                        onPressWorker={handlePressWorker}
                        emptyMessage="No active workers this week"
                        canContact={canContactWorker}
                    />
                </TabsContent>

                <TabsContent value="inactive">
                    <WorkerListSection
                        workers={inactiveWorkers}
                        isLoading={loadingInactive}
                        onPressWorker={handlePressWorker}
                        emptyMessage="No inactive workers this week"
                        canContact={canContactWorker}
                    />
                </TabsContent>

                <TabsContent value="zero-engagement">
                    <WorkerListSection
                        workers={zeroEngagementWorkers}
                        isLoading={loadingZeroEngagement}
                        onPressWorker={handlePressWorker}
                        emptyMessage="No workers with zero engagement"
                        canContact={canContactWorker}
                    />
                </TabsContent>
            </ScrollView>
        </Tabs>
    );
}
