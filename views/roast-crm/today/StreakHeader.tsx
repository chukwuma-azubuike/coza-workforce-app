import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@rneui/themed';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import ROAST_COPY, { pluralise } from '~/constants/roast-copy';
import { ITaskCounts, IStreakState } from '~/store/types';
import StreakEmber from '../streak/StreakEmber';

interface StreakHeaderProps {
    streak: IStreakState | null;
    counts?: ITaskCounts;
    /** Shown when the feed is being rendered from cache rather than a live response. */
    staleLabel?: string;
}

/**
 * The Today header: the ember, the count, and what is actually due.
 *
 * Tappable through to `/roast-crm/streak` — the streak is the reward loop, and burying it
 * behind a menu is how a reward loop stops working. It is also the one place on the screen
 * that is allowed to be decorative.
 */
const StreakHeader: React.FC<StreakHeaderProps> = ({ streak, counts, staleLabel }) => {
    const current = streak?.current ?? 0;
    const isAtRisk = !!streak?.isAtRisk;

    return (
        <View className="gap-3 pb-2">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/roast-crm/streak' as any)}
                accessibilityRole="button"
                // The ember is hidden from assistive tech; this label is the whole header.
                accessibilityLabel={`${pluralise(current, 'day')} streak, ${
                    current === 0 ? 'not started' : isAtRisk ? 'at risk' : 'active'
                }. Open streak details.`}
                className="flex-row items-center gap-3"
            >
                <StreakEmber current={current} isAtRisk={isAtRisk} size={52} />

                <View className="flex-1">
                    <Text className="!text-3xl font-bold">{current}</Text>
                    <Text className="!text-sm text-muted-foreground">
                        {current === 0
                            ? 'Check in today to start your streak.'
                            : isAtRisk
                              ? ROAST_COPY.widget.footerAtRisk
                              : ROAST_COPY.widget.footerHealthy(current)}
                    </Text>
                </View>

                <Icon type="feather" name="chevron-right" size={18} color={THEME_CONFIG.lightGray} />
            </TouchableOpacity>

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    {!!counts && (counts.due > 0 || counts.overdue > 0) && (
                        <>
                            <Text className="!text-sm text-muted-foreground">
                                {pluralise(counts.due, 'due', 'due')}
                            </Text>
                            {counts.overdue > 0 && (
                                <>
                                    <Text className="!text-sm text-muted-foreground">·</Text>
                                    <Text className={cn('!text-sm font-semibold text-destructive')}>
                                        {counts.overdue} overdue
                                    </Text>
                                </>
                            )}
                        </>
                    )}
                </View>

                {/* The only entry point to notification settings that every worker can
                    reach — the Roast settings tab is admin-only and the app's own settings
                    screen is still a stub. Somebody who wants the nudges to stop needs to
                    be able to find this on the screen the nudges brought them to. */}
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => router.push('/roast-crm/notification-settings' as any)}
                    accessibilityRole="button"
                    accessibilityLabel="Notification settings"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-1"
                >
                    <Icon type="feather" name="sliders" size={16} color={THEME_CONFIG.lightGray} />
                </TouchableOpacity>
            </View>

            {!!staleLabel && (
                <View className="flex-row items-center gap-1.5">
                    <Icon type="feather" name="cloud-off" size={12} color={THEME_CONFIG.lightGray} />
                    <Text className="!text-xs text-muted-foreground">{staleLabel}</Text>
                </View>
            )}
        </View>
    );
};

export default StreakHeader;
