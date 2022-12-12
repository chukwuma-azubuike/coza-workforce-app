import { Center, Image, Spinner, VStack } from 'native-base';
import React from 'react';
const logo = require('../../../assets/images/COZA-Logo-black.png');

const Loading = ({ bootUp }: { bootUp?: boolean }) => {
    return (
        <Center flex={1} justifyContent="center">
            <VStack justifyContent="center">
                {bootUp ? (
                    <Image
                        alt="startuplogo"
                        source={logo}
                        style={{
                            width: 100,
                            height: 100,
                        }}
                        resizeMode="center"
                    />
                ) : (
                    <Spinner
                        color="primary.600"
                        fontSize="6xl"
                        boxSize="xl"
                        size="lg"
                    />
                )}
            </VStack>
        </Center>
    );
};

export default Loading;
