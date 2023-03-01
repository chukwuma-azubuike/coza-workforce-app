import React from 'react';
import { Heading, Text, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { APP_NAME, APP_SLOGAN } from '@env';
import Logo from '../../../components/atoms/logo';

const Welcome: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;

    const goToLogin = () => navigate('Login');
    const goToRegister = () => navigate('Verify Email');

    return (
        <ViewWrapper>
            <VStack pb={5} px={4} pt={10} space={32} w="full">
                <VStack space={6} alignItems="center" justifyContent="space-around">
                    <Logo />
                    <Heading size="lg">{APP_NAME}</Heading>
                    <Text color="gray.400">{APP_SLOGAN}</Text>
                </VStack>
                <VStack space={1} w="full">
                    <ButtonComponent mt={4} onPress={goToLogin}>
                        Login
                    </ButtonComponent>
                    <ButtonComponent mt={4} secondary onPress={goToRegister}>
                        Register
                    </ButtonComponent>
                </VStack>
            </VStack>
        </ViewWrapper>
    );
};

export default Welcome;