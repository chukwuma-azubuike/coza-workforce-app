import { Text } from "~/components/ui/text";
import React from 'react';
import { useLoginMutation } from '@store/services/account';
import { Formik } from 'formik';
import { LoginSchema } from '@utils/schemas';
import { ILoginPayload } from '@store/types';
import Utils from '@utils/index';
import { useAppDispatch } from '@store/hooks';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { storeSession } from '~/store/actions/users';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import { DismissKeyboard } from '~/components/DismissKeyboard';

const Login: React.FC = () => {
    const dispatch = useAppDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const INITIAL_VALUES = { email: '', password: '' };

    const onSubmit = async (values: ILoginPayload) => {
        const response = await login({ ...values, email: Utils.formatEmail(values.email) });

        if ('error' in response) {
            Alert.alert((response?.error as any)?.data?.message || (response as any)?.data?.message);
        }

        if ('data' in response) {
            dispatch(storeSession(response.data as any));
        }
    };

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 mt-20">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <DismissKeyboard>
                        <View className="px-6 gap-6">
                            <View className="items-center">
                                <Logo />
                                <Text className="mt-4 text-2xl font-bold">Welcome back</Text>
                            </View>
                            <Formik<ILoginPayload>
                                validateOnChange
                                onSubmit={onSubmit}
                                initialValues={INITIAL_VALUES}
                                validationSchema={LoginSchema}
                            >
                                {({ errors, touched, handleChange, handleSubmit }) => {
                                    return (
                                        <View className="gap-4">
                                            <View className="gap-1">
                                                <Label>Email</Label>
                                                <Input
                                                    leftIcon={{ name: 'mail-outline' }}
                                                    keyboardType="email-address"
                                                    placeholder="jondoe@gmail.com"
                                                    onChangeText={handleChange('email')}
                                                />
                                                {!!errors?.email && !!touched?.email && (
                                                    <FormErrorMessage>{errors?.email}</FormErrorMessage>
                                                )}
                                            </View>
                                            <View className="gap-1">
                                                <Label>Password</Label>
                                                <Input
                                                    isPassword
                                                    placeholder="password"
                                                    onChangeText={handleChange('password')}
                                                    leftIcon={{ name: 'lock-closed-outline' }}
                                                />
                                                {!!errors?.password && !!touched?.password && (
                                                    <FormErrorMessage>{errors?.password}</FormErrorMessage>
                                                )}
                                            </View>
                                            <Button
                                                isLoading={isLoading}
                                                onPress={handleSubmit as (event: any) => void}
                                            >
                                                Login
                                            </Button>
                                        </View>
                                    );
                                }}
                            </Formik>
                            <View className="gap-2">
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    className="px-6 rounded-md"
                                    onPress={() => router.push('/(auth)/forgot-password')}
                                >
                                    <Text className="text-primary text-center">Forgot Password?</Text>
                                </TouchableOpacity>
                                <View className="items-center justify-center flex-row">
                                    <Text className="text-muted-foreground">Not yet registered?</Text>
                                    <TouchableOpacity
                                        style={{ paddingHorizontal: 6, borderRadius: 10 }}
                                        onPress={() => router.push('/verify-email')}
                                    >
                                        <Text className="text-primary">Register</Text>
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

export default React.memo(Login);
