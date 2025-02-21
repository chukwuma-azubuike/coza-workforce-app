import React from 'react';
import { Box, FormControl, Heading, HStack, VStack, WarningOutlineIcon } from 'native-base';
import { InputComponent } from '@components/atoms/input';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { Field, Formik } from 'formik';
import { IRegisterPayload } from '@store/types';
import { RegisterSchema_2 } from '@utils/schemas';
import { RegisterFormContext } from '.';
import PhoneNumberInput from '@components/atoms/phone-input';
import Utils from '@utils/index';
import CenterComponent from '@components/layout/center';
import useDevice from '@hooks/device';

const RegisterStepTwo: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const handleBackPress = () => onStepPress(0);

    const onSubmit = () => {};

    const { formValues, setFormValues } = React.useContext(RegisterFormContext);

    const { isAndroidOrBelowIOSTenOrTab } = useDevice();

    return (
        <ViewWrapper scroll style={{ paddingTop: isAndroidOrBelowIOSTenOrTab ? 20 : 100 }}>
            <CenterComponent>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Register</Heading>
                    <Box alignItems="center" w="100%">
                        <Formik<IRegisterPayload>
                            onSubmit={onSubmit}
                            validateOnMount={false}
                            validationSchema={RegisterSchema_2}
                            initialValues={formValues as IRegisterPayload}
                            validate={value => Utils.validatePhoneNumber(value.nextOfKinPhoneNo)}
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
                                                valueKey="_id"
                                                displayKey="name"
                                                selectedValue={values?.gender}
                                                placeholder="Enter your gender"
                                                items={[
                                                    { _id: 'M', name: 'Male' },
                                                    { _id: 'F', name: 'Female' },
                                                ]}
                                                onValueChange={handleChange('gender') as any}
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

                                        <FormControl isRequired isInvalid={!!errors?.occupation && touched.occupation}>
                                            <FormControl.Label>Occupation</FormControl.Label>
                                            <InputComponent
                                                isRequired
                                                leftIcon={{
                                                    name: 'briefcase-outline',
                                                    type: 'ionicon',
                                                }}
                                                value={values?.occupation}
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
                                                value={values?.placeOfWork}
                                                placeholder="Enter your place of work"
                                                onChangeText={handleChange('placeOfWork')}
                                            />
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                This field cannot be empty
                                            </FormControl.ErrorMessage>
                                        </FormControl>
                                        <FormControl isRequired isInvalid={!!errors?.nextOfKin && touched.nextOfKin}>
                                            <FormControl.Label>Next of Kin</FormControl.Label>
                                            <InputComponent
                                                leftIcon={{
                                                    name: 'person-outline',
                                                    type: 'ionicon',
                                                }}
                                                placeholder="Enter their name"
                                                isRequired
                                                value={values?.nextOfKin}
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
                                            value={values?.nextOfKinPhoneNo}
                                            component={PhoneNumberInput}
                                        />

                                        <FormControl
                                            isRequired
                                            isInvalid={!!errors?.maritalStatus && touched.maritalStatus}
                                        >
                                            <FormControl.Label>Marital Status</FormControl.Label>
                                            <SelectComponent
                                                selectedValue={values?.maritalStatus}
                                                onValueChange={handleChange('maritalStatus') as any}
                                                valueKey="_id"
                                                displayKey="name"
                                                placeholder="Enter your marital status"
                                                items={[
                                                    { _id: 'Single', name: 'Single' },
                                                    { _id: 'Married', name: 'Married' },
                                                    { _id: 'Widowed', name: 'Widowed' },
                                                    { _id: 'Separated', name: 'Separated' },
                                                    { _id: 'Divorced', name: 'Divorced' },
                                                ]}
                                            >
                                                <SelectItemComponent label="Single" value="Single" />
                                                <SelectItemComponent label="Married" value="Married" />
                                                <SelectItemComponent label="Widowed" value="Widowed" />
                                                <SelectItemComponent label="Separated" value="Separated" />
                                                <SelectItemComponent label="Divorced" value="Divorced" />
                                            </SelectComponent>
                                            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                This field cannot be empty
                                            </FormControl.ErrorMessage>
                                        </FormControl>
                                        <FormControl>
                                            <HStack space={4} flex={1} mt={2} justifyContent="space-between">
                                                <ButtonComponent
                                                    secondary
                                                    size="md"
                                                    style={{ flex: 1 }}
                                                    onPress={handleBackPress}
                                                >
                                                    Go back
                                                </ButtonComponent>
                                                <ButtonComponent
                                                    size="md"
                                                    style={{ flex: 1 }}
                                                    onPress={handleContinuePress}
                                                >
                                                    Continue
                                                </ButtonComponent>
                                            </HStack>
                                        </FormControl>
                                    </>
                                );
                            }}
                        </Formik>
                    </Box>
                </VStack>
            </CenterComponent>
        </ViewWrapper>
    );
};

export default React.memo(RegisterStepTwo);
