import React, { useMemo } from 'react';
import { Link, Slot } from 'expo-router';

import { Icon } from '@rneui/themed';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';

import useRole, { ROLES } from '@hooks/role';

import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import TopNav from '~/components/TopNav';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import { THEME_CONFIG } from '~/config/appConfig';
import useDeferHeavy from '~/hooks/performance/defer-heavy';
import Loading from '~/components/atoms/loading';

const tabRoutes = [
    {
        name: 'My Guests',
        href: '/roast-crm/(tabs)/my-guests',
        pathname: '/roast-crm/my-guests',
        options: { title: 'My Guests' },
        users: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'user-friends', type: 'font-awesome-5' },
    },
    {
        name: 'Zone Dashboard',
        options: { title: 'Zone Dashboard' },
        users: [ROLES.zonalCoordinator, ROLES.HOD], // TODO: Remove HOD, added only for ease of testing
        inMenuBar: true,
        inMore: false,
        icon: { name: 'map-marked-alt', type: 'font-awesome-5' },
        href: '/roast-crm/(tabs)/zone-dashboard',
        pathname: '/roast-crm/zone-dashboard',
    },
    {
        name: 'Global Dashboard',
        options: { title: 'Global Dashboard' },
        users: [ROLES.superAdmin, ROLES.globalAdmin, ROLES.campusPastor, ROLES.globalPastor],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'globe', type: 'font-awesome' },
        href: '/roast-crm/(tabs)/global-dashboard',
        pathname: '/roast-crm/global-dashboard',
    },
    {
        name: 'Leaderboards',
        options: { title: 'Leaderboards' },
        users: ['all'],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'chart-line', type: 'font-awesome-5' },
        href: '/roast-crm/(tabs)/leaderboards',
        pathname: '/roast-crm/leaderboards',
    },
    // {
    //     name: 'Notifications',
    //     options: { title: 'Notifications' },
    //     users: ['all'],
    //     inMenuBar: true,
    //     inMore: false,
    //     icon: { name: 'notifications', type: 'ionicon' },
    //     href: '/roast-crm/(tabs)/notifications',
    //     pathname: '/roast-crm/notifications',
    // },
    {
        name: 'Settings',
        options: { title: 'Settings' },
        users: [ROLES.superAdmin, ROLES.globalAdmin],
        inMenuBar: true,
        inMore: false,
        icon: { name: 'settings-sharp', type: 'ionicon' },
        href: '/roast-crm/(tabs)/settings',
        pathname: '/roast-crm/settings',
    },
];

const TabLayout: React.FC = () => {
    const ready = useDeferHeavy();
    const { role } = useRole();
    const pathname = usePathname();
    const { isLightColorScheme } = useColorScheme();

    const filteredRoutes = useMemo(
        () => tabRoutes.filter(route => route.users.includes('all') || route.users.includes(role as string)),
        [tabRoutes, role]
    );

    const handlePress = () => {
        Haptics.selectionAsync();
    };

    return (
        <SafeAreaView className="relative flex-1">
            <View className="flex-1">
                <TopNav />
                <View className="flex-1">{ready ? <Slot /> : <Loading cover />}</View>
                <View className="flex-row justify-around pt-4 pb-1 bg-background border-t-border border-t-[0.5px] ">
                    {filteredRoutes.map((route, index) => {
                        const isFocused = pathname == route.pathname;

                        const color = isFocused
                            ? isLightColorScheme
                                ? THEME_CONFIG.primary
                                : THEME_CONFIG.primaryLight
                            : THEME_CONFIG.lightGray;

                        return (
                            <Link
                                href={route.href as any}
                                key={`route-${index}`}
                                className="text-foreground"
                                onPress={handlePress}
                                asChild
                            >
                                <TouchableOpacity activeOpacity={0.6}>
                                    <View className="w-28 gap-1 items-center">
                                        <Icon name={route.icon.name} type={route.icon.type} size={22} color={color} />
                                        <Text style={{ color }} className="text-xs font-light">
                                            {route.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default TabLayout;
