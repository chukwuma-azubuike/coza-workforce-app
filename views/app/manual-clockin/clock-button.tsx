import { Text } from '~/components/ui/text';
import React from 'react';
import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import useModal from '~/hooks/modal/useModal';
import dayjs from 'dayjs';
import ModalAlertComponent from '~/components/composite/modal-alert';
import { useClockInMutation, useClockOutMutation, useGetAttendanceQuery } from '~/store/services/attendance';
import { GeoCoordinates } from '~/hooks/geo-location';
import If from '~/components/composite/if-container';
import Utils from '~/utils';
import { Alert } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import openLocationSettings from '~/utils/openLocationSettings';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import Loading from '~/components/atoms/loading';
import { Icon } from '@rneui/themed';
import { useGetLatestServiceQuery } from '~/store/services/services';
import { IUser } from '~/store/types';
import * as Haptics from 'expo-haptics';

interface IClockButtonProps {
    isInRange: boolean;
    onSuccess?: () => void;
    campusId: string;
    user: IUser;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    verifyRangeBeforeAction: (successCallback: () => any, errorCallback: () => any) => Promise<void>;
}

const ClockButton: React.FC<IClockButtonProps> = ({
    user,
    isInRange,
    onSuccess,
    campusId,
    refreshLocation,
    deviceCoordinates,
    verifyRangeBeforeAction,
}) => {
    const { setModalState } = useModal();
    const [clockedOut, setClockedOut] = React.useState<boolean>(false);
    const [clockIn, { data: clockinData, error, isLoading }] = useClockInMutation();
    const [clockOut, { isLoading: clockOutLoading, error: clockOutError }] = useClockOutMutation();

    const {
        data: latestServiceData,
        isLoading: isLatestServiceLoading,
        isError: isLatestServiceError,
        isSuccess: isLatestServiceSuccess,
    } = useGetLatestServiceQuery(campusId);

    const { data: latestAttendanceData, isLoading: latestAttendanceIsLoading } = useGetAttendanceQuery({
        userId: user?._id,
        serviceId: latestServiceData?._id,
        limit: 1,
    });

    const handleClockin = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const result = await clockIn({
                userId: user?._id as string,
                clockIn: `${dayjs().unix()}`,
                clockOut: null,
                serviceId: latestServiceData?._id as string,
                coordinates: {
                    lat: `${deviceCoordinates.latitude}`,
                    long: `${deviceCoordinates.longitude}`,
                },
                campusId: user?.campusId as string,
                departmentId: user?.departmentId as string,
                roleId: user?.roleId,
            });

            if ('data' in result) {
                setModalState({
                    duration: 2,
                    render: (
                        <ModalAlertComponent
                            description={`You clocked in at ${dayjs().format('hh:mm A')}`}
                            status={isInRange ? 'success' : 'warning'}
                            iconType={'material-community'}
                            iconName={'timer-outline'}
                        />
                    ),
                });
                onSuccess && onSuccess();
            }

            if ('error' in result) {
                setModalState({
                    defaultRender: true,
                    status: 'warning',
                    message: (error as any)?.data?.message || 'Oops something went wrong',
                });
            }
        } catch (error) {}
    };

    const handleClockOut = async () => {
        if (!!latestAttendanceData?.length) {
            const result = await clockOut(latestAttendanceData[0]._id as string);

            if ('data' in result) {
                setClockedOut(true);
                setModalState({
                    render: (
                        <ModalAlertComponent
                            description={`You clocked out at ${dayjs().format('hh:mm A')}`}
                            status={isInRange ? 'success' : 'warning'}
                            iconType={'material-community'}
                            iconName={'timer-outline'}
                        />
                    ),
                });
            }

            if ('error' in result) {
                setModalState({
                    defaultRender: true,
                    status: 'warning',
                    message: (clockOutError as any)?.data?.message || 'Oops something went wrong',
                });
            }
        }
    };

    const assertClockinStartTime = !!latestServiceData
        ? dayjs().diff(dayjs(latestServiceData?.clockInStartTime)) > 0
        : false;
    const disabled = isLatestServiceError || isLatestServiceLoading || clockedOut || latestAttendanceIsLoading;
    const clockedIn = !!latestAttendanceData?.length
        ? (!!clockinData?.clockIn || !!latestAttendanceData[0].clockIn) && isLatestServiceSuccess
        : false && isLatestServiceSuccess; // Truthiness should only be resolved from latest Attendance clock in record
    const canClockIn = isInRange && assertClockinStartTime && !clockedIn && !!user;
    const canClockOut =
        !!user &&
        latestAttendanceData?.length &&
        latestAttendanceData[0].clockIn &&
        !latestAttendanceData[0].clockOut &&
        isInRange;

    React.useEffect(() => {
        if (latestAttendanceData && !latestAttendanceData[0]?.clockIn) {
            setClockedOut(false);
        }
    }, [latestAttendanceData]);

    const handleVerifyBeforeClockout = () => {
        if (canClockOut) {
            verifyRangeBeforeAction(
                () => handleClockOut(),
                () =>
                    setModalState({
                        duration: 2,
                        render: (
                            <ModalAlertComponent
                                description={'You are not within range of any campus!'}
                                iconName={'warning-outline'}
                                iconType={'ionicon'}
                                status={'warning'}
                            />
                        ),
                    })
            );
            return;
        }
    };

    const handlePress = async () => {
        if (!assertClockinStartTime) {
            return Alert.alert(
                `${!!latestServiceData?.CGWCId ? 'Session' : 'Service'} Not Started`,
                `Clock in for this ${
                    !!latestServiceData?.CGWCId ? 'session' : 'service'
                } has not yet started, kindly try again ${
                    !!latestServiceData ? `by ${dayjs(latestServiceData?.clockInStartTime).format('h:mm A')}` : 'later'
                }.`
            );
        }

        Utils.checkLocationPermission(refreshLocation)
            .then(async res => {
                if (res === RESULTS.DENIED || res === RESULTS.BLOCKED || res === RESULTS.UNAVAILABLE) {
                    Alert.alert(
                        'Location access needed',
                        'Please ensure that you have granted this app location access in your device settings.',
                        [
                            { text: 'Cancel', style: 'destructive' },
                            { text: 'Go to settings', style: 'default', onPress: openLocationSettings },
                        ]
                    );
                    return;
                }
                if (!isInRange && (res === RESULTS.GRANTED || res === RESULTS.LIMITED)) {
                    setModalState({
                        duration: 2,
                        render: (
                            <ModalAlertComponent
                                description={
                                    'You are not within range of any campus! Please check Google Maps to confirm your actual GPS location.'
                                }
                                iconName={'warning-outline'}
                                iconType={'ionicon'}
                                status={'warning'}
                            />
                        ),
                    });
                    return;
                }

                if (canClockIn) {
                    return await handleClockin();
                }

                if (canClockOut && latestAttendanceData) {
                    Alert.alert('Confirm clock out', 'Are you sure you want to clock out now?', [
                        {
                            text: 'No',
                            style: 'destructive',
                        },
                        {
                            text: 'Yes',
                            style: 'default',
                            onPress: handleVerifyBeforeClockout,
                        },
                    ]);
                    return;
                }
            })
            .catch(err => {});
    };

    return (
        <View className="items-center">
            {canClockIn && !disabled && (
                <LottieView
                    loop
                    autoPlay
                    resizeMode="cover"
                    style={{
                        top: -42,
                        left: 63,
                        width: 320,
                        height: 320,
                        position: 'absolute',
                    }}
                    source={require('~/assets/json/clock-button-animation.json')}
                />
            )}

            <View className="items-center">
                <Button
                    onPress={handlePress}
                    disabled={disabled}
                    accessibilityRole="button"
                    className={cn(
                        '!w-56 !h-56 shadow-md !rounded-full',
                        canClockIn && !disabled
                            ? 'bg-primary'
                            : canClockOut
                              ? ' bg-rose-400'
                              : disabled
                                ? 'bg-gray-400'
                                : 'bg-gray-400'
                    )}
                >
                    <View className="flex-1 justify-center items-center">
                        <If condition={isLoading || clockOutLoading}>
                            <Loading spinnerProps={{ size: 'large' }} />
                        </If>
                        <If condition={!isLoading && !clockOutLoading}>
                            <View className="items-center gap-4 flex-1 justify-center">
                                <Icon
                                    size={110}
                                    color="white"
                                    name="touch-app"
                                    type="materialicons"
                                    className={cn(disabled && 'mb-6')}
                                />
                                {!disabled && (
                                    <Text className="font-light">
                                        {canClockIn ? 'CLOCK IN' : canClockOut ? 'CLOCK OUT' : ''}
                                    </Text>
                                )}
                            </View>
                        </If>
                    </View>
                </Button>
            </View>
        </View>
    );
};

export default React.memo(ClockButton);
