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
import React from 'react';

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
            <Box alignItems="center" shadow={7}>
                <Button
                    w={200}
                    h={200}
                    shadow={9}
                    borderRadius="full"
                    onPress={handlePress}
                    backgroundColor={clockedIn ? 'rose.400' : 'primary.900'}
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
                                    fontWeight="thin"
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
                </Button>
            </Box>
        </Pressable>
    );
};

export default ClockButton;
