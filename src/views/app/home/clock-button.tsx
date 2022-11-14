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
import { THEME_CONFIG } from '../../../config/appConfig';

const ClockButton = () => {
    const [clockedIn, setClockedIn] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handlePress = () => {
        if (!isLoading) {
            setIsLoading(prev => !prev);
            setTimeout(() => {
                setClockedIn(prev => !prev);
                setIsLoading(false);
            }, 2000);
        }
    };

    return (
        <Pressable>
            {!clockedIn && (
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
                    backgroundColor={clockedIn ? 'rose.400' : 'primary.900'}
                >
                    <TouchableNativeFeedback
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(
                            THEME_CONFIG.lightGray,
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
