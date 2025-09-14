import { Text } from '~/components/ui/text';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native';
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

const WelcomeVerifyEmail: React.FC = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>('');

    const [sendOtp, { isLoading, isFetching }] = useLazySendOTPQuery();
    const [validateEmail, { isLoading: validatingOTP }] = useValidateEmailOTPMutation();

    const hideModal = () => {
        setModalVisible(false);
    };

    const handleSubmit = async (values: { email: string }) => {
        try {
            setEmail(Utils.formatEmail(values.email));
            const response = await sendOtp(Utils.formatEmail(values.email));

            if (response.error) {
                Alert.alert(
                    'Failed',
                    `${(response.error as any)?.data?.message || (response.error as any)?.TypeError}`
                );
            }

            if (response.data) {
                setModalVisible(true);
            }
        } catch (error) {}
    };

    const handleValidateOtp = async (otp: string) => {
        if (otp.length === 6) {
            try {
                const response = await validateEmail({ email, otp: +otp });

                if (response.error) {
                    Alert.alert('OTP validation failed', `${(response.error as any)?.data?.message}`);
                }
                if (response.data) {
                    router.replace({ pathname: '/register', params: response.data as any });
                }
            } catch (error) {}
        }
    };

    const isIOS = Platform.OS === 'ios';

    return (
        <>
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} className="flex-1">
                    <View className="flex-1 justify-between">
                        <View className="px-4 w-full gap-6 pt-20">
                            <View className="px-4 gap-6 w-full items-center justify-center">
                                <Logo />
                                <Text className="text-2xl">{APP_VARIANT.APP_NAME}</Text>
                                <Text className="text-muted-foreground">{APP_VARIANT.APP_SLOGAN}</Text>
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
                                                leftIcon={{
                                                    type: 'ionicons',
                                                    name: 'mail-outline',
                                                }}
                                                value={values.email}
                                                keyboardType="email-address"
                                                onChangeText={handleChange('email')}
                                            />
                                            {!!errors.email && touched.email && (
                                                <FormErrorMessage>{errors.email}</FormErrorMessage>
                                            )}
                                        </View>
                                        <Button
                                            onPress={handleSubmit as any}
                                            isLoading={isLoading || isFetching}
                                            disabled={!isValid || !values.email}
                                            loadingText="Checking for your email..."
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
            <Dialog open={modalVisible} onOpenChange={hideModal}>
                <DialogContent className="max-w-md">
                    <View className="gap-10">
                        <Text className="text-center text-3xl font-bold">Verification</Text>
                        {validatingOTP ? (
                            <Loading spinnerProps={{ size: 'large' }} />
                        ) : (
                            <Text className="text-center text-base max-w-xs mx-auto text-muted-foreground">
                                Please enter the OTP code we sent to your email address
                            </Text>
                        )}
                        <OtpInput disabled={validatingOTP} onTextChange={handleValidateOtp} />
                    </View>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default React.memo(WelcomeVerifyEmail);

WelcomeVerifyEmail.displayName = 'WelcomeVerifyEmail';
