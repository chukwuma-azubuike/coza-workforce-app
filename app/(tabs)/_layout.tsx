import React, { useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import * as Haptics from 'expo-haptics';

import { TabButton } from '~/components/TabButton';
import { NavTabBackground } from '~/components/NavBackgroundBlur';

import { AppRoutes } from '@config/navigation';
import useRole from '@hooks/role';

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
            <TabList asChild style={{ backgroundColor: 'transparent' }} className="!bg-transparent overflow-x-auto">
                <NavTabBackground>
                    {tabRoutes.map((route, index) => {
                        let iconName = 'home';
                        let iconType = 'antdesign';

                        switch (route.name) {
                            case 'Home':
                                iconName = 'home';
                                iconType = 'antdesign';
                                break;
                            case 'Attendance':
                                iconName = 'checklist';
                                iconType = 'octicon';
                                break;
                            case 'Permissions':
                                iconName = 'hand-left-outline';
                                iconType = 'ionicon';
                                break;
                            case 'Tickets':
                                iconName = 'ticket-confirmation-outline';
                                iconType = 'material-community';
                                break;
                            case 'More':
                                iconName = 'menu-outline';
                                iconType = 'ionicon';
                                break;
                            case 'CGLS':
                                iconName = 'crown';
                                iconType = 'foundation';
                            default:
                                break;
                        }

                        // Roles and permissions filter
                        if (isWorker && !isQC && route.name === 'More') return;
                        if (isWorker && isQC && route.name === 'CGLS' && !isCGWCApproved) return;

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
