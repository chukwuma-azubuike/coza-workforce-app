import React from 'react';
import { Box, Button, Center, Pressable, Spinner, Text, VStack } from 'native-base';
import { Icon } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { TouchableOpacity } from 'react-native';
import useModal from '@hooks/modal/useModal';
import moment from 'moment';
import ModalAlertComponent from '@components/composite/modal-alert';
import { HomeContext } from '..';
import { useClockInMutation, useClockOutMutation } from '@store/services/attendance';
import useRole from '@hooks/role';
import { GeoCoordinates } from 'react-native-geolocation-service';
import If from '@components/composite/if-container';
import Utils from '@utils/index';
import { Alert } from 'react-native';

interface IClockButtonProps {
    isInRange: boolean;
    deviceCoordinates: GeoCoordinates;
    refreshLocation: () => Promise<void>;
    verifyRangeBeforeAction: (successCallback: () => any, errorCallback: () => any) => Promise<void>;
}

const ClockButton = ({ isInRange, refreshLocation, deviceCoordinates, verifyRangeBeforeAction }: IClockButtonProps) => {
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

    const [clockedOut, setClockedOut] = React.useState<boolean>(false);

    const [clockIn, { data: clockinData, error, isLoading }] = useClockInMutation();

    const [clockOut, { isLoading: clockOutLoading, error: clockOutError }] = useClockOutMutation();

    const { setModalState } = useModal();

    const handleClockin = async () => {
        const result = await clockIn({
            userId: user?.userId as string,
            clockIn: `${moment().unix()}`,
            clockOut: null,
            serviceId: latestServiceData?._id as string,
            coordinates: {
                lat: `${deviceCoordinates.latitude}`,
                long: `${deviceCoordinates.longitude}`,
            },
            campusId: user?.campus._id,
            departmentId: user?.department._id,
            roleId: user?.role._id,
        });

        if ('data' in result) {
            setModalState({
                duration: 3,
                render: (
                    <ModalAlertComponent
                        description={`You clocked in at ${moment().format('LT')}`}
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
                message: error?.data?.message || 'Oops something went wrong',
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
                            description={`You clocked out at ${moment().format('LT')}`}
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
                    message: clockOutError?.data?.message || 'Oops something went wrong',
                });
            }
        }
    };

    const disabled = isLatestServiceError || isLatestServiceLoading || clockedOut || latestAttendanceIsLoading;
    const clockedIn = !!latestAttendanceData?.length
        ? (!!clockinData?.clockIn || !!latestAttendanceData[0].clockIn) && isLatestServiceSuccess
        : false && isLatestServiceSuccess; // Truthiness should only be resolved from latest Attendance clock in record
    const canClockIn = isInRange && !!latestServiceData && !clockedIn;
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
            verifyRangeBeforeAction(
                () => handleClockOut(),
                () =>
                    setModalState({
                        duration: 6,
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
        refreshLocation();

        if (!isInRange) {
            setModalState({
                duration: 6,
                render: (
                    <ModalAlertComponent
                        description={'You are not within range of any campus!'}
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
    };

    return (
        <Pressable>
            {canClockIn && !disabled && (
                <LottieView
                    source={require('@assets/json/clock-button-animation.json')}
                    resizeMode="cover"
                    style={{
                        left: Utils.IOS16 ? -13 : -20,
                        top: Utils.IOS16 ? -13 : -20,
                        position: 'absolute',
                        width: 320,
                    }}
                    autoPlay
                    loop
                />
            )}
            <Box alignItems="center" shadow={7}>
                <Button
                    w={200}
                    h={200}
                    shadow={9}
                    borderRadius="full"
                    _isDisabled={disabled}
                    backgroundColor={
                        canClockIn && !disabled
                            ? 'primary.600'
                            : canClockOut
                            ? 'rose.400'
                            : disabled
                            ? 'gray.400'
                            : 'gray.400'
                    }
                >
                    <TouchableOpacity
                        disabled={disabled}
                        activeOpacity={0.6}
                        onPress={handlePress}
                        accessibilityRole="button"
                    >
                        <Center>
                            <If condition={isLoading || clockOutLoading}>
                                <Spinner color="white" size="lg" />
                            </If>
                            <If condition={!isLoading && !clockOutLoading}>
                                <VStack alignItems="center" space={4}>
                                    <Icon type="materialicons" name="touch-app" color="white" size={110} />
                                    <Text fontWeight="light" fontSize="md" color="white">
                                        {disabled ? '' : canClockIn ? 'CLOCK IN' : canClockOut ? 'CLOCK OUT' : ''}
                                    </Text>
                                </VStack>
                            </If>
                        </Center>
                    </TouchableOpacity>
                </Button>
            </Box>
        </Pressable>
    );
};

export default ClockButton;
