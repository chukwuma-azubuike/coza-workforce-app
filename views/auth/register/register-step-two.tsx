import { Text } from '~/components/ui/text';
import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { IRegisterFormStepTwo, IRegistrationPageStep } from './types';
import { RegisterFormContext } from '.';
import { Formik, FormikConfig } from 'formik';
import { IRegisterPayload } from '@store/types';
import { RegisterSchema_2 } from '@utils/schemas';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { PhoneInput } from '~/components/ui/phone-input';
import { ICountry } from 'react-native-international-phone-number';
import PickerSelect from '~/components/ui/picker-select';

const RegisterStepTwo: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const { formValues, setFormValues } = React.useContext(RegisterFormContext);
    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

    const handleSelectedCountry = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const onSubmit: FormikConfig<IRegisterFormStepTwo>['onSubmit'] = values => {
        setFormValues(prev => {
            return { ...prev, ...values };
        });

        onStepPress(2);
    };

    const onGoback = (values: IRegisterFormStepTwo) => () => {
        setFormValues(prev => {
            return { ...prev, ...values };
        });

        onStepPress(0);
    };

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-4 gap-8 pt-8">
                    <Text className="text-3xl font-bold">Others</Text>
                    <View className="items-center w-full flex-1">
                        <Formik<IRegisterFormStepTwo>
                            onSubmit={onSubmit}
                            validateOnMount={false}
                            validationSchema={RegisterSchema_2}
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
                                        <ScrollView className="w-full gap-3 flex-1">
                                            <View className="w-full gap-3">
                                                <View className="gap-4">
                                                    <Label>Gender</Label>
                                                    <PickerSelect
                                                        valueKey="value"
                                                        labelKey="label"
                                                        items={[
                                                            { label: 'Male', value: 'M' },
                                                            { label: 'Female', value: 'F' },
                                                        ]}
                                                        value={values.gender}
                                                        onValueChange={handleChange('gender')}
                                                    />
                                                    {errors.gender && touched.gender && (
                                                        <Text className="text-destructive">{errors.gender}</Text>
                                                    )}
                                                </View>
                                                <View className="gap-1">
                                                    <Label>Occupation</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'briefcase-outline',
                                                            type: 'ionicons',
                                                        }}
                                                        value={values?.occupation}
                                                        onBlur={handleBlur('occupation')}
                                                        placeholder="Enter your occupation"
                                                        onChangeText={handleChange('occupation')}
                                                    />
                                                    {!!errors.occupation && !!touched.occupation && (
                                                        <FormErrorMessage>{errors.occupation}</FormErrorMessage>
                                                    )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Place of work</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'people',
                                                            type: 'ionicons',
                                                        }}
                                                        value={values?.placeOfWork}
                                                        onBlur={handleBlur('placeOfWork')}
                                                        placeholder="Enter your place of work"
                                                        onChangeText={handleChange('placeOfWork')}
                                                    />
                                                    {!!errors.placeOfWork && !!touched.placeOfWork && (
                                                        <FormErrorMessage>{errors.placeOfWork}</FormErrorMessage>
                                                    )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Next of kin</Label>
                                                    <Input
                                                        leftIcon={{
                                                            name: 'person-outline',
                                                            type: 'ionicons',
                                                        }}
                                                        value={values?.nextOfKin}
                                                        placeholder="Enter their name"
                                                        onBlur={handleBlur('nextOfKin')}
                                                        onChangeText={handleChange('nextOfKin')}
                                                    />
                                                    {!!errors.nextOfKin && !!touched.nextOfKin && (
                                                        <FormErrorMessage>{errors.nextOfKin}</FormErrorMessage>
                                                    )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Next of kin's phone number</Label>
                                                    <PhoneInput
                                                        defaultCountry="NG"
                                                        value={values.nextOfKinPhoneNo}
                                                        error={errors.nextOfKinPhoneNo}
                                                        touched={touched.nextOfKinPhoneNo}
                                                        selectedCountry={selectedCountry}
                                                        onBlur={handleBlur('nextOfKinPhoneNo')}
                                                        placeholder="Enter their phone number"
                                                        onChangeSelectedCountry={handleSelectedCountry}
                                                        onChangePhoneNumber={handleChange('nextOfKinPhoneNo')}
                                                    />
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Marital Status</Label>
                                                    <PickerSelect
                                                        valueKey="value"
                                                        labelKey="label"
                                                        items={[
                                                            { label: 'Single', value: 'Single' },
                                                            { label: 'Married', value: 'Married' },
                                                            { label: 'Widowed', value: 'Widowed' },
                                                            { label: 'Separated', value: 'Separated' },
                                                            { label: 'Divorced', value: 'Divorced' },
                                                        ]}
                                                        value={values.maritalStatus}
                                                        onValueChange={handleChange('maritalStatus')}
                                                    />
                                                    {!!errors.maritalStatus && !!touched.maritalStatus && (
                                                        <Text className="text-destructive">{errors.maritalStatus}</Text>
                                                    )}
                                                </View>
                                            </View>
                                        </ScrollView>
                                        <View className="w-full flex-row gap-4 mb-4">
                                            <Button variant="outline" onPress={onGoback(values)} className="flex-1">
                                                Back
                                            </Button>
                                            <Button
                                                disabled={!isValid}
                                                onPress={() => {
                                                    onSubmit(values, props as any);
                                                }}
                                                className="flex-1"
                                            >
                                                Continue
                                            </Button>
                                        </View>
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

export default React.memo(RegisterStepTwo);
