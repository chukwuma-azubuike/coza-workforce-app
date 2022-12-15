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
    } = React.useContext(HomeContext);

    const { user } = useRole();

    const [clockIn, { isError, isSuccess, isLoading, data }] =
        useClockInMutation();

    const [
        clockOut,
        {
            isError: clockOutErr,
            isSuccess: clockOutSuccess,
            isLoading: clockOutLoading,
            data: clockOutData,
        },
    ] = useClockOutMutation();

    const { setModalState } = useModal();

    const [clockedIn, setClockedIn] = React.useState<boolean>(false);

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
        if (!clockedIn && isInRange && !clockedIn) {
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

        if (clockedIn) {
            clockOut(data?.id as string);
        }
    };

    React.useEffect(() => {
        let cleanUp = true;
        if (isSuccess && cleanUp) {
            setClockedIn(true);
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
            setClockedIn(false);
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

    const disabled = isLatestServiceError || isLatestServiceLoading;

    return (
        <Pressable>
            {isInRange && !clockedIn && isSuccess && (
                <LottieView
                    source={require('../../../assets/json/clock-button-animation.json')}
                    resizeMode="cover"
                    style={{
                        position: 'absolute',
                        width: 320,
                        left: -20,
                        top: -20,
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
                        disabled
                            ? 'gray.400'
                            : clockedIn
                            ? 'rose.400'
                            : 'primary.600'
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
                                        {isSuccess ? clockedIn ? 'CLOCK OUT' : 'CLOCK IN' : ''}
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
