import React, { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import { useClockInMutation, useClockOutMutation } from '@store/services/attendance';
import { THEME_CONFIG } from '@config/appConfig';
import { GeoCoordinates } from '~/hooks/geo-location';
import { Icon } from '@rneui/themed';
import { Card } from '~/components/ui/card';

interface GHClockCardProps {
    isInRange: boolean;
    deviceCoordinates: GeoCoordinates;
    service?: { _id?: string; name?: string; campus?: { campusName?: string } };
    latestAttendanceData?: any[];
    latestAttendanceIsLoading?: boolean;
    verifyRangeBeforeAction: (ok: () => any, err: () => any) => Promise<void>;
}

const GHClockCard: React.FC<GHClockCardProps> = ({
    isInRange,
    deviceCoordinates,
    service,
    latestAttendanceData,
    latestAttendanceIsLoading,
    verifyRangeBeforeAction,
}) => {
    const { user } = useRole();

    const [clockIn, { isLoading: clockInLoading }] = useClockInMutation();
    const [clockOut, { isLoading: clockOutLoading }] = useClockOutMutation();

    const isLoading = clockInLoading || clockOutLoading || !!latestAttendanceIsLoading;
    const alreadyClockedIn = !!latestAttendanceData?.length;
    const alreadyClockedOut = !!latestAttendanceData?.[0]?.clockOut;
    const canClockIn = !alreadyClockedIn && !!service?._id;
    const canClockOut = alreadyClockedIn && !alreadyClockedOut;
    const isDisabled = isLoading || alreadyClockedOut || !service?._id;

    const clockInTime = latestAttendanceData?.[0]?.clockIn
        ? dayjs.unix(Number(latestAttendanceData[0].clockIn)).format('h:mm A')
        : null;
    const clockOutTime = latestAttendanceData?.[0]?.clockOut
        ? dayjs.unix(Number(latestAttendanceData[0].clockOut)).format('h:mm A')
        : null;

    const headerLabel = canClockIn
        ? 'TAP TO CLOCK IN'
        : canClockOut
            ? 'TAP TO CLOCK OUT'
            : alreadyClockedOut
                ? "YOU'RE DONE FOR TODAY"
                : 'NO ACTIVE SERVICE';

    const statusMsg = isInRange
        ? `You're inside the ${service?.campus?.campusName ?? 'campus'} geo-fence.`
        : "You're outside the geo-fence.";

    const btnLabel = canClockIn
        ? 'Clock me in'
        : canClockOut
            ? 'Clock out'
            : alreadyClockedOut
                ? 'Clocked out'
                : 'No service';

    const glow = useSharedValue(0);

    useEffect(() => {
        if (canClockIn && isInRange) {
            glow.value = withRepeat(
                withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 1100 })),
                -1,
                false
            );
        } else {
            glow.value = 0;
        }
    }, [canClockIn, isInRange]);

    const glowStyle = useAnimatedStyle(() => ({
        shadowColor: THEME_CONFIG.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: interpolate(glow.value, [0, 1], [0.25, 0.7]),
        shadowRadius: interpolate(glow.value, [0, 1], [6, 22]),
        elevation: interpolate(glow.value, [0, 1], [3, 14]),
    }));

    const handleClockIn = useCallback(async () => {
        if (!user?.userId || !service?._id) return;
        await clockIn({
            userId: user.userId,
            clockIn: `${dayjs().unix()}`,
            clockOut: null,
            serviceId: service._id,
            coordinates: {
                lat: `${deviceCoordinates?.latitude ?? 0}`,
                long: `${deviceCoordinates?.longitude ?? 0}`,
            },
            roleId: user.role?._id,
            campusId: user.campus?._id,
            departmentId: user.department?._id,
        } as any);
    }, [user, service, clockIn, deviceCoordinates]);

    const handleClockOut = useCallback(() => {
        if (!latestAttendanceData?.[0]) return;
        Alert.alert('Confirm clock out', 'Are you sure you want to clock out now?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes',
                onPress: async () => {
                    await clockOut({
                        attendanceId: latestAttendanceData[0]._id,
                        clockOut: `${dayjs().unix()}`,
                        userId: user?.userId,
                    } as any);
                },
            },
        ]);
    }, [latestAttendanceData, clockOut, user]);

    const handlePress = useCallback(() => {
        verifyRangeBeforeAction(
            () => {
                if (canClockIn) handleClockIn();
                else if (canClockOut) handleClockOut();
            },
            () => { }
        );
    }, [verifyRangeBeforeAction, canClockIn, canClockOut, handleClockIn, handleClockOut]);

    return (
        <Card>
            <LinearGradient
                colors={[THEME_CONFIG.primary, THEME_CONFIG.primaryVeryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.accent}
            />
            <View className="flex-1 p-4 gap-3">
                <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={16} color={THEME_CONFIG.primary} />
                    <Text className="text-sm font-bold tracking-widest text-primary">
                        {headerLabel}
                    </Text>
                </View>

                <View className="gap-0.5">
                    <Text className="font-semibold">{statusMsg}</Text>
                    <Text className="text-muted-foreground">
                        {service?.name ?? 'Service window unavailable'}
                    </Text>
                </View>

                {clockInTime && (
                    <View className="flex-row">
                        <Text className="text-muted-foreground">
                            In: <Text className="font-semibold text-green-600 dark:text-green-400">{clockInTime}</Text>
                        </Text>
                        {clockOutTime && (
                            <Text className="text-muted-foreground">
                                Out: <Text className="font-semibold text-muted-foreground">{clockOutTime}</Text>
                            </Text>
                        )}
                    </View>
                )}

                {!alreadyClockedOut && (
                    <Button
                        size="sm"
                        isLoading={isLoading}
                        disabled={isDisabled}
                        onPress={handlePress}
                        variant={canClockOut ? 'destructive' : 'default'}
                        loadingText={clockInLoading ? 'Clocking in...' : 'Clocking out...'}
                    >
                        {btnLabel}
                    </Button>
                )}

                {alreadyClockedOut && (
                    <View className="items-center py-1">
                        <Text className="!text-sm font-medium text-green-600 dark:text-green-400">
                            Attendance complete ✓
                        </Text>
                    </View>
                )}

                <View>
                    <Button
                        size="sm"
                        variant="link"
                        onPress={() => router.push('/manual-clock-in' as any)}
                        className="!h-auto items-start flex-auto max-w-[50%] px-0"
                        endIcon={<Ionicons name="chevron-forward" size={16} color={THEME_CONFIG.primary} />}
                    >
                        Clock in someone
                    </Button>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 0.5,
        overflow: 'hidden',
    },
    accent: {
        width: 4,
    },
});

export default React.memo(GHClockCard);
