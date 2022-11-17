import React from 'react';
import { Center, Text } from 'native-base';
import LottieView from 'lottie-react-native';

const Empty: React.FC<{ message?: string }> = ({ message }) => {
    return (
        <Center>
            <LottieView
                source={require('../../../assets/json/empty.json')}
                style={{ width: 320 }}
                resizeMode="cover"
                autoPlay
                loop
            />
            <Text fontSize="md" color="gray.400" semi-bold>
                {message ? message : 'Nothing here yet.'}
            </Text>
        </Center>
    );
};

export default Empty;
