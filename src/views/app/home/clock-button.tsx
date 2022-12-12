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

interface IClockButtonProps {
    isInRange: boolean;
}

const ClockButton = ({ isInRange }: IClockButtonProps) => {
    const [clockedIn, setClockedIn] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const { setModalState } = useModal();

    const handlePress = () => {
        if (!isLoading) {
            setIsLoading(prev => !prev);
            setTimeout(() => {
                isInRange && setClockedIn(prev => !prev);
                setIsLoading(false);
                setModalState({
                    duration: 6,
                    render: (
                        <ModalAlertComponent
                            description={
                                isInRange
                                    ? `You clocked in at ${moment().format(
                                          'LT'
                                      )}`
                                    : 'Your are not within range of any campus!'
                            }
                            iconType={
                                isInRange ? 'material-community' : 'ionicon'
                            }
                            iconName={
                                isInRange ? 'timer-outline' : 'warning-outline'
                            }
                            status={isInRange ? 'success' : 'warning'}
                        />
                    ),
                });
            }, 2000);
        }
    };

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
                    backgroundColor={clockedIn ? 'rose.400' : 'primary.600'}
                >
                    <TouchableNativeFeedback
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            '#000000BF',
                            true,
                            120
                        )}
                    >
                        <Center>
                            {!isLoading ? (
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
