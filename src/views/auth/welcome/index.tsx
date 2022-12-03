import React, { useState } from 'react';
import { FormControl, Heading, Modal, Text, VStack } from 'native-base';
import { Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { InputComponent } from '../../../components/atoms/input';
import ModalAlertComponent from '../../../components/composite/modal-alert';
import OTPInput, { CELL_COUNT } from '../../../components/atoms/otp-input';
import {
    useSendOTPQuery,
    useValidateEmailOTPQuery,
} from '../../../store/services/auth';
import { Formik } from 'formik';
import { EmailSchema } from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';

const cozaIcon = require('../../../assets/images/COZA-Logo-black.png');

const AuthHome: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);

    const [email, setEmail] = React.useState<string>('');
    const [otpValue, setOtpValue] = useState('');

    const hideModal = () => {
        isError && setModalVisible(false);
    };

    const handleSubmit = (values: { email: string }) => {
        setEmail(values.email);
    };

    const { isLoading, error, isSuccess, isError } = useSendOTPQuery(email, {
        skip: !email,
    });

    const {
        data: validateData,
        error: validateError,
        isError: isErrorValidate,
        isSuccess: isSuccessValidate,
        isLoading: isLoadingValidate,
    } = useValidateEmailOTPQuery(
        { email, otp: +otpValue },
        { skip: otpValue.length !== CELL_COUNT }
    );

    React.useEffect(() => {
        if (isError) {
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
            }, 5000);
        }
        if (isSuccess) setModalVisible(true);
    }, [isError, isSuccess]);

    React.useEffect(() => {
        if (isSuccessValidate) {
            navigation.navigate('Register');
        }
    }, [isSuccessValidate]);

    return (
        <>
            <ViewWrapper>
                <VStack
                    p={6}
                    pb={5}
                    pt={10}
                    space={6}
                    alignItems="center"
                    justifyContent="space-around"
                >
                    <Image
                        style={{
                            width: 150,
                            height: 150,
                        }}
                        source={cozaIcon}
                        resizeMode="center"
                    />
                    <Heading size="lg">COZA Workforce App</Heading>
                    <Text color="gray.400">
                        Workers to Gather | Together | To get there
                    </Text>
                    <Formik
                        onSubmit={handleSubmit}
                        initialValues={{ email: '' }}
                        validationSchema={EmailSchema}
                    >
                        {({ handleChange, handleSubmit, errors }: any) => (
                            <FormControl isInvalid={errors.email && true}>
                                <VStack space={1}>
                                    <FormControl.Label isRequired>
                                        Email
                                    </FormControl.Label>
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
                                        isLoadingText="Checking for your email..."
                                    >
                                        Continue
                                    </ButtonComponent>
                                </VStack>
                            </FormControl>
                        )}
                    </Formik>
                </VStack>
            </ViewWrapper>
            <Modal
                isOpen={modalVisible}
                onClose={hideModal}
                avoidKeyboard
                size="xl"
            >
                <Modal.Content minW={200} backgroundColor="gray.200">
                    <Modal.Body>
                        {isSuccess ? (
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
                        ) : isErrorValidate ? (
                            <ModalAlertComponent
                                description={`${validateError}`}
                                iconType="feather"
                                iconName="info"
                                status="info"
                            />
                        ) : (
                            <ModalAlertComponent
                                description={`${validateError}`}
                                iconType="feather"
                                iconName="info"
                                status="info"
                            />
                        )}
                    </Modal.Body>
                </Modal.Content>
            </Modal>
        </>
    );
};

export default AuthHome;
