import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Icon } from '@rneui/themed';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Switch } from '~/components/ui/switch';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { IRoastNotificationPrefs } from '~/store/types';
import {
    useGetNotificationPreferencesQuery,
    useUpdateNotificationPreferencesMutation,
} from '~/store/services/roast-engagement';
import { localTimezone } from '~/hooks/roast-engagement';
import HourPicker from './HourPicker';

/**
 * Roast notification settings (US-1.6, D-10).
 *
 * Every switch here writes optimistically. A settings toggle that waits for a round trip
 * before it moves reads as broken, and every field on this screen is trivially reversible
 * — the failure case is the switch flicking back, which is honest.
 *
 * **There is no master "Reminders" switch**, and that is deliberate rather than an
 * omission: a custom reminder is something the worker asked for at a named minute, and a
 * global toggle that silently swallows it is the sort of bug people never report and never
 * forgive. Deleting the reminder is the disable action.
 */

const TOGGLES: Array<{ key: keyof IRoastNotificationPrefs; label: string; description: string }> = [
    { key: 'callDue', label: 'Call reminders', description: "When a guest you're assigned is due for a call." },
    { key: 'followUp', label: 'Follow-ups', description: "When it's been a while since you last spoke." },
    { key: 'invite', label: 'Invites', description: "Guests who haven't been asked to a service yet." },
    { key: 'note', label: 'Note prompts', description: 'A nudge to write up a call while it’s fresh.' },
    { key: 'progress', label: 'Progress', description: 'When a guest is ready to move to the next stage.' },
    { key: 'streak', label: 'Streak', description: 'The afternoon nudge when your streak is about to end.' },
];

const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
        return;
    }

    Linking.openSettings();
};

const NotificationSettings: React.FC = () => {
    const { data: prefs, isLoading } = useGetNotificationPreferencesQuery();
    const [updatePreferences] = useUpdateNotificationPreferencesMutation();

    const [permissionGranted, setPermissionGranted] = useState(true);
    const [picking, setPicking] = useState<'quietHoursStart' | 'quietHoursEnd' | null>(null);

    // Re-read on mount rather than trusting a cached value: the most common way to reach
    // this screen is straight back from OS settings, having just changed it.
    useEffect(() => {
        Notifications.getPermissionsAsync()
            .then(({ granted }) => setPermissionGranted(granted))
            .catch(() => setPermissionGranted(true));
    }, []);

    const patch = useCallback(
        (changes: Partial<IRoastNotificationPrefs>) => {
            // The zone travels with every write. The server schedules digests and quiet
            // hours in the worker's local time, and a worker who moves campus and never
            // touches this screen would otherwise keep their old city's morning.
            updatePreferences({ ...changes, timezone: localTimezone() });
        },
        [updatePreferences]
    );

    if (isLoading || !prefs) {
        return (
            <View className="flex-1 bg-background p-4 gap-3">
                {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                ))}
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
            {/* A card, not a toast. Somebody who has denied permission needs to be able to
                find the explanation again, and a toast is gone before they have read it. */}
            {!permissionGranted && (
                <Card className="mb-4 border-destructive">
                    <CardContent className="p-4 gap-2">
                        <View className="flex-row items-center gap-2">
                            <Icon type="feather" name="bell-off" size={16} color={THEME_CONFIG.error} />
                            <Text className="font-semibold">Notifications are off</Text>
                        </View>

                        <Text className="!text-sm text-muted-foreground">
                            Your phone is blocking notifications for this app, so none of the settings below can reach
                            you. Today and the home-screen widget still work.
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={openSystemSettings}
                            accessibilityRole="button"
                            className="h-11 px-4 mt-1 rounded-full bg-primary self-start justify-center"
                        >
                            <Text className="!text-sm text-primary-foreground dark:text-white font-medium">
                                Open settings
                            </Text>
                        </TouchableOpacity>
                    </CardContent>
                </Card>
            )}

            <Text className="!text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                What you hear about
            </Text>

            <Card>
                <CardContent className="p-0">
                    {TOGGLES.map(({ key, label, description }, index) => (
                        <View key={key}>
                            {index > 0 && <Separator />}
                            <View className="flex-row items-center gap-3 p-4">
                                <View className="flex-1 gap-0.5">
                                    <Text className="font-medium">{label}</Text>
                                    <Text className="!text-xs text-muted-foreground">{description}</Text>
                                </View>
                                <Switch checked={!!prefs[key]} onCheckedChange={checked => patch({ [key]: checked })} />
                            </View>
                        </View>
                    ))}
                </CardContent>
            </Card>

            <Text className="!text-xs font-semibold uppercase text-muted-foreground mb-2 mt-6 tracking-wide">
                Quiet hours
            </Text>

            <Card>
                <CardContent className="p-0">
                    <View className="flex-row items-center gap-3 p-4">
                        <View className="flex-1 gap-0.5">
                            <Text className="font-medium">Quiet hours</Text>
                            <Text className="!text-xs text-muted-foreground">
                                Nudges wait until quiet hours end. Reminders you set yourself still come through.
                            </Text>
                        </View>
                        <Switch
                            checked={prefs.quietHoursEnabled}
                            onCheckedChange={checked => patch({ quietHoursEnabled: checked })}
                        />
                    </View>

                    {prefs.quietHoursEnabled && (
                        <>
                            <Separator />
                            {(
                                [
                                    ['quietHoursStart', 'From'],
                                    ['quietHoursEnd', 'To'],
                                ] as Array<['quietHoursStart' | 'quietHoursEnd', string]>
                            ).map(([field, label]) => (
                                <TouchableOpacity
                                    key={field}
                                    activeOpacity={0.6}
                                    onPress={() => setPicking(field)}
                                    accessibilityRole="button"
                                    className="flex-row items-center justify-between p-4"
                                >
                                    <Text className="font-medium">{label}</Text>
                                    <View className="flex-row items-center gap-1">
                                        <Text className="!text-sm text-muted-foreground">
                                            {dayjs().hour(prefs[field]).minute(0).format('h:mm A')}
                                        </Text>
                                        <Icon
                                            type="feather"
                                            name="chevron-right"
                                            size={16}
                                            color={THEME_CONFIG.lightGray}
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </CardContent>
            </Card>

            <Text className="!text-xs font-semibold uppercase text-muted-foreground mb-2 mt-6 tracking-wide">
                Privacy
            </Text>

            <Card>
                <CardContent className="p-4 flex-row items-center gap-3">
                    <View className="flex-1 gap-0.5">
                        <Text className="font-medium">Hide guest names</Text>
                        <Text className="!text-xs text-muted-foreground">
                            Notifications and the home-screen widget show a count instead of a name, so nobody reading
                            over your shoulder learns who you're following up.
                        </Text>
                    </View>
                    <Switch
                        checked={prefs.hideGuestNames}
                        onCheckedChange={checked => patch({ hideGuestNames: checked })}
                    />
                </CardContent>
            </Card>

            <Text className={cn('!text-xs text-muted-foreground mt-6 text-center')}>
                Times are in {prefs.timezone || localTimezone()}.
            </Text>

            <HourPicker
                visible={picking !== null}
                title={picking === 'quietHoursEnd' ? 'Quiet hours end' : 'Quiet hours start'}
                value={picking ? prefs[picking] : 0}
                onSelect={hour => picking && patch({ [picking]: hour })}
                onClose={() => setPicking(null)}
            />
        </ScrollView>
    );
};

export default NotificationSettings;
