import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    Stack,
    VStack,
    WarningOutlineIcon,
} from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';

const Register: React.FC<NativeStackScreenProps<ParamListBase>> = () => {
    const [showPassword, setShowPassword] = React.useState<boolean>(true);

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
                                <FormControl.Label>
                                    First name
                                </FormControl.Label>
                                <InputComponent placeholder="John" isRequired />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    This field cannot be empty
                                </FormControl.ErrorMessage>
                                <FormControl.Label>Email</FormControl.Label>
                                <InputComponent
                                    type="email"
                                    isRequired
                                    placeholder="jondoe@gmail.com"
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Enter correct email format
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Department
                                </FormControl.Label>
                                <InputComponent
                                    isRequired
                                    isDisabled
                                    placeholder="Quality Control"
                                />
                                <FormControl.Label>Password</FormControl.Label>
                                <InputComponent
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="password"
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
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Password not strong enough
                                </FormControl.ErrorMessage>
                                <FormControl.Label>
                                    Confirm password
                                </FormControl.Label>
                                <InputComponent
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Repeat password"
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
                                    onIconPress={() => {
                                        setShowPassword(prev => !prev);
                                    }}
                                />
                                <FormControl.ErrorMessage
                                    leftIcon={<WarningOutlineIcon size="xs" />}
                                >
                                    Password doesn't match
                                </FormControl.ErrorMessage>
                                <ButtonComponent mt={4}>
                                    Continue
                                </ButtonComponent>
                            </Stack>
                        </FormControl>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default Register;
