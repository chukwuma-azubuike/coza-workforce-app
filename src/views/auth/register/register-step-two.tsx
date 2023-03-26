import React from 'react';
import { Box, Center, FormControl, Heading, HStack, Stack, VStack, WarningOutlineIcon } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Field, Formik } from 'formik';
import { IRegisterPayload } from '../../../store/types';
import { RegisterSchema_2 } from '../../../utils/schemas';
import { RegisterFormContext } from '.';
import PhoneNumberInput from '../../../components/atoms/phone-input';
import { isValidPhoneNumber } from 'libphonenumber-js';

const RegisterStepTwo: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const handleBackPress = () => onStepPress(0);

    const onSubmit = () => {};

    const validate = (values: IRegisterPayload) => {
        const errors: Partial<IRegisterPayload> = {};

        if (!isValidPhoneNumber(values.nextOfKinPhoneNo)) {
            errors.nextOfKinPhoneNo = 'Invalid phone number';
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
                                validationSchema={RegisterSchema_2}
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
                                                onStepPress(2);
                                            }
                                            const errorKey = Object.keys(e)[0];
                                            setFieldTouched(errorKey);
                                            setFieldError(errorKey, 'This is a required field');
                                        });
                                    };

                                    return (
                                        <>
                                            <FormControl isRequired isInvalid={!!errors?.gender && touched.gender}>
                                                <FormControl.Label>Gender</FormControl.Label>
                                                <SelectComponent
                                                    placeholder="Enter your gender"
                                                    onValueChange={handleChange('gender')}
                                                >
                                                    <SelectItemComponent label="Male" value="M" />
                                                    <SelectItemComponent label="Female" value="F" />
                                                </SelectComponent>
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
                                                    {errors?.gender}
                                                </FormControl.ErrorMessage>
                                            </FormControl>

                                            <FormControl
                                                isRequired
                                                isInvalid={!!errors?.occupation && touched.occupation}
                                            >
                                                <FormControl.Label>Occupation</FormControl.Label>
                                                <InputComponent
                                                    isRequired
                                                    leftIcon={{
                                                        name: 'briefcase-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    placeholder="Enter your occupation"
                                                    onChangeText={handleChange('occupation')}
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl
                                                isRequired
                                                isInvalid={!!errors?.placeOfWork && touched.placeOfWork}
                                            >
                                                <FormControl.Label>Place of work</FormControl.Label>
                                                <InputComponent
                                                    isRequired
                                                    leftIcon={{
                                                        name: 'organization',
                                                        type: 'octicon',
                                                    }}
                                                    placeholder="Enter your place of work"
                                                    onChangeText={handleChange('placeOfWork')}
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl
                                                isRequired
                                                isInvalid={!!errors?.nextOfKin && touched.nextOfKin}
                                            >
                                                <FormControl.Label>Next of Kin</FormControl.Label>
                                                <InputComponent
                                                    leftIcon={{
                                                        name: 'person-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    placeholder="Enter their name"
                                                    isRequired
                                                    onChangeText={handleChange('nextOfKin')}
                                                />
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <Field
                                                name="nextOfKinPhoneNo"
                                                label="Next of Kin Contact"
                                                required
                                                component={PhoneNumberInput}
                                            />

                                            <FormControl
                                                isRequired
                                                isInvalid={!!errors?.maritalStatus && touched.maritalStatus}
                                            >
                                                <FormControl.Label>Marital Status</FormControl.Label>
                                                <SelectComponent
                                                    placeholder="Enter your marital status"
                                                    onValueChange={handleChange('maritalStatus')}
                                                >
                                                    <SelectItemComponent label="Single" value="single" />
                                                    <SelectItemComponent label="Married" value="married" />
                                                    <SelectItemComponent label="Widowed" value="widowed" />
                                                    <SelectItemComponent label="Separated" value="separated" />
                                                    <SelectItemComponent label="Divorced" value="divorced" />
                                                </SelectComponent>
                                                <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                    This field cannot be empty
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl>
                                                <HStack space={4} width="95%" justifyContent="space-between">
                                                    <ButtonComponent
                                                        onPress={handleBackPress}
                                                        width="1/2"
                                                        secondary
                                                        mt={4}
                                                    >
                                                        Go back
                                                    </ButtonComponent>
                                                    <ButtonComponent onPress={handleContinuePress} width="1/2" mt={4}>
                                                        Continue
                                                    </ButtonComponent>
                                                </HStack>
                                            </FormControl>
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

export default RegisterStepTwo;
