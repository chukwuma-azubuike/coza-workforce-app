import React from 'react';
import { Button, Center, Heading, HStack, VStack } from 'native-base';
import { Image } from 'react-native';
import { ToggleDarkMode } from '../../../components/utils/ToggleDarkMode';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
const cozaIcon = require('../../../assets/images/COZA-Logo-black.png');

const Home = ({ navigation }: NativeStackScreenProps<ParamListBase>) => {
    return (
        <Center
            px={4}
            flex={1}
            _dark={{ bg: 'blueGray.900' }}
            _light={{ bg: 'blueGray.50' }}
        >
            <VStack space={5} alignItems="center">
                <HStack>
                    <Image
                        style={{
                            width: 150,
                            height: 150,
                        }}
                        source={cozaIcon}
                        resizeMode="center"
                    />
                </HStack>
                <Heading size="lg">COZA Workforce App</Heading>
                <ToggleDarkMode />
                <Button onPress={() => navigation.navigate('Login')}>
                    Login
                </Button>
            </VStack>
        </Center>
    );
};

export default Home;
