import React from 'react';
import { Box, Center, FormControl, Heading, Stack, VStack, WarningOutlineIcon } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { RegisterFormContext } from '.';
import { Field, Formik } from 'formik';
import { IRegisterPayload } from '../../../store/types';
import { RegisterSchema_1 } from '../../../utils/schemas';
import PhoneNumberInput from '../../../components/atoms/phone-input';
import { isValidPhoneNumber } from 'libphonenumber-js';

const RegisterStepOne: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const onSubmit = () => {};

    const validate = (values: IRegisterPayload) => {
        const errors: Partial<IRegisterPayload> = {};

        if (!isValidPhoneNumber(values.phoneNumber)) {
            errors.phoneNumber = 'Invalid phone number';
        }

        return errors;
    };

    const { formValues, setFormValues } = React.useContext(RegisterFormContext);

    return (
        <ViewWrapper scroll>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <Formik<IRegisterPayload>
                                onSubmit={onSubmit}
                                validateOnMount={false}
                                validationSchema={RegisterSchema_1}
                                initialValues={formValues as IRegisterPayload}
                                validate={validate}
                            >
                                {({
                                    errors,
                                    values,
                                    touched,
                                    validateForm,
                                    handleChange,
                                    setFieldError,
                                    setFieldTouched,
                                }) => {
                                    const handleContinuePress = () => {
                                        validateForm().then(e => {
                                            if (Object.keys(e).length === 0) {
                                                setFormValues(prev => {
                                                    return { ...prev, ...values };
                                                });
                                                onStepPress(1);
                                            }
                                            const errorKey = Object.keys(e)[0];
                                            setFieldTouched(errorKey);
                                            setFieldError(errorKey, 'This is a required field');
                                        });
                                    };

                                    return (
                                        <>
                                            <FormControl isRequired isInvalid={!!errors.firstName && touched.firstName}>
                                                <FormControl.Label>First name</FormControl.Label>
                                                <InputComponent
                                                    leftIcon={{
                                                        name: 'person-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    onChangeText={handleChange('firstName')}
                                                    placeholder="John"
                                                    isRequired
                                                    value={values?.firstName}
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl isRequired isInvalid={!!errors.lastName && touched.lastName}>
                                                <FormControl.Label>Last name</FormControl.Label>
                                                <InputComponent
                                                    leftIcon={{
                                                        name: 'person-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    onChangeText={handleChange('lastName')}
                                                    value={values?.lastName}
                                                    placeholder="Doe"
                                                    isRequired
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl isRequired isInvalid={!!errors.email && touched.email}>
                                                <FormControl.Label>Email</FormControl.Label>
                                                <InputComponent
                                                    leftIcon={{
                                                        name: 'mail-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    onChangeText={handleChange('email')}
                                                    isDisabled
                                                    isRequired
                                                    value={values?.email}
                                                    keyboardType="email-address"
                                                    placeholder="jondoe@gmail.com"
                                                />
                                            </FormControl>
                                            <Field
                                                name="phoneNumber"
                                                label="Phone Number"
                                                required
                                                component={PhoneNumberInput}
                                            />
                                            <FormControl isRequired isInvalid={!!errors?.address && touched.address}>
                                                <FormControl.Label>Address</FormControl.Label>
                                                <InputComponent
                                                    isRequired
                                                    leftIcon={{
                                                        name: 'home',
                                                        type: 'antdesign',
                                                    }}
                                                    value={values?.address}
                                                    onChangeText={handleChange('address')}
                                                    placeholder="Enter your home address"
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
                                                    {errors?.address}
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl>
                                                <FormControl.Label>Department</FormControl.Label>
                                                <InputComponent
                                                    leftIcon={{
                                                        name: 'organization',
                                                        type: 'octicon',
                                                    }}
                                                    isDisabled
                                                    isRequired
                                                    value={values?.departmentName}
                                                    placeholder="Quality Control"
                                                />
                                            </FormControl>
                                            <ButtonComponent onPress={handleContinuePress} mt={4}>
                                                Continue
                                            </ButtonComponent>
                                        </>
                                    );
                                }}
                            </Formik>
                        </Stack>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepOne;
