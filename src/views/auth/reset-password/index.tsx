import React from 'react';
import { Box, FormControl, Heading, HStack, Stack, Text, VStack } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Formik } from 'formik';
import { IRegisterPayload } from '../../../store/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegisterSchema } from '../../../utils/schemas';
import { TouchableRipple } from 'react-native-paper';
import Logo from '../../../components/atoms/logo';
import { ParamListBase } from '@react-navigation/native';
import SupportLink from '../support-link';

const ResetPassword: React.FC<IRegistrationPageStep<NativeStackScreenProps<ParamListBase>>> = ({
    errors,
    isLoading,
    onStepPress,
    handleSubmit,
    handleChange,
    loginIsLoading,
    navigation,
}) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const handleIconPress = () => setShowPassword(prev => !prev);
    const handleBackPress = () => onStepPress(2);

    const onSubmit = () => {
        if (!errors.password && !errors.confirmPassword) handleSubmit();
    };
    const init = {
        password: '',
        confirmPassword: '',
    };

    return (
        <ViewWrapper>
            <Box w="100%" h="full" justifyContent="space-between" pb={4}>
                <VStack space={6} pb={5} px={4} pt={10} alignItems="center" justifyContent="space-around">
                    {/* <Logo /> */}
                    <Heading>Reset password</Heading>
                    <Box alignItems="center" w="100%">
                        <Formik
                            validateOnChange
                            enableReinitialize
                            onSubmit={handleSubmit}
                            initialValues={init}
                            validationSchema={RegisterSchema}
                        >
                            {({
                                errors,
                                handleChange,
                                handleSubmit,
                            }: Pick<
                                IRegisterFormProps,
                                'values' | 'errors' | 'handleChange' | 'handleSubmit' | 'setFieldError'
                            >) => {
                                return (
                                    <Stack w="100%" space={1}>
                                        <FormControl isRequired isInvalid={errors?.password ? true : false}>
                                            <FormControl.Label>Password</FormControl.Label>
                                            <InputComponent
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="password"
                                                leftIcon={{
                                                    name: 'lock-closed-outline',
                                                    type: 'ionicon',
                                                }}
                                                rightIcon={{
                                                    name: showPassword ? 'eye-off-outline' : 'eye-outline',
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
                                        <FormControl isRequired isInvalid={errors?.confirmPassword ? true : false}>
                                            <FormControl.Label>Confirm password</FormControl.Label>
                                            <InputComponent
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Repeat password"
                                                leftIcon={{
                                                    name: 'lock-closed-outline',
                                                    type: 'ionicon',
                                                }}
                                                rightIcon={{
                                                    name: showPassword ? 'eye-off-outline' : 'eye-outline',
                                                    type: 'ionicon',
                                                }}
                                                onIconPress={handleIconPress}
                                                onChangeText={handleChange('confirmPassword')}
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
                                            <HStack space={4} justifyContent="center">
                                                {/* <ButtonComponent onPress={handleBackPress} width={160} secondary mt={4}>
                                        Go back
                                    </ButtonComponent> */}
                                                <ButtonComponent
                                                    isLoading={isLoading || loginIsLoading}
                                                    isLoadingText={loginIsLoading ? 'Logging in...' : 'Signing up...'}
                                                    // onPress={onSubmit}
                                                    onPress={() => navigation.navigate('Login')}
                                                    width={160}
                                                    mt={4}
                                                >
                                                    Save
                                                </ButtonComponent>
                                            </HStack>
                                        </FormControl>
                                    </Stack>
                                );
                            }}
                        </Formik>
                    </Box>

                    <HStack alignItems="center" justifyContent="center">
                        <Text fontSize="md" color="gray.400">
                            Remember your password?
                        </Text>
                        <TouchableRipple
                            style={{ paddingHorizontal: 6, borderRadius: 10 }}
                            rippleColor="rgba(255, 255, 255, 0)"
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text fontSize="md" _dark={{ color: 'primary.400' }} _light={{ color: 'primary.500' }}>
                                Login
                            </Text>
                        </TouchableRipple>
                    </HStack>
                </VStack>
                <Box w="full" justifyContent="center" justifyItems="center" alignItems="center">
                    <SupportLink />
                </Box>
            </Box>
        </ViewWrapper>
    );
};

export default ResetPassword;
