import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    HStack,
    Stack,
    VStack,
    WarningOutlineIcon,
} from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';

const RegisterStepFour: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(true);

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">And finally </Heading>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <Stack w="100%" space={1}>
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
                                <HStack
                                    space={4}
                                    justifyContent="space-between"
                                >
                                    <ButtonComponent
                                        onPress={() => navigation.goBack()}
                                        width={160}
                                        secondary
                                        mt={4}
                                    >
                                        Go back
                                    </ButtonComponent>
                                    <ButtonComponent
                                        onPress={() =>
                                            navigation.navigate('Dashboard')
                                        }
                                        width={160}
                                        mt={4}
                                    >
                                        Register
                                    </ButtonComponent>
                                </HStack>
                            </Stack>
                        </FormControl>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepFour;
