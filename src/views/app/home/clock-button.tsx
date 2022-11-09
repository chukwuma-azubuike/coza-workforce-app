import { Box, Button, Pressable } from 'native-base';
import { Icon } from '@rneui/themed';
import React from 'react';

const ClockButton = () => {
    return (
        <Pressable>
            <Box alignItems="center" shadow={7}>
                <Button w={200} h={200} borderRadius="full" shadow={9}>
                    <Icon
                        type="materialicons"
                        name="touch-app"
                        color="white"
                        size={100}
                    />
                </Button>
            </Box>
        </Pressable>
    );
};

export default ClockButton;
