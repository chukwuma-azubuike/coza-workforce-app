import React, { useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import * as Haptics from 'expo-haptics';

import { TabButton } from '~/components/TabButton';
import { NavTabBackground } from '~/components/NavBackgroundBlur';

import { AppRoutes } from '@config/navigation';
import useRole from '@hooks/role';
import { cn } from '~/lib/utils';
import { View } from 'react-native';

const TabLayout: React.FC = () => {
    const { isWorker, isQC, isCGWCApproved } = useRole();

    const tabRoutes = useMemo(() => AppRoutes.filter(route => route.inMenuBar), [AppRoutes]);

    return (
        <Tabs
            options={{
                backBehavior: 'order',
                screenListeners: {
                    tabPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    },
                },
            }}
            className="shadow-lg shadow-black/5 flex-1"
        >
            <View style={{ flex: 1, marginBottom: 90 }}>
                <TabSlot />
            </View>
            <TabList asChild className={cn('absolute !bg-background bottom-0 left-0 right-0 z-10 overflow-x-auto')}>
                <NavTabBackground>
                    {tabRoutes.map((route, index) => {
                        // Roles and permissions filter
                        if (isWorker && !isQC && route.name === 'More') return;
                        if (isWorker && isQC && route.name === 'Congress' && !isCGWCApproved) return;

                        return (
                            <TabTrigger
                                asChild
                                reset="always"
                                href={route.href}
                                name={route.name}
                                key={`route-${index}`}
                            >
                                <TabButton iconName={route.icon.name} iconType={route.icon.type}>
                                    {route.name}
                                </TabButton>
                            </TabTrigger>
                        );
                    })}
                </NavTabBackground>
            </TabList>
        </Tabs>
    );
};

export default TabLayout;
