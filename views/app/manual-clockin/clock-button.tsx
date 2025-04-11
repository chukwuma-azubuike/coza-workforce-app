import React from 'react';
import { Box, Button, Center, Pressable, Spinner, Text, VStack } from 'native-base';
import { GeoCoordinates } from 'react-native-geolocation-service';
import { Icon } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { Alert, TouchableOpacity } from 'react-native';
import useModal from '@hooks/modal/useModal';
import moment from 'moment';
import ModalAlertComponent from '@components/composite/modal-alert';
import { useClockInMutation, useClockOutMutation, useGetAttendanceQuery } from '@store/services/attendance';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import Utils from '@utils/index';
import { useGetLatestServiceQuery } from '@store/services/services';
import { IThirdPartyUserDetails } from '.';
import useGeoLocation from '@hooks/geo-location';

interface IThirdPartyClockButton extends IThirdPartyUserDetails {
    isInRangeProp: boolean;
    deviceCoordinates: GeoCoordinates;
}

const ThirdPartyClockButton: React.FC<IThirdPartyClockButton> = ({
    userId,
    roleId,
    campusId,
    departmentId,
    deviceCoordinates,
    isInRangeProp: isInRange,
}) => {
    const {
        user: { campus },
    } = useRole();
    const { setModalState } = useModal();

    const { data: latestService } = useGetLatestServiceQuery(campus._id);

    const [clockIn, { isError, error, isSuccess, isLoading, reset: clockInReset }] = useClockInMutation();

    const { verifyRangeBeforeAction } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
    });

    const { data: latestAttendanceData } = useGetAttendanceQuery(
        {
            userId,
            serviceId: latestService?._id,
        },
        {
            skip: !userId,
            refetchOnMountOrArgChange: true,
        }
    );

    const [
        clockOut,
        {
            isError: isClockOutErr,
            isSuccess: clockOutSuccess,
            isLoading: clockOutLoading,
            reset: clockOutReset,
            error: clockOutError,
        },
    ] = useClockOutMutation();

    const handleClockout = () => {
        if (canClockOut) {
            verifyRangeBeforeAction(
                () => clockOut(latestAttendanceData[0]?._id as string),
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

    const handlePress = () => {
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
            clockIn({
                userId: userId,
                clockIn: `${moment().unix()}`,
                clockOut: null,
                serviceId: latestService?._id as string,
                coordinates: {
                    lat: `${deviceCoordinates.latitude}`,
                    long: `${deviceCoordinates.longitude}`,
                },
                campusId: campusId,
                departmentId: departmentId,
                roleId,
            });
            return;
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
                    onPress: handleClockout,
                },
            ]);
            return;
        }
    };

    React.useEffect(() => {
        let cleanUp = true;
        if (isSuccess && cleanUp) {
            setModalState({
                duration: 3,
                render: (
                    <ModalAlertComponent
                        description={`Clocked in at ${moment().format('h:mm A')}`}
                        status={isInRange ? 'success' : 'warning'}
                        iconType={'material-community'}
                        iconName={'timer-outline'}
                    />
                ),
            });
            clockInReset();
        }

        return () => {
            cleanUp = false;
        };
    }, [isSuccess]);

    React.useEffect(() => {
        let cleanUp = true;

        if (clockOutSuccess && cleanUp) {
            setModalState({
                render: (
                    <ModalAlertComponent
                        description={`Clocked out at ${moment().format('h:mm A')}`}
                        status={isInRange ? 'success' : 'warning'}
                        iconType={'material-community'}
                        iconName={'timer-outline'}
                    />
                ),
            });
            clockOutReset();
        }

        return () => {
            cleanUp = false;
        };
    }, [clockOutSuccess]);

    React.useEffect(() => {
        if (isClockOutErr) {
            setModalState({
                defaultRender: true,
                status: 'warning',
                message: clockOutError?.data?.message || 'Oops something went wrong',
            });
            clockOutReset();
        }
    }, [isClockOutErr]);

    React.useEffect(() => {
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'warning',
                message: error?.data?.message || 'Oops something went wrong',
            });
            clockInReset();
        }
    }, [isError]);

    React.useEffect(() => {
        if (isClockOutErr) {
            setModalState({
                defaultRender: true,
                status: 'warning',
                message: clockOutError?.data?.message || 'Oops something went wrong',
            });
            clockOutReset();
        }
    }, [isClockOutErr]);

    const clockedIn = latestAttendanceData?.length && latestAttendanceData[0].clockIn ? true : false;

    const canClockIn = isInRange && latestService && userId && !clockedIn;

    const canClockOut =
        latestAttendanceData?.length &&
        latestAttendanceData[0].clockIn &&
        !latestAttendanceData[0].clockOut &&
        isInRange;

    const disabled = !userId || !latestService;

    return (
        <Pressable>
            {canClockIn && (
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
                    isDisabled={disabled}
                    backgroundColor={
                        canClockIn ? 'primary.600' : canClockOut ? 'rose.400' : disabled ? 'gray.400' : 'gray.400'
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

export default React.memo(ThirdPartyClockButton);
