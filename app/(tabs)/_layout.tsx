import React, { useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import * as Haptics from 'expo-haptics';

import { TabButton } from '~/components/TabButton';
import { NavTabBackground } from '~/components/NavBackgroundBlur';

import { AppRoutes } from '@config/navigation';
import useRole from '@hooks/role';
import { cn } from '~/lib/utils';

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
            className="shadow-lg shadow-black/5"
        >
            <TabSlot />
            <TabList asChild className={cn('!bg-transparent overflow-x-auto')}>
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
