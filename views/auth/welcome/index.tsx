import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import { EmailSchema } from '@utils/schemas';
import { OtpInput } from 'react-native-otp-entry';
import { useLazySendOTPQuery, useValidateEmailOTPMutation } from '@store/services/account';
import Utils from '@utils/index';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Link, router } from 'expo-router';
import { Colors } from '~/constants/Colors';
import APP_ENV from '~/config/envConfig';
import { THEME_CONFIG } from '~/config/appConfig';

const VerifyEmail: React.FC = () => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>('');

    const [sendOtp, { isLoading, isFetching }] = useLazySendOTPQuery();
    const [validateEmail] = useValidateEmailOTPMutation();

    const hideModal = () => {
        setModalVisible(false);
    };

    const handleSubmit = async (values: { email: string }) => {
        try {
            setEmail(Utils.formatEmail(values.email));
            const response = await sendOtp(Utils.formatEmail(values.email));

            if (response.error) {
                Alert.alert('Failed', `${response.error?.data?.message || response.error?.TypeError}`);
            }

            if (response.data) {
                setModalVisible(true);
            }
        } catch (error) {}
    };

    const handleValidateOtp = async (otp: string) => {
        if (otp.length === 6) {
            try {
                console.log({ email, otp: +otp });
                const response = await validateEmail({ email, otp: +otp });

                if (response.error) {
                    Alert.alert('OTP validation failed', `${response.error?.data?.message}`);
                }
                if (response.data) {
                    Alert.alert('Successful', 'Continue your registration', [
                        { text: 'Continue', onPress: () => router.replace('/(auth)/register') },
                    ]);
                }
            } catch (error) {}
        }
    };

    const isIOS = Platform.OS === 'ios';

    return (
        <>
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} className="flex-1">
                    <View className="flex-1 justify-around">
                        <View className="px-4 w-full gap-6">
                            <View className="px-4 gap-6 w-full items-center justify-center">
                                <Logo />
                                <Text className="text-2xl">{APP_ENV.APP_NAME}</Text>
                                <Text className="text-muted-foreground">{APP_ENV.APP_SLOGAN}</Text>
                            </View>
                            <Formik
                                onSubmit={handleSubmit}
                                initialValues={{ email: '' }}
                                validationSchema={EmailSchema}
                            >
                                {({ handleChange, handleSubmit, errors, touched }) => (
                                    <View className="gap-6 w-full">
                                        <View className="gap-1">
                                            <Label>Email</Label>
                                            <Input
                                                placeholder="jondoe@gmail.com"
                                                // leftIcon={{
                                                //     name: 'mail-outline',
                                                //     type: 'ionicon',
                                                // }}
                                                keyboardType="email-address"
                                                onChangeText={handleChange('email')}
                                            />
                                        </View>
                                        {!!errors.email && touched.email && (
                                            <Text
                                                className="text-destructive"
                                                // leftIcon={
                                                //     <Icon
                                                //         size={16}
                                                //         name="warning"
                                                //         type="antdesign"
                                                //         color={THEME_CONFIG.error}
                                                //     />
                                                // }
                                            >
                                                {errors.email}
                                            </Text>
                                        )}
                                        <Button
                                            onPress={handleSubmit as any}
                                            isLoading={isLoading || isFetching}
                                            loadingText="Checking for your email..."
                                        >
                                            Continue
                                        </Button>
                                    </View>
                                )}
                            </Formik>
                            <View className="flex-row items-center gap-2 w-full justify-center">
                                <Text className="text-base text-muted-foreground">Already registered?</Text>
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
                <DialogContent className="sm:max-w-[425px] bg-gray-200">
                    <View className="gap-4">
                        <OtpInput
                            numberOfDigits={6}
                            focusColor={Colors.primary}
                            autoFocus={true}
                            hideStick={true}
                            blurOnFilled={true}
                            disabled={false}
                            type="numeric"
                            secureTextEntry={false}
                            focusStickBlinkingDuration={500}
                            onTextChange={handleValidateOtp}
                            textInputProps={{
                                accessibilityLabel: 'One-Time Password',
                            }}
                            theme={{
                                containerStyle: styles.container,
                                pinCodeContainerStyle: styles.pinCodeContainer,
                                pinCodeTextStyle: styles.pinCodeText,
                                focusStickStyle: styles.focusStick,
                                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                                placeholderTextStyle: styles.placeholderText,
                                filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                                disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
                            }}
                        />
                    </View>
                </DialogContent>
            </Dialog>
        </>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    container: {
        width: '100%',
    },
    pinCodeContainer: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    pinCodeText: {
        fontSize: 22,
        color: '#000',
    },
    pinCodeTextDark: {
        fontSize: 22,
        color: '#FFF',
    },
    focusStick: {
        width: 2,
        height: 30,
        backgroundColor: THEME_CONFIG.primary,
    },
    activePinCodeContainer: {
        borderColor: THEME_CONFIG.primary,
    },
    placeholderText: {
        color: '#ccc',
    },
    filledPinCodeContainer: {
        borderColor: THEME_CONFIG.primary,
    },
    disabledPinCodeContainer: {
        backgroundColor: '#eee',
        borderColor: '#ddd',
    },
});

export default React.memo(VerifyEmail);
