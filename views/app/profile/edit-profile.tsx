import { View } from 'react-native';
import React, { useState } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import DateTimePicker from '~/components/ui/date-time-picker';
import useModal from '@hooks/modal/useModal';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { IEditProfilePayload } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@store/services/account';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useAppDispatch } from '@store/hooks';
import dayjs from 'dayjs';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { useLocalSearchParams } from 'expo-router';
import { Input } from '~/components/ui/input';
import { PhoneInput } from '~/components/ui/phone-input';
import { ICountry } from 'react-native-international-phone-number';
import { Button } from '~/components/ui/button';

const EditProfile: React.FC = () => {
    const userData = useLocalSearchParams<IEditProfilePayload>();

    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

    const handleSelectedCountry = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const { user } = useRole();
    const { goBack } = useNavigation();
    const dispatch = useAppDispatch();

    const { setModalState } = useModal();

    const [updateUser, { reset, isLoading, isError, isSuccess, error }] = useUpdateUserMutation();

    const onSubmit = (value: IEditProfilePayload) => {
        updateUser({ ...value, _id: user?._id });
    };

    React.useEffect(() => {
        if (isSuccess) {
            reset();
            refetchUser();
            goBack();
        }

        if (isError) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
            reset();
        }
    }, [isSuccess, isError]);

    const INITIAL_VALUES = (userData || {}) as IEditProfilePayload;

    const { data: newUserData, refetch: refetchUser, isFetching: newUserDataLoading } = useGetUserByIdQuery(user?._id);

    console.log(INITIAL_VALUES);

    return (
        <ErrorBoundary>
            <View className="p-4">
                <Formik<IEditProfilePayload> onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
                    {({ errors, touched, values, handleChange, handleSubmit, handleBlur }) => {
                        return (
                            <View className="gap-6">
                                <If condition={!!userData?.firstName}>
                                    <View className="gap-1">
                                        <Label>First name</Label>
                                        <Input
                                            value={values?.firstName}
                                            placeholder="First name"
                                            onChangeText={handleChange('firstName')}
                                        />
                                        {errors?.firstName && <FormErrorMessage>{errors?.firstName}</FormErrorMessage>}
                                    </View>
                                </If>
                                <If condition={!!userData?.lastName}>
                                    <View className="gap-1">
                                        <Label>Last name</Label>
                                        <Input
                                            value={values?.lastName}
                                            placeholder="Last name"
                                            onChangeText={handleChange('lastName')}
                                        />
                                        {errors?.firstName && <FormErrorMessage>{errors?.firstName}</FormErrorMessage>}
                                    </View>
                                </If>
                                <If condition={!!userData?.phoneNumber}>
                                    <View className="gap-1">
                                        <Label>Phone number</Label>
                                        <PhoneInput
                                            defaultCountry="NG"
                                            error={errors.phoneNumber}
                                            placeholder="Phone number"
                                            touched={touched.phoneNumber}
                                            selectedCountry={selectedCountry}
                                            onBlur={handleBlur('phoneNumber')}
                                            value={values.phoneNumber as string}
                                            onChangeSelectedCountry={handleSelectedCountry}
                                            onChangePhoneNumber={handleChange('phoneNumber')}
                                        />
                                        {errors?.phoneNumber && (
                                            <FormErrorMessage>{errors?.phoneNumber}</FormErrorMessage>
                                        )}
                                    </View>
                                </If>
                                <If condition={!!userData?.address}>
                                    <View className="gap-1">
                                        <Label>Address</Label>
                                        <Input
                                            value={values?.address}
                                            placeholder="Address"
                                            onChangeText={handleChange('address')}
                                        />
                                        {errors?.address && <FormErrorMessage>{errors?.address}</FormErrorMessage>}
                                    </View>
                                </If>
                                <If condition={!!userData?.occupation}>
                                    <View className="gap-1">
                                        <Label>Occupation</Label>
                                        <Input
                                            placeholder="Occupation"
                                            value={values?.occupation}
                                            onChangeText={handleChange('occupation')}
                                        />
                                        {errors?.occupation && (
                                            <FormErrorMessage>{errors?.occupation}</FormErrorMessage>
                                        )}
                                    </View>
                                </If>
                                <If condition={!!userData?.placeOfWork}>
                                    <View className="gap-1">
                                        <Label>Place of work</Label>
                                        <Input
                                            value={values?.placeOfWork}
                                            placeholder="Place of work"
                                            onChangeText={handleChange('placeOfWork')}
                                        />
                                        {errors?.placeOfWork && (
                                            <FormErrorMessage>{errors?.placeOfWork}</FormErrorMessage>
                                        )}
                                    </View>
                                </If>
                                <If condition={!!userData?.gender}>
                                    <View className="gap-1">
                                        <Label>Gender</Label>
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
                                        {errors?.gender && <FormErrorMessage>{errors?.gender}</FormErrorMessage>}
                                    </View>
                                </If>
                                <If condition={!!userData?.maritalStatus}>
                                    <ErrorBoundary>
                                        <View className="gap-1">
                                            <Label>Marital Status</Label>
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
                                            {errors?.maritalStatus && (
                                                <FormErrorMessage>{errors?.maritalStatus}</FormErrorMessage>
                                            )}
                                        </View>
                                    </ErrorBoundary>
                                </If>
                                <If condition={!!userData?.birthDay}>
                                    <View className="gap-1">
                                        <DateTimePicker
                                            mode="date"
                                            error={errors.birthDay}
                                            touched={touched.birthDay}
                                            label="Date of birth"
                                            initialValue={values.birthDay}
                                            placeholder="Enter your date of birth"
                                            maximumDate={dayjs().subtract(18, 'years').toDate()}
                                            minimumDate={dayjs().subtract(120, 'years').toDate()}
                                            onConfirm={handleChange('birthDay') as unknown as (value: Date) => void}
                                        />
                                        {!!errors.birthDay && !!touched.birthDay && (
                                            <FormErrorMessage>{errors.birthDay}</FormErrorMessage>
                                        )}
                                    </View>
                                </If>
                                <If condition={!!userData?.nextOfKin}>
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
                                </If>
                                <If condition={!!userData?.nextOfKinPhoneNo}>
                                    <View className="gap-1">
                                        <Label>Next of kin's phone number</Label>
                                        <PhoneInput
                                            defaultCountry="NG"
                                            error={errors.nextOfKinPhoneNo}
                                            touched={touched.nextOfKinPhoneNo}
                                            selectedCountry={selectedCountry}
                                            onBlur={handleBlur('nextOfKinPhoneNo')}
                                            placeholder="Enter their phone number"
                                            value={values.nextOfKinPhoneNo as string}
                                            onChangeSelectedCountry={handleSelectedCountry}
                                            onChangePhoneNumber={handleChange('nextOfKinPhoneNo')}
                                        />
                                    </View>
                                </If>
                                <View>
                                    <Button
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                        disabled={
                                            (values as any)[Object.keys(values)[0]] ===
                                            (userData as any)[Object.keys(values)[0]]
                                        }
                                    >
                                        Save
                                    </Button>
                                </View>
                            </View>
                        );
                    }}
                </Formik>
            </View>
        </ErrorBoundary>
    );
};

export default React.memo(EditProfile);
