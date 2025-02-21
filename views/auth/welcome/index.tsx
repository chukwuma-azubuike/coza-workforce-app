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
import { APP_NAME, APP_SLOGAN } from '@env';
import { TouchableRipple } from 'react-native-paper';
import useWelcome from './hooks';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import useDevice from '@hooks/device';

const VerifyEmail: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
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
    } = useWelcome();

    const isIOS = Platform.OS === 'ios';
    const { isAndroidOrBelowIOSTenOrTab } = useDevice();

    return (
        <>
            <ViewWrapper scroll style={{ paddingBottom: 8, paddingTop: isAndroidOrBelowIOSTenOrTab ? 20 : 100 }}>
                <VStack p={6} pb={5} px={4} pt={10} space={6} alignItems="center" justifyContent="space-around">
                    <Logo />
                    <Heading size="lg">{APP_NAME}</Heading>
                    <Text color="gray.400">{APP_SLOGAN}</Text>
                    <Formik onSubmit={handleSubmit} initialValues={{ email: '' }} validationSchema={EmailSchema}>
                        {({ handleChange, handleSubmit, errors, touched }) => (
                            <FormControl isInvalid={!!errors.email && touched.email}>
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
                                        onPress={handleSubmit as any}
                                        isLoadingText="Checking for your email..."
                                    >
                                        Continue
                                    </ButtonComponent>
                                </VStack>
                            </FormControl>
                        )}
                    </Formik>
                    <HStack alignItems="center">
                        <Text fontSize="md" color="gray.400">
                            Already registered?
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
            </ViewWrapper>
            <Modal isOpen={modalVisible} onClose={hideModal} avoidKeyboard size="xl">
                <Modal.Content minW={200} backgroundColor="gray.200">
                    <Modal.Body bg="gray.800" p={isIOS ? 4 : 0}>
                        <If condition={isSuccess && !isError && !isErrorValidate}>
                            <OTPInput
                                render={
                                    isSuccessValidate ? (
                                        <ModalAlertComponent
                                            description="You can now continue your registration"
                                            iconName="checkmark-circle"
                                            iconType="ionicon"
                                            status="success"
                                        />
                                    ) : null
                                }
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

export default React.memo(VerifyEmail);
