import React from 'react';
import { Heading, Text, VStack } from 'native-base';
import { Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
const cozaIcon = require('../../../assets/images/COZA-Logo-black.png');

const AuthHome: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    return (
        <ViewWrapper>
            <>
                <VStack
                    p={6}
                    py={24}
                    space={4}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Image
                        style={{
                            width: 150,
                            height: 150,
                        }}
                        source={cozaIcon}
                        resizeMode="center"
                    />
                    <Heading size="lg">COZA Workforce App</Heading>
                    <Text color="primary.50">
                        Workers to Gather | Together | To get there
                    </Text>
                </VStack>
                <VStack
                    p={6}
                    space={4}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <ButtonComponent
                        onPress={() => navigation.navigate('Login')}
                    >
                        Login
                    </ButtonComponent>
                    <ButtonComponent
                        secondary
                        onPress={() => navigation.navigate('Register')}
                    >
                        Register
                    </ButtonComponent>
                </VStack>
            </>
        </ViewWrapper>
    );
};

export default AuthHome;
