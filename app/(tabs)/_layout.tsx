import React, { useEffect, useMemo } from 'react';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';

import { TabButton } from '~/components/TabButton';
import { NavTabBackground } from '~/components/NavBackgroundBlur';

import { AppRoutes } from '@config/navigation';
import useRole from '@hooks/role';
import { cn } from '~/lib/utils';
import { Platform } from 'react-native';

const TabLayout: React.FC = () => {
    const { isWorker, isQC, isCGWCApproved } = useRole();

    const tabRoutes = useMemo(() => AppRoutes.filter(route => route.inMenuBar), [AppRoutes]);

    const pathname = usePathname();
    const progress = useSharedValue(1);
    const isAndroid = Platform.OS === 'android';

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
        // transform: [{ translateY: (1 - progress.value) * 8 }],
        // you can also compute pointer events / z-index here if needed
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
            <Animated.View style={[{ flex: 1, marginBottom: isAndroid ? 70 : 90 }, style]}>
                <TabSlot />
            </Animated.View>

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
