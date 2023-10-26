import React from 'react';
import { Box, Heading, Text, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { APP_NAME, APP_SLOGAN } from '@env';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';

const Welcome: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;

    const goToLogin = () => navigate('Login');
    const goToRegister = () => navigate('Verify Email');

    return (
        <ViewWrapper pt={10}>
            <Box w="full" h="full" justifyContent="space-between" pb={4}>
                <VStack space={32} pb={5} px={4} pt={10}>
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
                <Box w="full" justifyContent="center" justifyItems="center" alignItems="center">
                    <SupportLink />
                </Box>
            </Box>
        </ViewWrapper>
    );
};

export default Welcome;
