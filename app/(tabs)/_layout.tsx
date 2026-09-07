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
    const { isWorker, isQC, isCGWCApproved, isGroupHead } = useRole();

    const tabRoutes = useMemo(
        () => AppRoutes.filter(route => (isGroupHead ? route.ghMenuBar : route.inMenuBar)),
        [isGroupHead]
    );

    const pathname = usePathname();
    const progress = useSharedValue(1);

    /**
     * A cross-fade, not a curtain.
     *
     * This ran from opacity 0 over 700ms on **every** pathname change — including a push
     * deeper into a tab's own stack. So every navigation in the app began with the
     * destination fully invisible and took the better part of a second to become legible,
     * regardless of how fast it had actually rendered. The screen was ready; the fade was
     * the wait.
     *
     * 0.6 → 1 over 140ms keeps the softening the effect was there for and puts the
     * content on screen in the frame it is ready in.
     */
    useEffect(() => {
        progress.value = 0.6;
        progress.value = withTiming(1, {
            duration: 140,
            easing: Easing.out(Easing.quad),
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
                        Haptics.selectionAsync();
                    },
                },
            }}
            className="shadow-lg shadow-black/5 flex-1"
        >
            <Animated.View style={[{ flex: 1 }, style]}>
                <TabSlot />
            </Animated.View>

            <TabList
                asChild
                className={cn(
                    '!bg-background bottom-0 left-0 right-0 z-10 overflow-x-auto',
                    Platform.OS === 'ios' && 'pb-8'
                )}
            >
                <NavTabBackground>
                    {tabRoutes.map((route, index) => {
                        // Roles and permissions filter
                        if (isWorker && !isCGWCApproved && !isQC && route.name === 'More') return;

                        // `reset="onFocus"`, not `"always"`. `"always"` threw away the tab's
                        // navigation state on every press, so returning to a tab remounted its
                        // stack from the root even when the worker was already standing on it.
                        // `"onFocus"` resets only when the tab pressed is the one already
                        // focused — the standard tap-to-pop-to-root gesture — and leaves a
                        // genuine tab switch to re-focus what is already mounted.
                        return (
                            <TabTrigger
                                asChild
                                reset="onFocus"
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
