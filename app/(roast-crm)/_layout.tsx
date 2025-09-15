import React, { useEffect, useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';

import { TabButton } from '~/components/TabButton';
import { NavTabBackground } from '~/components/NavBackgroundBlur';

import useRole, { ROLES } from '@hooks/role';
import { cn } from '~/lib/utils';
import { Platform, SafeAreaView } from 'react-native';
import TopNav from '~/components/TopNav';

const tabRoutes = [
    {
        name: 'My Guests',
        href: '/my-guests',
        options: { title: 'My Guests' },
        users: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'user-friends', type: 'font-awesome-5' },
    },
    {
        name: 'Zone Dashboard',
        options: { title: 'Zone Dashboard' },
        users: [ROLES.zonalCoordinator],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'map-marked-alt', type: 'font-awesome-5' },
        href: '/zone-dashboard',
    },
    {
        name: 'Global Dashboard',
        options: { title: 'Global Dashboard' },
        users: [ROLES.superAdmin, ROLES.globalAdmin, ROLES.campusPastor, ROLES.globalPastor],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'globe', type: 'font-awesome' },
        href: '/global-dashboard',
    },
    {
        name: 'Leaderboards',
        options: { title: 'Leaderboards' },
        users: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'chart-line', type: 'font-awesome-5' },
        href: '/leaderboards',
    },
    {
        name: 'Notifications',
        options: { title: 'Notifications' },
        users: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'notifications', type: 'ionicon' },
        href: '/notifications',
    },
    {
        name: 'Settings',
        options: { title: 'Settings' },
        users: [ROLES.superAdmin, ROLES.globalAdmin],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'settings-sharp', type: 'ionicon' },
        href: '/settings',
    },
];

const TabLayout: React.FC = () => {
    const { role } = useRole();

    const pathname = usePathname();
    const progress = useSharedValue(1);
    const isAndroid = Platform.OS === 'android';

    const filteredRoutes = useMemo(
        () => tabRoutes.filter(route => route.users.includes('all') || route.users.includes(role as string)),
        [tabRoutes, role]
    );

    useEffect(() => {
        // animate from 0 -> 1 on path change
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.cubic),
        });
    }, [pathname]);

    const style = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

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
            <SafeAreaView className="flex-1">
                <Animated.View style={[{ flex: 1, marginBottom: isAndroid ? 35 : 55 }, style]}>
                    <TopNav />
                    <TabSlot />
                </Animated.View>
            </SafeAreaView>

            <TabList asChild className={cn('absolute !bg-background bottom-0 left-0 right-0 z-10 overflow-x-auto')}>
                <NavTabBackground>
                    {filteredRoutes.map((route, index) => (
                        <TabTrigger
                            asChild
                            reset="always"
                            name={route.name}
                            key={`route-${index}`}
                            href={route.href as any}
                        >
                            <TabButton iconName={route.icon.name} iconType={route.icon.type}>
                                {route.name}
                            </TabButton>
                        </TabTrigger>
                    ))}
                </NavTabBackground>
            </TabList>
        </Tabs>
    );
};

export default TabLayout;
