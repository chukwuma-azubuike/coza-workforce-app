import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { IRegisterFormStepOne, IRegistrationPageStep } from './types';
import { RegisterFormContext } from '.';
import { Formik, FormikConfig } from 'formik';
import { IRegisterPayload } from '@store/types';
import { RegisterSchema_1 } from '@utils/schemas';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { PhoneInput } from '~/components/ui/phone-input';
import { ICountry } from 'react-native-international-phone-number';

const RegisterStepOne: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const { formValues, setFormValues } = React.useContext(RegisterFormContext);
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

    const handleSelectedCountry = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const onSubmit: FormikConfig<IRegisterFormStepOne>['onSubmit'] = values => {
        setFormValues(prev => {
            return { ...prev, ...values };
        });

        onStepPress(1);
    };

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-4 gap-8 pt-8 pb-4">
                    <Text className="text-3xl font-bold">Register</Text>
                    <View className="items-center w-full flex-1">
                        <Formik<IRegisterFormStepOne>
                            onSubmit={onSubmit}
                            validateOnMount={false}
                            validationSchema={RegisterSchema_1}
                            initialValues={formValues as IRegisterPayload}
                        >
                            {({
                                errors,
                                values,
                                touched,
                                isValid,
                                handleBlur,
                                validateForm,
                                handleChange,
                                setFieldError,
                                setFieldTouched,
                                ...props
                            }) => {
                                return (
                                    <View className="w-full gap-4 flex-1 justify-between">
                                        <ScrollView className="flex-1">
                                            <View className="w-full gap-3">
                                                <View className="gap-1">
                                                    <Label>First name</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'person-outline',
                                                        }}
                                                        onBlur={handleBlur('firstName')}
                                                        onChangeText={handleChange('firstName')}
                                                        value={values?.firstName}
                                                        placeholder="John"
                                                    />
                                                    {!!errors.firstName && !!touched.firstName && (
                                                        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                                                    )}
                                                </View>
                                                <View className="gap-1">
                                                    <Label>Last name</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'person-outline',
                                                        }}
                                                        placeholder="Doe"
                                                        value={values?.lastName}
                                                        onChangeText={handleChange('lastName')}
                                                    />
                                                    {!!errors.lastName && !!touched.lastName && (
                                                        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                                                    )}
                                                </View>
                                                <View className="gap-1">
                                                    <Label>Email</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'mail-outline',
                                                        }}
                                                        isDisabled
                                                        value={values?.email}
                                                        keyboardType="email-address"
                                                        placeholder="jondoe@gmail.com"
                                                        onChangeText={handleChange('email')}
                                                    />
                                                </View>
                                                <PhoneInput
                                                    defaultCountry="NG"
                                                    value={values.phoneNumber}
                                                    error={errors.phoneNumber}
                                                    placeholder="Phone number"
                                                    touched={touched.phoneNumber}
                                                    selectedCountry={selectedCountry}
                                                    onBlur={handleBlur('phoneNumber')}
                                                    onChangeSelectedCountry={handleSelectedCountry}
                                                    onChangePhoneNumber={handleChange('phoneNumber')}
                                                />
                                                <View className="gap-1">
                                                    <Label>Address</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'home',
                                                        }}
                                                        value={values?.address}
                                                        onChangeText={handleChange('address')}
                                                        placeholder="Enter your home address"
                                                    />
                                                    {!!errors.address && !!touched.address && (
                                                        <FormErrorMessage>{errors.address}</FormErrorMessage>
                                                    )}
                                                </View>
                                                <View className="gap-1">
                                                    <Label>Department</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'people',
                                                        }}
                                                        isDisabled
                                                        value={values?.departmentName}
                                                        placeholder="Quality Control"
                                                    />
                                                </View>
                                            </View>
                                        </ScrollView>
                                        <Button
                                            disabled={!isValid}
                                            onPress={() => {
                                                onSubmit(values, props as any);
                                            }}
                                        >
                                            Continue
                                        </Button>
                                    </View>
                                );
                            }}
                        </Formik>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(RegisterStepOne);
