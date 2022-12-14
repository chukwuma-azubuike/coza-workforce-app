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
        if (!clockedIn && isInRange) {
            clockIn({
                userId: user?.userId as string,
                clockIn: `${moment().unix()}`,
                clockOut: null,
                serviceId: latestServiceData?._id as string,
                coordinates: {
                    lat: `${deviceCoordinates.latitude}`,
                    long: `${deviceCoordinates.longitude}`,
                },
            });
        }

        if (clockedIn) {
            clockOut(data?._id as string);
        }
    };

    React.useEffect(() => {
        if (isSuccess) {
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
        if (clockOutSuccess) {
            setClockedIn(false);
        }
    }, [isSuccess, clockOutSuccess]);

    const disabled = isLatestServiceError || isLatestServiceLoading;

    return (
        <Pressable>
            {isInRange && !clockedIn && (
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
                            {!isLoading || !clockOutLoading ? (
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
                                        {clockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
                                    </Text>
                                </VStack>
                            ) : (
                                <Spinner color="white" size="lg" />
                            )}
                        </Center>
                    </TouchableNativeFeedback>
                </Button>
            </Box>
        </Pressable>
    );
};

export default ClockButton;
