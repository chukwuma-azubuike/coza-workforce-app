import React from 'react';
import { Box, FormControl, Heading, HStack, Stack, Text, VStack } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Formik } from 'formik';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ResetPasswordSchema } from '../../../utils/schemas';
import { TouchableRipple } from 'react-native-paper';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import SupportLink from '../support-link';
import { IRegisterFormProps } from '../register/types';
import { IResetPasswordPayload, useResetPasswordMutation } from '../../../store/services/account';
import useModal from '../../../hooks/modal/useModal';

const ResetPassword: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const handleIconPress = () => setShowPassword(prev => !prev);

    const { email, OTP } = props?.route?.params as unknown as IResetPasswordPayload;

    console.log('Raw params ->', props.route.params);

    const [resetPassword, { reset, isSuccess, isError, isLoading }] = useResetPasswordMutation();

    const onSubmit = (value: Omit<IResetPasswordPayload, 'OTP' | 'email'>) => {
        console.log({ ...value, OTP });
        resetPassword({ password: value.password, email, OTP });
    };

    const initialValues = {
        password: '',
        confirmPassword: '',
    };

    const { navigate } = useNavigation();

    const navigateToLogin = () => navigate('Login' as never);

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (isError) {
            setModalState({
                status: 'error',
                message: 'Oops, something went wrong!',
            });
            reset();
        }
        if (isSuccess) {
            setModalState({
                status: 'success',
                message: 'Password reset successful',
            });
            navigateToLogin();
        }
    }, [isError, isSuccess]);

    return (
        <ViewWrapper>
            <Box w="100%" h="full" justifyContent="space-between" pb={4}>
                <VStack space={6} pb={5} px={4} pt={10} alignItems="center" justifyContent="space-around">
                    {/* <Logo /> */}
                    <Heading>Reset password</Heading>
                    <Box alignItems="center" w="100%">
                        <Formik<{ email: string; password: string }>
                            validateOnChange
                            enableReinitialize
                            onSubmit={onSubmit}
                            validationSchema={ResetPasswordSchema}
                            initialValues={initialValues as unknown as IResetPasswordPayload}
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
                                            <ButtonComponent
                                                mt={4}
                                                isLoading={isLoading}
                                                onPress={handleSubmit}
                                                isLoadingText="Resetting your password..."
                                            >
                                                Save
                                            </ButtonComponent>
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
                            onPress={navigateToLogin}
                            rippleColor="rgba(255, 255, 255, 0)"
                            style={{ paddingHorizontal: 6, borderRadius: 10 }}
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
