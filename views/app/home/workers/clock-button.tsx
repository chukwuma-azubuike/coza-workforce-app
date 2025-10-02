import { Text } from '~/components/ui/text';
import React from 'react';
import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import useModal from '~/hooks/modal/useModal';
import dayjs from 'dayjs';
import ModalAlertComponent from '~/components/composite/modal-alert';
import { HomeContext } from '..';
import { useClockInMutation, useClockOutMutation } from '~/store/services/attendance';
import useRole from '~/hooks/role';
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
import * as Haptics from 'expo-haptics';

interface IClockButtonProps {
    isInRange: boolean;
    onSuccess?: () => void;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    verifyRangeBeforeAction: (successCallback: () => any, errorCallback: () => any) => Promise<void>;
}

const ClockButton: React.FC<IClockButtonProps> = ({
    isInRange,
    onSuccess,
    refreshLocation,
    deviceCoordinates,
    verifyRangeBeforeAction,
}) => {
    const {
        latestService: {
            data: latestServiceData,
            isError: isLatestServiceError,
            isSuccess: isLatestServiceSuccess,
            isLoading: isLatestServiceLoading,
        },
        latestAttendance: { latestAttendanceData, latestAttendanceIsLoading },
    } = React.useContext(HomeContext);

    const { user } = useRole();
    const { setModalState } = useModal();
    const [clockedOut, setClockedOut] = React.useState<boolean>(false);
    const [clockIn, { data: clockinData, error, isLoading }] = useClockInMutation();
    const [clockOut, { isLoading: clockOutLoading, error: clockOutError }] = useClockOutMutation();

    const handleClockin = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const result = await clockIn({
            userId: user?.userId as string,
            clockIn: `${dayjs().unix()}`,
            clockOut: null,
            serviceId: latestServiceData?._id as string,
            coordinates: {
                lat: `${deviceCoordinates.latitude}`,
                long: `${deviceCoordinates.longitude}`,
            },
            CGWCId: latestServiceData?.CGWCId,
            isCGWC: !!latestServiceData?.CGWCId,
            campusId: user?.campus._id,
            departmentId: user?.department._id,
            roleId: user?.role._id,
        });

        if ('data' in result) {
            setModalState({
                duration: 1,
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
    const canClockIn = isInRange && assertClockinStartTime && !clockedIn;
    const canClockOut =
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
            verifyRangeBeforeAction(handleClockOut, () =>
                setModalState({
                    duration: 1,
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
            .then(res => {
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
                        duration: 1,
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
                    return handleClockin();
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
                        top: -40,
                        left: -40,
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
                        '!w-56 !h-56 shadow-md !rounded-full disabled:opacity-100',
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
                                <Icon size={110} color="white" name="touch-app" type="materialicons" />
                                <Text className={cn('font-light !text-lg', disabled && 'opacity-0')}>
                                    {canClockIn ? 'CLOCK IN' : canClockOut ? 'CLOCK OUT' : ''}
                                </Text>
                            </View>
                        </If>
                    </View>
                </Button>
            </View>
        </View>
    );
};

export default React.memo(ClockButton);
