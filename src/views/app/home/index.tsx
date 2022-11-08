import React from 'react';
import { Center, Heading, VStack } from 'native-base';
import { Image } from 'react-native';
import { ToggleDarkMode } from '../../../components/utils/ToggleDarkMode';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '../../../components/atoms/button';
const cozaIcon = require('../../../assets/images/COZA-Logo-black.png');

const Home: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    return (
        <Center
            px={4}
            flex={1}
            _dark={{ bg: 'blueGray.900' }}
            _light={{ bg: 'blueGray.50' }}
        >
            <VStack space={4} alignItems="center">
                <Image
                    style={{
                        width: 150,
                        height: 150,
                    }}
                    source={cozaIcon}
                    resizeMode="center"
                />
                <Heading size="lg">COZA Workforce App</Heading>
                <ToggleDarkMode />
            </VStack>
            <ButtonComponent
                marginTop={4}
                onPress={() => navigation.navigate('Login')}
            >
                Login
            </ButtonComponent>
        </Center>
    );
};

export default Home;
