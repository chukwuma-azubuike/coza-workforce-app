import { Text } from '~/components/ui/text';
import { KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import React from 'react';

import { Formik } from 'formik';
import { ResetPasswordSchema } from '@utils/schemas';

import SupportLink from '~/components/SupportLink';
import { IResetPasswordPayload, useResetPasswordMutation } from '@store/services/account';
import useModal from '@hooks/modal/useModal';
import { router, useLocalSearchParams } from 'expo-router';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { DismissKeyboard } from '~/components/DismissKeyboard';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import getErrorMessage from '~/utils/getErrorMessage';

const ResetPassword: React.FC = () => {
    // Route params always arrive as strings, handed over by forgot-password.
    const { email, OTP } = useLocalSearchParams<Pick<IResetPasswordPayload, 'email' | 'OTP'>>();

    const [resetPassword, { reset, isLoading }] = useResetPasswordMutation();

    const { setModalState } = useModal();

    const navigateToLogin = () => router.replace('/login');

    // The email and OTP are handed over by the forgot-password screen. Without
    // them there is nothing to reset against, so send the user back to restart.
    React.useEffect(() => {
        if (!email || !OTP) {
            setModalState({
                status: 'error',
                message: 'Your reset link has expired. Please request a new code.',
            });
            router.replace('/forgot-password');
        }
    }, [email, OTP]);

    const onSubmit = async (value: Omit<IResetPasswordPayload, 'OTP' | 'email'>) => {
        if (!email || !OTP) return;

        const response = await resetPassword({ password: value.password, email, OTP } as IResetPasswordPayload);

        if ('error' in response) {
            setModalState({
                status: 'error',
                message: getErrorMessage(response.error, "We couldn't reset your password. Please try again."),
            });
            reset();
            return;
        }

        setModalState({
            status: 'success',
            message: 'Password reset successful',
        });
        // Let the success toast land before the screen changes underneath it.
        setTimeout(navigateToLogin, 500);
    };

    const initialValues: IResetPasswordPayload = {
        OTP: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 mt-20">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <DismissKeyboard>
                        <View className="px-6 gap-6">
                            <Text className="mt-4 text-2xl font-bold">Reset Password</Text>
                            <Formik<{ email: string; password: string; confirmPassword: string }>
                                validateOnChange
                                onSubmit={onSubmit}
                                initialValues={initialValues}
                                validationSchema={ResetPasswordSchema}
                            >
                                {({ errors, touched, handleChange, handleSubmit }) => {
                                    return (
                                        <View className="gap-4">
                                            <View className="gap-1">
                                                <Label>Password</Label>
                                                <Input
                                                    isPassword
                                                    placeholder="Password"
                                                    onChangeText={handleChange('password')}
                                                    leftIcon={{ name: 'lock-outline', type: 'MaterialIcons' }}
                                                />
                                                {!!errors?.password && !!touched?.password && (
                                                    <FormErrorMessage>{errors?.password}</FormErrorMessage>
                                                )}
                                            </View>
                                            <View className="gap-1">
                                                <Label>Confirm password</Label>
                                                <Input
                                                    isPassword
                                                    placeholder="Confirm password"
                                                    onChangeText={handleChange('confirmPassword')}
                                                    leftIcon={{ name: 'lock-outline', type: 'MaterialIcons' }}
                                                />
                                                {!!errors?.confirmPassword && !!touched?.confirmPassword && (
                                                    <FormErrorMessage>{errors?.confirmPassword}</FormErrorMessage>
                                                )}
                                            </View>
                                            <Button
                                                className="mt-2"
                                                isLoading={isLoading}
                                                onPress={handleSubmit as () => void}
                                                loadingText="Resetting your password..."
                                            >
                                                Save
                                            </Button>
                                        </View>
                                    );
                                }}
                            </Formik>
                            <View className="gap-2">
                                <View className="items-center justify-center flex-row">
                                    <Text className="text-muted-foreground">Remembered your password?</Text>
                                    <TouchableOpacity
                                        onPress={navigateToLogin}
                                        style={{ paddingHorizontal: 6, borderRadius: 10 }}
                                    >
                                        <Text className="text-primary">Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </DismissKeyboard>
                </KeyboardAvoidingView>
            </View>
            <View
                style={{
                    bottom: 40,
                    width: '100%',
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <SupportLink />
            </View>
        </SafeAreaView>
    );
};

export default React.memo(ResetPassword);
