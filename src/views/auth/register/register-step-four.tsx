import React from 'react';
import {
    Box,
    Center,
    FormControl,
    Heading,
    HStack,
    Stack,
    VStack,
} from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';

const RegisterStepFour: React.FC<IRegistrationPageStep> = ({
    errors,
    isLoading,
    onStepPress,
    handleSubmit,
    handleChange,
    loginIsLoading,
}) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const handleIconPress = () => setShowPassword(prev => !prev);
    const handleBackPress = () => onStepPress(2);

    const onSubmit = () => {
        if (!errors.password && !errors.confirmPassword) handleSubmit();
    };

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Create a new password</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <FormControl
                                isRequired
                                isInvalid={errors?.password ? true : false}
                            >
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
                                    fontSize="2xl"
                                    mt={3}
                                    leftIcon={
                                        <Icon
                                            size={16}
                                            name="warning"
                                            type="antdesign"
                                            color={THEME_CONFIG.error}
                                        />
                                    }
                                >
                                    {errors?.password}
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl
                                isRequired
                                isInvalid={
                                    errors?.confirmPassword ? true : false
                                }
                            >
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
                                    onChangeText={handleChange(
                                        'confirmPassword'
                                    )}
                                />
                                <FormControl.ErrorMessage
                                    fontSize="2xl"
                                    mt={3}
                                    leftIcon={
                                        <Icon
                                            size={16}
                                            name="warning"
                                            type="antdesign"
                                            color={THEME_CONFIG.error}
                                        />
                                    }
                                >
                                    {errors?.confirmPassword}
                                </FormControl.ErrorMessage>
                            </FormControl>
                            <FormControl>
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
                                        isLoading={isLoading || loginIsLoading}
                                        isLoadingText={
                                            loginIsLoading
                                                ? 'Logging in...'
                                                : 'Signing up...'
                                        }
                                        onPress={onSubmit}
                                        width={160}
                                        mt={4}
                                    >
                                        Register
                                    </ButtonComponent>
                                </HStack>
                            </FormControl>
                        </Stack>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepFour;
