import React from 'react';
import {
    Box,
    Button,
    Center,
    Pressable,
    Spinner,
    Text,
    VStack,
} from 'native-base';
import { Icon } from '@rneui/themed';
import LottieView from 'lottie-react-native';
import { TouchableNativeFeedback } from 'react-native';
import useModal from '../../../hooks/modal/useModal';
import moment from 'moment';
import ModalAlertComponent from '../../../components/composite/modal-alert';
import { HomeContext } from '.';
import {
    useClockInMutation,
    useClockOutMutation,
} from '../../../store/services/attendance';
import useRole from '../../../hooks/role';
import { GeoCoordinates } from 'react-native-geolocation-service';
import If from '../../../components/composite/if-container';
import Utils from '../../../utils';

interface IClockButtonProps {
    isInRange: boolean;
    deviceCoordinates: GeoCoordinates;
}

const ClockButton = ({ isInRange, deviceCoordinates }: IClockButtonProps) => {
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

    const [clockIn, { isError, error, isSuccess, isLoading, data }] =
        useClockInMutation();

    const [
        clockOut,
        {
            isError: isClockOutErr,
            isSuccess: clockOutSuccess,
            isLoading: clockOutLoading,
            data: clockOutData,
            error: clockOutError,
        },
    ] = useClockOutMutation();

    const { setModalState } = useModal();

    React.useEffect(() => {
        let cleanUp = true;
        if (isSuccess && cleanUp) {
            setModalState({
                duration: 6,
                render: (
                    <ModalAlertComponent
                        description={`You clocked in at ${moment().format(
                            'LT'
                        )}`}
                        status={isInRange ? 'success' : 'warning'}
                        iconType={'material-community'}
                        iconName={'timer-outline'}
                    />
                ),
            });
        }

        return () => {
            cleanUp = false;
        };
    }, [isSuccess]);

    React.useEffect(() => {
        let cleanUp = true;

        if (clockOutSuccess && cleanUp) {
            setModalState({
                duration: 6,
                render: (
                    <ModalAlertComponent
                        description={`You clocked out at ${moment().format(
                            'LT'
                        )}`}
                        status={isInRange ? 'success' : 'warning'}
                        iconType={'material-community'}
                        iconName={'timer-outline'}
                    />
                ),
            });
        }

        return () => {
            cleanUp = false;
        };
    }, [clockOutSuccess]);

    React.useEffect(() => {
        if (isError) {
            setModalState({
                defaultRender: true,
                status: 'warning',
                message: error?.data.message || 'Oops something went wrong',
            });
        }
    }, [isError]);

    React.useEffect(() => {
        if (isClockOutErr) {
            setModalState({
                defaultRender: true,
                status: 'warning',
                message:
                    clockOutError?.data.message || 'Oops something went wrong',
            });
        }
    }, [isClockOutErr]);

    const clockedIn = latestAttendanceData?.clockIn ? true : false;

    const disabled =
        isLatestServiceError || isLatestServiceLoading || clockedOut;

    const canClockIn = isInRange && latestServiceData && !clockedIn;

    const canClockOut = clockedIn;

    const handlePress = () => {
        if (!isInRange) {
            setModalState({
                duration: 6,
                render: (
                    <ModalAlertComponent
                        description={'Your are not within range of any campus!'}
                        iconName={'warning-outline'}
                        iconType={'ionicon'}
                        status={'warning'}
                    />
                ),
            });
        }
        if (canClockIn) {
            clockIn({
                userId: user?.userId as string,
                clockIn: `${moment().unix()}`,
                clockOut: null,
                serviceId: latestServiceData?.id as string,
                coordinates: {
                    lat: `${deviceCoordinates.latitude}`,
                    long: `${deviceCoordinates.longitude}`,
                },
            });
        }
        if (canClockOut) {
            clockOut(latestAttendanceData?._id as string).then(res => {
                if (res.data) setClockedOut(true);
            });
        }
    };

    return (
        <Pressable>
            {canClockIn && (
                <LottieView
                    source={require('../../../assets/json/clock-button-animation.json')}
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
                        canClockIn
                            ? 'primary.600'
                            : canClockOut
                            ? 'rose.400'
                            : disabled
                            ? 'gray.400'
                            : 'gray.400'
                    }
                >
                    <TouchableNativeFeedback
                        disabled={disabled}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            '#000000BF',
                            true,
                            120
                        )}
                    >
                        <Center>
                            <If condition={isLoading || clockOutLoading}>
                                <Spinner color="white" size="lg" />
                            </If>
                            <If condition={!isLoading && !clockOutLoading}>
                                <VStack alignItems="center" space={4}>
                                    <Icon
                                        type="materialicons"
                                        name="touch-app"
                                        color="white"
                                        size={110}
                                    />
                                    <Text
                                        fontWeight="light"
                                        fontSize="md"
                                        color="white"
                                    >
                                        {disabled
                                            ? ''
                                            : canClockIn
                                            ? 'CLOCK IN'
                                            : canClockOut
                                            ? 'CLOCK OUT'
                                            : ''}
                                    </Text>
                                </VStack>
                            </If>
                        </Center>
                    </TouchableNativeFeedback>
                </Button>
            </Box>
        </Pressable>
    );
};

export default ClockButton;
