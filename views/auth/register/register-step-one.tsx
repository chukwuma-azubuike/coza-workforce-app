import React from 'react';
import { View } from 'react-native';
import { Formik, FormikConfig } from 'formik';
import { ICountry } from 'react-native-international-phone-number';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { PhoneInput } from '~/components/ui/phone-input';
import FormErrorMessage from '~/components/ui/error-message';
import { RegisterSchema_1 } from '@utils/schemas';
import { IRegisterFormStepOne } from './types';
import { useRegisterForm } from './context';
import RegisterStepLayout from './components/register-step-layout';

const RegisterStepOne: React.FC = () => {
    const { formValues, goNext, goBack, phoneCountry, setPhoneCountry } = useRegisterForm();

    const handleSelectedCountry = (country: ICountry) => setPhoneCountry(country);

    // Store the raw national number; conversion to E.164 happens once, at final
    // submission, so navigating back/forward never re-formats (and corrupts) it.
    const onSubmit: FormikConfig<IRegisterFormStepOne>['onSubmit'] = values => goNext(values);

    return (
        <Formik<IRegisterFormStepOne>
            onSubmit={onSubmit}
            validateOnMount
            validationSchema={RegisterSchema_1}
            initialValues={formValues as IRegisterFormStepOne}
        >
            {({ errors, values, touched, isValid, handleBlur, handleChange, handleSubmit }) => (
                <RegisterStepLayout
                    title="Personal details"
                    subtitle="Tell us a bit about yourself to get started."
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
                            <Label>First name</Label>
                            <Input
                                leftIcon={{ type: 'ionicons', name: 'person-outline' }}
                                value={values?.firstName}
                                placeholder="John"
                                onBlur={handleBlur('firstName')}
                                onChangeText={handleChange('firstName')}
                            />
                            {!!errors.firstName && !!touched.firstName && (
                                <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                            )}
                        </View>

                        <View className="gap-1">
                            <Label>Last name</Label>
                            <Input
                                leftIcon={{ type: 'ionicons', name: 'person-outline' }}
                                placeholder="Doe"
                                value={values?.lastName}
                                onBlur={handleBlur('lastName')}
                                onChangeText={handleChange('lastName')}
                            />
                            {!!errors.lastName && !!touched.lastName && (
                                <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                            )}
                        </View>

                        <View className="gap-1">
                            <Label>Email</Label>
                            <Input
                                isDisabled
                                value={values?.email}
                                keyboardType="email-address"
                                placeholder="jondoe@gmail.com"
                                leftIcon={{ type: 'ionicons', name: 'mail-outline' }}
                            />
                            <Text className="ml-1 text-xs text-green-500">Verified ✓</Text>
                        </View>

                        <View className="gap-1">
                            <Label>Phone number</Label>
                            <PhoneInput
                                defaultCountry="NG"
                                value={values.phoneNumber}
                                error={errors.phoneNumber}
                                placeholder="Phone number"
                                touched={touched.phoneNumber}
                                selectedCountry={phoneCountry}
                                onBlur={handleBlur('phoneNumber')}
                                onChangeSelectedCountry={handleSelectedCountry}
                                onChangePhoneNumber={handleChange('phoneNumber')}
                            />
                            {!!errors.phoneNumber && !!touched.phoneNumber && (
                                <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
                            )}
                        </View>

                        <View className="gap-1">
                            <Label>Address</Label>
                            <Input
                                leftIcon={{ name: 'home', type: 'ionicons' }}
                                value={values?.address}
                                onBlur={handleBlur('address')}
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
                                isDisabled
                                leftIcon={{ type: 'ionicons', name: 'people' }}
                                value={values?.departmentName}
                                placeholder="Quality Control"
                            />
                            <Text className="ml-1 text-xs text-muted-foreground">Assigned to you by your campus</Text>
                        </View>
                    </View>
                </RegisterStepLayout>
            )}
        </Formik>
    );
};

export default React.memo(RegisterStepOne);
