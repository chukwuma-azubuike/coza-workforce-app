import { Text } from '~/components/ui/text';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Formik } from 'formik';
import { EmailSchema } from '@utils/schemas';
import SupportLink from '~/components/SupportLink';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { router } from 'expo-router';
import { DismissKeyboard } from '~/components/DismissKeyboard';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import FormErrorMessage from '~/components/ui/error-message';
import Logo from '~/components/atoms/logo';
import { useLazySendForgotPasswordOTPQuery, useValidateForgotPasswordOTPMutation } from '~/store/services/account';
import Utils from '~/utils';
import getErrorMessage from '~/utils/getErrorMessage';
import OtpInput from '~/components/OtpInput';
import Loading from '~/components/atoms/loading';

const CELL_COUNT = 6;

const ForgotPassword: React.FC = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>('');
    const [sendError, setSendError] = React.useState<string | null>(null);
    const [otpError, setOtpError] = React.useState<string | null>(null);
    // Bumping this remounts the OTP field, clearing it after a failed attempt.
    const [otpResetKey, setOtpResetKey] = React.useState<number>(0);

    const [sendOtp, { isFetching, isLoading }] = useLazySendForgotPasswordOTPQuery();
    const [validateForgotPasswordOTP, { isLoading: isLoadingValidate }] = useValidateForgotPasswordOTPMutation();

    const handleSubmit = async (values: { email: string }) => {
        const newEmail = Utils.formatEmail(values.email);

        setEmail(newEmail);
        setSendError(null);
        setOtpError(null);

        const response = await sendOtp(newEmail);

        if (response.data) {
            setModalVisible(true);
            return;
        }

        setSendError(getErrorMessage(response.error, "We couldn't reach that email address. Please check and retry."));
    };

    const handleValidateOtp = async (otp: string) => {
        if (otp.length !== CELL_COUNT) return;

        setOtpError(null);

        const response = await validateForgotPasswordOTP({ email, otp: +otp });

        if ('data' in response) {
            setModalVisible(false);
            // Defer navigation until the dialog's FadeOut exit animation (300ms)
            // has finished. Navigating while the modal is still animating out
            // tears the native view down mid-draw and crashes Android's new
            // architecture (Fabric dispatchGetDisplayList NPE).
            setTimeout(() => {
                router.push({ pathname: '/reset-password', params: { email, OTP: +otp } });
            }, 500);
            return;
        }

        setOtpError(getErrorMessage(response.error, 'That code is incorrect or has expired. Please try again.'));
        setOtpResetKey(prev => prev + 1);
    };

    const closeModal = () => {
        setModalVisible(false);
        setOtpError(null);
    };

    const sending = isLoading || isFetching;

    return (
        <>
            <SafeAreaView className="flex-1">
                <View className="flex-1 mt-20 px-6">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <DismissKeyboard>
                            <View className="gap-4 w-full">
                                <View className="items-center">
                                    <Logo />
                                </View>
                                <View className="gap-6">
                                    <View className="gap-4 items-center py-6 w-full">
                                        <Text className="text-2xl font-bold">Forgot Password</Text>
                                        <Formik
                                            onSubmit={handleSubmit}
                                            initialValues={{ email: '' }}
                                            validationSchema={EmailSchema}
                                        >
                                            {({ handleChange, handleSubmit, touched, errors, values }) => (
                                                <View className="gap-4 w-full">
                                                    <View className="gap-1">
                                                        <Label>Email</Label>
                                                        <Input
                                                            value={values.email}
                                                            autoCapitalize="none"
                                                            keyboardType="email-address"
                                                            placeholder="jondoe@gmail.com"
                                                            onChangeText={text => {
                                                                setSendError(null);
                                                                handleChange('email')(text);
                                                            }}
                                                            leftIcon={{ name: 'mail', type: 'feather' }}
                                                        />
                                                        {!!errors?.email && !!touched?.email && (
                                                            <FormErrorMessage>{errors?.email}</FormErrorMessage>
                                                        )}
                                                        {!!sendError && (
                                                            <FormErrorMessage>{sendError}</FormErrorMessage>
                                                        )}
                                                    </View>

                                                    <Button
                                                        isLoading={sending}
                                                        loadingText="Sending your OTP..."
                                                        disabled={!values.email || sending}
                                                        onPress={handleSubmit as (event: any) => void}
                                                    >
                                                        Continue
                                                    </Button>
                                                </View>
                                            )}
                                        </Formik>
                                        <View className="items-center flex-row">
                                            <Text className="text-muted-foreground">Remember you password?</Text>
                                            <TouchableOpacity
                                                style={{ paddingHorizontal: 6, borderRadius: 10 }}
                                                onPress={() => router.push('/login')}
                                            >
                                                <Text className="text-primary ">Login</Text>
                                            </TouchableOpacity>
                                        </View>
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
            <Dialog open={modalVisible} onOpenChange={open => !open && closeModal()}>
                <DialogContent className="bg-background max-w-md">
                    <View className="gap-6">
                        <View className="gap-2">
                            <Text className="text-center text-2xl font-bold">Verify OTP</Text>
                            <Text className="text-center text-base text-muted-foreground">
                                Enter the 6-digit code sent to{'\n'}
                                <Text className="font-medium text-foreground">{email}</Text>
                            </Text>
                        </View>

                        {isLoadingValidate ? (
                            <Loading spinnerProps={{ size: 'large' }} />
                        ) : (
                            <OtpInput key={otpResetKey} disabled={isLoadingValidate} onTextChange={handleValidateOtp} />
                        )}

                        {!!otpError && (
                            <View className="items-center">
                                <FormErrorMessage>{otpError}</FormErrorMessage>
                            </View>
                        )}

                        <View className="items-center">
                            <TouchableOpacity onPress={closeModal}>
                                <Text className="text-muted-foreground">Wrong email? Go back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default React.memo(ForgotPassword);
