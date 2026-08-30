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
import { IRoastNotificationPrefs, IRoastValidationError } from '~/store/types';
import {
    useGetNotificationPreferencesQuery,
    useUpdateNotificationPreferencesMutation,
} from '~/store/services/roast-engagement';
import { isWithinQuietHours, localTimezone } from '~/hooks/roast-engagement';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { roastEngagementActions, roastEngagementSelectors } from '~/store/actions/roast-engagement';
import { MIRROR_LABELS, MIRROR_PROVIDER, mirrorDefaultOptions } from '~/utils/device-mirror';
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
    {
        key: 'streak',
        label: 'Streak',
        description: 'Two nudges — afternoon and evening — when your streak is about to end.',
    },
];

/**
 * Every hour-valued preference on this screen.
 *
 * Two of them are configurable delivery times and two are the quiet-hours bounds. The
 * streak at-risk hours are deliberately **not** here — see `STREAK_AT_RISK_HOURS`.
 */
type HourField = 'quietHoursStart' | 'quietHoursEnd' | 'morningDigestHour' | 'eveningDigestHour';

const PICKER_TITLES: Record<HourField, string> = {
    quietHoursStart: 'Quiet hours start',
    quietHoursEnd: 'Quiet hours end',
    morningDigestHour: 'Morning digest',
    eveningDigestHour: 'Evening prompt',
};

const formatHour = (hour: number): string => dayjs().hour(hour).minute(0).format('h:mm A');

/**
 * Pulls something a worker can act on out of a rejected `PATCH`.
 *
 * The server returns a field-keyed `errors` map, and that map is the useful half — a
 * message like "morningDigestHour must be an hour between 0 and 23." names the control
 * that refused. Falls back to the envelope's `message`, then to a generic line, because a
 * silent revert is the one outcome that must not happen: the optimistic update has already
 * snapped the row back, and with no explanation that reads as the setting being broken.
 */
const messageFromError = (error: unknown): string => {
    const data = (error as { data?: Partial<IRoastValidationError> } | undefined)?.data;
    const fieldErrors = Object.values(data?.errors ?? {});

    return fieldErrors[0] ?? data?.message ?? "That didn't save. Check your connection and try again.";
};

/** One tappable hour row, with room for a warning underneath it. */
const HourRow: React.FC<{ label: string; hour: number; hint?: string; onPress: () => void }> = ({
    label,
    hour,
    hint,
    onPress,
}) => (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} accessibilityRole="button" className="p-4 gap-1">
        <View className="flex-row items-center justify-between">
            <Text className="font-medium">{label}</Text>
            <View className="flex-row items-center gap-1">
                <Text className="!text-sm text-muted-foreground">{formatHour(hour)}</Text>
                <Icon type="feather" name="chevron-right" size={16} color={THEME_CONFIG.lightGray} />
            </View>
        </View>

        {!!hint && <Text className="text-sm text-amber-600 dark:text-amber-500 pr-6">{hint}</Text>}
    </TouchableOpacity>
);

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

    const dispatch = useAppDispatch();
    const mirrorDefault = useAppSelector(roastEngagementSelectors.selectMirrorDefault);

    /**
     * Device-local, and so not part of `patch` below.
     *
     * The providers on offer differ by platform — "Reminders" is an iOS concept with no
     * Android counterpart — so a preference that synced to the server would follow a
     * worker onto a handset where it means nothing.
     *
     * `mirrorDefaultOptions` rather than `availableProviders`, because this screen has no
     * due time to test the alarm's 24-hour horizon against. The horizon is applied per
     * reminder instead, by `resolveMirrorTarget` in the sheet, which falls back to the
     * calendar and says so.
     */
    const mirrorOptions = mirrorDefaultOptions();

    const [permissionGranted, setPermissionGranted] = useState(true);
    const [picking, setPicking] = useState<HourField | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Re-read on mount rather than trusting a cached value: the most common way to reach
    // this screen is straight back from OS settings, having just changed it.
    useEffect(() => {
        Notifications.getPermissionsAsync()
            .then(({ granted }) => setPermissionGranted(granted))
            .catch(() => setPermissionGranted(true));
    }, []);

    const patch = useCallback(
        async (changes: Partial<IRoastNotificationPrefs>) => {
            setSaveError(null);

            try {
                // The zone travels with every write. The server schedules digests and quiet
                // hours in the worker's local time, and a worker who moves campus and never
                // touches this screen would otherwise keep their old city's morning.
                await updatePreferences({ ...changes, timezone: localTimezone() }).unwrap();
            } catch (error) {
                // The optimistic update has already reverted by the time this runs, so the
                // control is showing the truth again — what it is not showing is *why*, and
                // an unexplained snap-back is indistinguishable from a broken setting.
                setSaveError(messageFromError(error));
            }
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

    /**
     * The warning for a delivery hour that falls inside quiet hours.
     *
     * Shown at the point of choosing, because the alternative is the worker discovering it
     * by *not* being notified — the one failure mode with no signal at all. The server
     * accepts the combination deliberately, so this warns and does not block.
     */
    const quietHoursHint = (hour: number): string | undefined =>
        prefs.quietHoursEnabled && isWithinQuietHours(hour, prefs.quietHoursStart, prefs.quietHoursEnd)
            ? `Quiet hours start at ${formatHour(prefs.quietHoursStart)}, so this won't push. It still lands in your inbox.`
            : undefined;

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

            {/* Sits above everything rather than beside the control that failed: the
                optimistic revert has already moved that control back, so the message is
                explaining a change the worker just watched undo itself. */}
            {!!saveError && (
                <Card className="mb-4 border-destructive">
                    <CardContent className="p-4 flex-row items-start gap-2">
                        <Icon type="feather" name="alert-circle" size={16} color={THEME_CONFIG.error} />
                        <Text className="!text-sm flex-1">{saveError}</Text>
                    </CardContent>
                </Card>
            )}

            <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
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
                                    <Text className="text-sm text-muted-foreground line-clamp-none">
                                        {description}
                                    </Text>
                                </View>
                                <Switch checked={!!prefs[key]} onCheckedChange={checked => patch({ [key]: checked })} />
                            </View>
                        </View>
                    ))}
                </CardContent>
            </Card>

            <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2 mt-6 tracking-wide">
                When they arrive
            </Text>

            <Card>
                <CardContent className="p-0">
                    <View className="px-4 pt-4 gap-0.5">
                        <Text className="font-medium">Your two daily digests</Text>
                        <Text className="text-sm text-muted-foreground line-clamp-none">
                            Everything above is gathered into a morning digest and an evening prompt, so you get two
                            nudges a day instead of five. Reminders you set yourself are not affected.
                        </Text>
                    </View>

                    <HourRow
                        label="Morning digest"
                        hour={prefs.morningDigestHour}
                        hint={quietHoursHint(prefs.morningDigestHour)}
                        onPress={() => setPicking('morningDigestHour')}
                    />

                    <Separator />

                    <HourRow
                        label="Evening prompt"
                        hour={prefs.eveningDigestHour}
                        hint={quietHoursHint(prefs.eveningDigestHour)}
                        onPress={() => setPicking('eveningDigestHour')}
                    />

                    {/* Both halves of this matter. The dedupe receipt is keyed on the day,
                        not the hour, so moving the time after today's digest has already
                        gone gets you nothing more today — without saying so, a worker who
                        changes it at noon and hears nothing concludes it is broken. And
                        delivery is evaluated on a quarter-hour tick, so promising the
                        minute would be a promise the server cannot keep. */}
                    <Text className="text-sm text-muted-foreground px-4 pb-4 line-clamp-none">
                        Takes effect from your next digest — changing the time won&apos;t re-send today&apos;s. Digests
                        arrive within about 15 minutes of the hour.
                    </Text>
                </CardContent>
            </Card>

            <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2 mt-6 tracking-wide">
                Quiet hours
            </Text>

            <Card>
                <CardContent className="p-0">
                    <View className="flex-row items-center gap-3 p-4">
                        <View className="flex-1 gap-0.5">
                            <Text className="font-medium">Quiet hours</Text>
                            <Text className="text-sm text-muted-foreground line-clamp-none">
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
                                ] as Array<[HourField, string]>
                            ).map(([field, label]) => (
                                <HourRow
                                    key={field}
                                    label={label}
                                    hour={prefs[field]}
                                    onPress={() => setPicking(field)}
                                />
                            ))}
                        </>
                    )}
                </CardContent>
            </Card>

            <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2 mt-6 tracking-wide">
                Privacy
            </Text>

            <Card>
                <CardContent className="p-4 flex-row items-center gap-3">
                    <View className="flex-1 gap-0.5">
                        <Text className="font-medium">Hide guest names</Text>
                        <Text className="text-sm text-muted-foreground line-clamp-none">
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

            <Text className="text-sm font-semibold uppercase text-muted-foreground mb-2 mt-6 tracking-wide">
                On this phone
            </Text>

            <Card>
                <CardContent className="p-4 gap-3">
                    <View className="gap-0.5">
                        <Text className="font-medium">Also add reminders to</Text>
                        <Text className="text-sm text-muted-foreground line-clamp-none">
                            New reminders get a copy in your phone&apos;s own app, so they survive the notification
                            being swiped away. You can change this on any single reminder.
                        </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                        {[null, ...mirrorOptions].map(provider => {
                            const isSelected = mirrorDefault === provider;

                            return (
                                <TouchableOpacity
                                    key={provider ?? 'none'}
                                    activeOpacity={0.6}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                    onPress={() => dispatch(roastEngagementActions.setMirrorDefault(provider))}
                                    className={cn(
                                        'h-10 px-4 rounded-full border justify-center',
                                        isSelected ? 'bg-primary border-primary' : 'border-border'
                                    )}
                                >
                                    <Text
                                        className={cn(
                                            '!text-sm',
                                            isSelected && 'text-primary-foreground dark:text-white'
                                        )}
                                    >
                                        {provider ? MIRROR_LABELS[provider] : 'Nothing'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* The alarm breaks both halves of the ordinary promise — the horizon and the
                        cleanup — so it gets its own paragraph rather than a clause appended to a
                        sentence that would then be false. */}
                    {mirrorDefault === MIRROR_PROVIDER.ANDROID_ALARM ? (
                        <Text className="!text-[11px] text-muted-foreground line-clamp-none">
                            An alarm can&apos;t hold a date, so this only applies to reminders due within a day.
                            Anything further out gets a calendar entry instead, and the reminder itself shows you which.
                            Your clock keeps an alarm once it has one — Roast can&apos;t take that back, so you&apos;ll
                            dismiss it yourself. Calendar copies are removed when you complete or delete the reminder,
                            and when you sign out.
                        </Text>
                    ) : (
                        <Text className="!text-[11px] text-muted-foreground line-clamp-none">
                            Copies are removed when you complete or delete the reminder, and when you sign out.
                            {mirrorDefault === MIRROR_PROVIDER.CALENDAR
                                ? ' Calendar entries sync wherever that calendar syncs.'
                                : ''}
                        </Text>
                    )}
                </CardContent>
            </Card>

            <Text className={cn('text-sm text-muted-foreground mt-6 text-center')}>
                Times are in {prefs.timezone || localTimezone()}.
            </Text>

            <HourPicker
                visible={picking !== null}
                title={picking ? PICKER_TITLES[picking] : ''}
                value={picking ? prefs[picking] : 0}
                onSelect={hour => picking && patch({ [picking]: hour })}
                onClose={() => setPicking(null)}
            />
        </ScrollView>
    );
};

export default NotificationSettings;
