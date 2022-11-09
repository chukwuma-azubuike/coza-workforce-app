import React from 'react';
import { Box, Center, FormControl, Heading, Stack, VStack } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';

const Login: React.FC<NativeStackScreenProps<ParamListBase>> = () => {
    const [showPassword, setShowPassword] = React.useState<boolean>(true);

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Welcome back</Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
                                <FormControl.Label>Email</FormControl.Label>
                                <InputComponent
                                    leftIcon={{
                                        name: 'mail-outline',
                                        type: 'ionicon',
                                    }}
                                    placeholder="jondoe@gmail.com"
                                />
                                <FormControl.Label>Password</FormControl.Label>
                                <InputComponent
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="password"
                                    isRequired
                                    leftIcon={{
                                        name: 'lock-closed-outline',
                                        type: 'ionicon',
                                    }}
                                    rightIcon={{
                                        name: showPassword
                                            ? 'eye-off-outline'
                                            : 'eye-outline',
                                        type: 'ionicon',
                                    }}
                                    onIconPress={() =>
                                        setShowPassword(prev => !prev)
                                    }
                                />
                                <ButtonComponent mt={4}>Login</ButtonComponent>
                            </Stack>
                        </FormControl>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default Login;
