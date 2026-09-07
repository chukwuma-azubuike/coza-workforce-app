import React from 'react';
import { View } from 'react-native';
import { Formik, FormikConfig } from 'formik';
import { ICountry } from 'react-native-international-phone-number';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { PhoneInput } from '~/components/ui/phone-input';
import PickerSelect from '~/components/ui/picker-select';
import FormErrorMessage from '~/components/ui/error-message';
import { RegisterSchema_2 } from '@utils/schemas';
import { IRegisterFormStepTwo } from './types';
import { useRegisterForm } from './context';
import RegisterStepLayout from './components/register-step-layout';

const GENDER_OPTIONS = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
];

const MARITAL_OPTIONS = [
    { label: 'Single', value: 'Single' },
    { label: 'Married', value: 'Married' },
    { label: 'Widowed', value: 'Widowed' },
    { label: 'Separated', value: 'Separated' },
    { label: 'Divorced', value: 'Divorced' },
];

const RegisterStepTwo: React.FC = () => {
    const { formValues, goNext, goBack, nextOfKinCountry, setNextOfKinCountry } = useRegisterForm();

    const handleSelectedCountry = (country: ICountry) => setNextOfKinCountry(country);

    const onSubmit: FormikConfig<IRegisterFormStepTwo>['onSubmit'] = values => goNext(values);

    return (
        <Formik<IRegisterFormStepTwo>
            onSubmit={onSubmit}
            validateOnMount
            validationSchema={RegisterSchema_2}
            initialValues={formValues as IRegisterFormStepTwo}
        >
            {({ errors, values, touched, isValid, handleBlur, handleChange, handleSubmit }) => (
                <RegisterStepLayout
                    title="A little more"
                    subtitle="Details that help your campus support you."
                    footer={
                        <View className="w-full flex-row gap-4">
                            <Button variant="outline" className="flex-1" onPress={() => goBack(values)}>
                                Back
                            </Button>
                            <Button className="flex-1" disabled={!isValid} onPress={handleSubmit as () => void}>
                                Continue
                            </Button>
                        </View>
                    }
                >
                    <View className="w-full gap-3">
                        <View className="gap-1">
                            <Label>Gender</Label>
                            <PickerSelect
                                valueKey="value"
                                labelKey="label"
                                items={GENDER_OPTIONS}
                                value={values.gender}
                                onValueChange={handleChange('gender')}
                            />
                            {!!errors.gender && !!touched.gender && (
                                <FormErrorMessage>{errors.gender}</FormErrorMessage>
                            )}
                        </View>

                        <View className="gap-1">
                            <Label>Occupation</Label>
                            <Input
                                leftIcon={{ name: 'briefcase', type: 'feather' }}
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
                                leftIcon={{ name: 'people', type: 'ionicons' }}
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
                                leftIcon={{ name: 'person-outline', type: 'ionicons' }}
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
                                selectedCountry={nextOfKinCountry}
                                onBlur={handleBlur('nextOfKinPhoneNo')}
                                placeholder="Enter their phone number"
                                onChangeSelectedCountry={handleSelectedCountry}
                                onChangePhoneNumber={handleChange('nextOfKinPhoneNo')}
                            />
                            {!!errors.nextOfKinPhoneNo && !!touched.nextOfKinPhoneNo && (
                                <FormErrorMessage>{errors.nextOfKinPhoneNo}</FormErrorMessage>
                            )}
                        </View>

                        <View className="gap-1">
                            <Label>Marital status</Label>
                            <PickerSelect
                                valueKey="value"
                                labelKey="label"
                                items={MARITAL_OPTIONS}
                                value={values.maritalStatus}
                                onValueChange={handleChange('maritalStatus')}
                            />
                            {!!errors.maritalStatus && !!touched.maritalStatus && (
                                <FormErrorMessage>{errors.maritalStatus}</FormErrorMessage>
                            )}
                        </View>
                    </View>
                </RegisterStepLayout>
            )}
        </Formik>
    );
};

export default React.memo(RegisterStepTwo);
