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
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from '.';

const RegisterStepFour: React.FC<IRegistrationPageStep> = ({
    values,
    navigation,
    onStepPress,
    handleSubmit,
    handleChange,
}) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const handleIconPress = () => setShowPassword(prev => !prev);
    const handleBackPress = () => onStepPress(2);

    const onSubmit = () => navigation?.navigate('App');

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Create a new password</Heading>
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
                                    onIconPress={handleIconPress}
                                    onChangeText={handleChange('password')}
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
                                    onIconPress={handleIconPress}
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
                                        onPress={handleBackPress}
                                        width={160}
                                        secondary
                                        mt={4}
                                    >
                                        Go back
                                    </ButtonComponent>
                                    <ButtonComponent
                                        onPress={onSubmit}
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
