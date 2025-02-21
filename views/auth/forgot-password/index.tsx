import React from 'react';
import { Box, FormControl, Heading, HStack, Modal, Text, VStack } from 'native-base';
import { Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { InputComponent } from '@components/atoms/input';
import ModalAlertComponent from '@components/composite/modal-alert';
import OTPInput from '@components/atoms/otp-input';
import { Formik } from 'formik';
import { EmailSchema } from '@utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import If from '@components/composite/if-container';
import { TouchableRipple } from 'react-native-paper';
import useForgotPassword from './hooks';
import SupportLink from '../support-link';

const ForgotPassword: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const {
        handleSubmit,
        validateError,
        isErrorValidate,
        isSuccessValidate,
        isLoadingValidate,
        modalVisible,
        otpValue,
        setOtpValue,
        isLoading,
        error,
        isSuccess,
        isError,
        hideModal,
    } = useForgotPassword();

    const isIOS = Platform.OS === 'ios';

    return (
        <>
            <ViewWrapper pt={10}>
                <Box w="100%" h="full" justifyContent="space-between" pb={4}>
                    <TouchableRipple
                        style={{ paddingHorizontal: 6, borderRadius: 10 }}
                        rippleColor="rgba(255, 255, 255, 0)"
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Icon
                            size={28}
                            name="arrow-back-outline"
                            type="ionicon"
                            color={THEME_CONFIG.darkGray}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </TouchableRipple>
                    <VStack p={6} pb={5} px={4} pt={10} space={6} alignItems="center" justifyContent="space-around">
                        <Heading>Forgot Password</Heading>
                        <Box alignItems="center" w="100%">
                            <Formik
                                onSubmit={handleSubmit}
                                initialValues={{ email: '' }}
                                validationSchema={EmailSchema}
                            >
                                {({ handleChange, handleSubmit, errors }: any) => (
                                    <FormControl isInvalid={errors.email && true}>
                                        <VStack space={1}>
                                            <FormControl.Label isRequired>Email</FormControl.Label>
                                            <InputComponent
                                                isRequired
                                                placeholder="jondoe@gmail.com"
                                                leftIcon={{
                                                    name: 'mail-outline',
                                                    type: 'ionicon',
                                                }}
                                                keyboardType="email-address"
                                                onChangeText={handleChange('email')}
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
                                                {errors.email}
                                            </FormControl.ErrorMessage>
                                            <ButtonComponent
                                                mt={4}
                                                isLoading={isLoading}
                                                onPress={handleSubmit}
                                                isLoadingText="Sending your OTP..."
                                            >
                                                Continue
                                            </ButtonComponent>
                                        </VStack>
                                    </FormControl>
                                )}
                            </Formik>
                        </Box>
                        <HStack alignItems="center">
                            <Text fontSize="md" color="gray.400">
                                Remember you password?
                            </Text>
                            <TouchableRipple
                                style={{ paddingHorizontal: 6, borderRadius: 10 }}
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
            <Modal isOpen={modalVisible} onClose={hideModal} avoidKeyboard size="xl">
                <Modal.Content minW={200} backgroundColor="gray.200">
                    <Modal.Body bg="gray.800" p={isIOS ? 4 : 0}>
                        <If condition={isSuccess && !isError && !isErrorValidate}>
                            <OTPInput
                                value={otpValue}
                                setValue={setOtpValue}
                                done={isSuccessValidate}
                                loading={isLoadingValidate}
                            />
                        </If>
                        <If condition={isError && !isErrorValidate}>
                            <ModalAlertComponent
                                description={`${error?.data?.message || error?.TypeError}`}
                                iconType="feather"
                                iconName="info"
                                status="info"
                            />
                        </If>
                        <If condition={isErrorValidate}>
                            <ModalAlertComponent
                                description={`${validateError?.data?.message}`}
                                iconType="feather"
                                iconName="info"
                                status="info"
                            />
                        </If>
                    </Modal.Body>
                </Modal.Content>
            </Modal>
        </>
    );
};

export default React.memo(ForgotPassword);
