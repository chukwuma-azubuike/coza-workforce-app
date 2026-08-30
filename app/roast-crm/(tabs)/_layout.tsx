import React, { useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';

import * as Haptics from 'expo-haptics';

import useRole, { DEPARTMENTS, ROLES } from '@hooks/role';

import { View } from 'react-native';
import TopNav from '~/components/TopNav';
import { TabButton } from '~/components/TabButton';
import useDeferHeavy from '~/hooks/performance/defer-heavy';
import Loading from '~/components/atoms/loading';

const tabRoutes = [
    {
        name: 'Today',
        // Path stays `notifications` — ADR-006. The route renders the Task Feed; the
        // inbox is the bell in `TopNav` and lives at `/notifications`.
        href: '/roast-crm/(tabs)/notifications',
        pathname: '/roast-crm/notifications',
        options: { title: 'Today' },
        users: ['all'],
        departments: ['all'],
        departmentUsers: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'fire', type: 'font-awesome-5' },
    },
    {
        name: 'My Guests',
        href: '/roast-crm/(tabs)/my-guests',
        pathname: '/roast-crm/my-guests',
        options: { title: 'My Guests' },
        users: ['all'],
        departments: ['all'],
        departmentUsers: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'user-friends', type: 'font-awesome-5' },
    },
    {
        name: 'Zone',
        options: { title: 'Zone' },
        users: [ROLES.zonalCoordinator, ROLES.HOD, ROLES.superAdmin, ROLES.campusPastor],
        departments: ['all'],
        departmentUsers: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'map-marked-alt', type: 'font-awesome-5' },
        href: '/roast-crm/(tabs)/zone-dashboard',
        pathname: '/roast-crm/zone-dashboard',
    },
    {
        name: 'Reports',
        options: { title: 'Reports' },
        users: [ROLES.globalAdmin, ROLES.campusPastor, ROLES.globalPastor, ROLES.superAdmin],
        departments: ['all', DEPARTMENTS.PCU, DEPARTMENTS.ME],
        departmentUsers: [ROLES.HOD, ROLES.AHOD],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'bar-chart-2', type: 'feather' },
        href: '/roast-crm/(tabs)/global-dashboard',
        pathname: '/roast-crm/global-dashboard',
    },
    {
        name: 'Leaderboards',
        options: { title: 'Leaderboards' },
        users: ['all'],
        departments: ['all'],
        departmentUsers: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'chart-line', type: 'font-awesome-5' },
        href: '/roast-crm/(tabs)/leaderboards',
        pathname: '/roast-crm/leaderboards',
    },
    {
        name: 'Settings',
        options: { title: 'Settings' },
        users: [ROLES.superAdmin, ROLES.globalAdmin],
        departments: ['all'],
        departmentUsers: [],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'settings-sharp', type: 'ionicon' },
        href: '/roast-crm/(tabs)/settings',
        pathname: '/roast-crm/settings',
    },
];

/**
 * The Roast tab bar.
 *
 * **`Tabs`/`TabSlot`, not `Slot`.** This layout used a bare `<Slot />` with `<Link>`s for
 * triggers, which renders exactly one route and keeps no navigator state: every tab press
 * unmounted the screen the worker was on and mounted the next one from nothing. On My
 * Guests that means tearing down a Kanban board and re-running four queries to go and
 * glance at Today — and then doing it all again to come back. `TabSlot` keeps each tab
 * mounted once focused, so the second visit is a re-focus rather than a rebuild.
 */
const TabLayout: React.FC = () => {
    const ready = useDeferHeavy();
    const { role, user } = useRole();

    const departmentName = user?.department?.departmentName;

    const filteredRoutes = useMemo(
        () =>
            tabRoutes.filter(
                route =>
                    route?.users?.includes('all') ||
                    route?.users?.includes(role as string) ||
                    (route?.departments?.includes(departmentName as string) &&
                        route?.departmentUsers?.includes(role as string))
            ) ?? [],
        [role, departmentName]
    );

    return (
        <Tabs
            className="flex-1"
            options={{
                backBehavior: 'order',
                screenListeners: {
                    tabPress: () => {
                        Haptics.selectionAsync();
                    },
                },
            }}
        >
            <TopNav />
            {/*
             * The gate is on the content only. It used to cover the tab bar too, which
             * left the worker looking at a bare spinner with no chrome on the way in —
             * the bar costs nothing to draw and gives the transition something to land on.
             */}
            <View className="flex-1">{ready ? <TabSlot /> : <Loading cover />}</View>
            <TabList asChild>
                <View className="flex-row justify-around pt-4 px-4 bg-background border-t-border border-t-[0.5px]">
                    {filteredRoutes.map(route => (
                        <TabTrigger asChild href={route.href as any} name={route.name} key={route.name}>
                            <TabButton iconName={route.icon.name} iconType={route.icon.type}>
                                {route.name}
                            </TabButton>
                        </TabTrigger>
                    ))}
                </View>
            </TabList>
        </Tabs>
    );
};

export default TabLayout;
