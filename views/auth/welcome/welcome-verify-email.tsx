import { Text } from '~/components/ui/text';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Formik } from 'formik';
import { EmailSchema } from '@utils/schemas';
import { useLazySendOTPQuery, useValidateEmailOTPMutation } from '@store/services/account';
import Utils from '@utils/index';
import Logo from '@components/atoms/logo';
import SupportLink from '~/components/SupportLink';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Link, router } from 'expo-router';
import APP_VARIANT from '~/config/envConfig';
import Loading from '~/components/atoms/loading';
import OtpInput from '~/components/OtpInput';
import FormErrorMessage from '~/components/ui/error-message';

const RESEND_SECONDS = 60;

const getErrorMessage = (error: unknown, fallback: string): string => {
    const data = (error as any)?.data;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.filter(Boolean).join('\n');
    if (typeof (error as any)?.error === 'string') return (error as any).error;
    return fallback;
};

const WelcomeVerifyEmail: React.FC = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>('');
    const [sendError, setSendError] = React.useState<string | null>(null);
    const [otpError, setOtpError] = React.useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = React.useState<number>(0);
    // Bumping this remounts the OTP field, clearing it after a failed attempt.
    const [otpResetKey, setOtpResetKey] = React.useState<number>(0);

    const [sendOtp, { isLoading, isFetching }] = useLazySendOTPQuery();
    const [validateEmail, { isLoading: validatingOTP }] = useValidateEmailOTPMutation();

    // Countdown for the "Resend code" affordance.
    React.useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1)), 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const requestOtp = async (targetEmail: string) => {
        setSendError(null);
        setOtpError(null);
        const response = await sendOtp(targetEmail);

        if (response.data) {
            setModalVisible(true);
            setSecondsLeft(RESEND_SECONDS);
            return true;
        }

        setSendError(getErrorMessage(response.error, "We couldn't find or reach that email. Please check and retry."));
        return false;
    };

    const handleSubmit = async (values: { email: string }) => {
        const formatted = Utils.formatEmail(values.email);
        setEmail(formatted);
        await requestOtp(formatted);
    };

    const handleResend = async () => {
        if (secondsLeft > 0 || !email) return;
        setOtpError(null);
        setOtpResetKey(prev => prev + 1);
        await requestOtp(email);
    };

    const handleValidateOtp = async (otp: string) => {
        if (otp.length !== 6) return;
        setOtpError(null);

        const response = await validateEmail({ email, otp: +otp });

        if (response.data) {
            const params = response.data as any;
            setModalVisible(false);
            // Defer navigation until the dialog's FadeOut exit animation (300ms)
            // has finished. Replacing the screen while the modal is still
            // animating out tears the native view down mid-draw and crashes
            // Android's new architecture (Fabric dispatchGetDisplayList NPE).
            setTimeout(() => {
                router.replace({ pathname: '/register', params });
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

    const isIOS = Platform.OS === 'ios';
    const sending = isLoading || isFetching;

    return (
        <>
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} className="flex-1">
                    <View className="flex-1 justify-between">
                        <View className="px-4 w-full gap-8 pt-20">
                            <View className="px-4 gap-6 w-full items-center justify-center">
                                <Logo />
                            </View>
                            <View className="gap-1">
                                <Text className="text-2xl font-bold text-center">Let's verify your email</Text>
                                <Text className="text-muted-foreground text-center">
                                    We'll send a 6-digit code to confirm it's you.
                                </Text>
                            </View>
                            <Formik
                                onSubmit={handleSubmit}
                                initialValues={{ email: '' }}
                                validationSchema={EmailSchema}
                            >
                                {({ handleChange, handleSubmit, errors, touched, values, isValid }) => (
                                    <View className="gap-6 w-full">
                                        <View className="gap-2">
                                            <Label>Email</Label>
                                            <Input
                                                placeholder="jondoe@gmail.com"
                                                leftIcon={{ type: 'ionicons', name: 'mail-outline' }}
                                                value={values.email}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                onChangeText={text => {
                                                    setSendError(null);
                                                    handleChange('email')(text);
                                                }}
                                            />
                                            {!!errors.email && touched.email && (
                                                <FormErrorMessage>{errors.email}</FormErrorMessage>
                                            )}
                                            {!!sendError && <FormErrorMessage>{sendError}</FormErrorMessage>}
                                        </View>
                                        <Button
                                            onPress={handleSubmit as any}
                                            isLoading={sending}
                                            disabled={!isValid || !values.email || sending}
                                            loadingText="Checking your email..."
                                        >
                                            Continue
                                        </Button>
                                    </View>
                                )}
                            </Formik>
                            <View className="flex-row items-center gap-2 w-full justify-center">
                                <Text className="text-muted-foreground">Already registered?</Text>
                                <Link href="/login">
                                    <Text className="text-primary">Login</Text>
                                </Link>
                            </View>
                        </View>
                        <View className="w-full justify-center items-center">
                            <SupportLink />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
            <Dialog open={modalVisible} onOpenChange={open => !open && closeModal()}>
                <DialogContent className="max-w-md">
                    <View className="gap-6">
                        <View className="gap-2">
                            <Text className="text-center text-3xl font-bold">Verification</Text>
                            <Text className="text-center text-base text-muted-foreground">
                                Enter the 6-digit code sent to{'\n'}
                                <Text className="font-medium text-foreground">{email}</Text>
                            </Text>
                        </View>

                        {validatingOTP ? (
                            <Loading spinnerProps={{ size: 'large' }} />
                        ) : (
                            <OtpInput key={otpResetKey} disabled={validatingOTP} onTextChange={handleValidateOtp} />
                        )}

                        {!!otpError && (
                            <View className="items-center">
                                <FormErrorMessage>{otpError}</FormErrorMessage>
                            </View>
                        )}

                        <View className="items-center gap-3">
                            {secondsLeft > 0 ? (
                                <Text className="text-muted-foreground">Resend code in {secondsLeft}s</Text>
                            ) : (
                                <TouchableOpacity disabled={sending} onPress={handleResend}>
                                    <Text className="text-primary font-medium">
                                        {sending ? 'Sending...' : 'Resend code'}
                                    </Text>
                                </TouchableOpacity>
                            )}
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

export default React.memo(WelcomeVerifyEmail);

WelcomeVerifyEmail.displayName = 'WelcomeVerifyEmail';
