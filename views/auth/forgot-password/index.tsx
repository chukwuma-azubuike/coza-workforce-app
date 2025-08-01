import { Text } from '~/components/ui/text';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import ModalAlertComponent from '@components/composite/modal-alert';
import { Formik } from 'formik';
import { EmailSchema } from '@utils/schemas';
import If from '@components/composite/if-container';
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
import OtpInput from '~/components/OtpInput';
import Loading from '~/components/atoms/loading';

const CELL_COUNT = 6;

const ForgotPassword: React.FC = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>('');

    const hideModal = () => {
        (isError || isErrorValidate) && setModalVisible(false);
        resetOtpSend();
    };

    const [sendOtp, { isFetching, isLoading, error, reset: resetOtpSend, isSuccess, isError }] =
        useLazySendForgotPasswordOTPQuery();

    const [
        validateForgotPasswordOTP,
        {
            reset: validateReset,
            data: validateData,
            error: validateError,
            isError: isErrorValidate,
            isSuccess: isSuccessValidate,
            isLoading: isLoadingValidate,
        },
    ] = useValidateForgotPasswordOTPMutation();

    const handleSubmit = async (values: { email: string }) => {
        const newEmail = Utils.formatEmail(values.email);

        try {
            const res = await sendOtp(newEmail);

            if ('data' in res) {
                setModalVisible(true);
                setEmail(newEmail);
            }
        } catch (error) {}
    };

    const handleValidateOtp = async (otp: string) => {
        if (otp.length === CELL_COUNT) {
            try {
                const response = await validateForgotPasswordOTP({ email, otp: +otp });

                if ('data' in response) {
                    router.push({ pathname: '/reset-password', params: { email, OTP: +otp } });
                    setModalVisible(false);

                    resetOtpSend();
                }
            } catch (error) {}
        }
    };

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
                                            {({ handleChange, handleSubmit, touched, errors }: any) => (
                                                <View className="gap-4 w-full">
                                                    <View className="gap-1">
                                                        <Label>Email</Label>
                                                        <Input
                                                            keyboardType="email-address"
                                                            placeholder="jondoe@gmail.com"
                                                            onChangeText={handleChange('email')}
                                                            leftIcon={{ name: 'mail', type: 'feather' }}
                                                        />
                                                        {!!errors?.email && !!touched?.email && (
                                                            <FormErrorMessage>{errors?.email}</FormErrorMessage>
                                                        )}
                                                    </View>

                                                    <Button
                                                        loadingText="Sending your OTP..."
                                                        isLoading={isLoading || isFetching}
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
            <Dialog open={modalVisible} onOpenChange={hideModal}>
                <DialogContent showClose={false} className="bg-background max-w-md items-center">
                    <View className="gap-10">
                        <Text className="text-center font-bold">Verify OTP</Text>
                        <If condition={isSuccess && !isError && !isErrorValidate}>
                            {isLoadingValidate ? (
                                <Loading spinnerProps={{ size: 'large' }} />
                            ) : (
                                <Text className="text-center text-base line-clamp-2 mx-auto text-muted-foreground">
                                    Please enter the OTP code we sent to your email address
                                </Text>
                            )}
                            <OtpInput disabled={isLoadingValidate} onTextChange={handleValidateOtp} />
                        </If>
                    </View>
                    <If condition={isError && !isErrorValidate}>
                        <ModalAlertComponent
                            description={`${(error as any)?.data?.message || (error as any)?.TypeError}`}
                            iconType="feather"
                            iconName="info"
                            status="info"
                        />
                    </If>
                    <If condition={isErrorValidate}>
                        <ModalAlertComponent
                            description={`${(validateError as any)?.data?.message}`}
                            iconType="feather"
                            iconName="info"
                            status="info"
                        />
                    </If>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default React.memo(ForgotPassword);
