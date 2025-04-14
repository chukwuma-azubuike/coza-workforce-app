import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import DateTimePicker from '~/components/composite/date-time-picker';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
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
import { InputComponent } from '~/components/atoms/input';
import { useLocalSearchParams } from 'expo-router';

const EditProfile: React.FC = () => {
    const userData = useLocalSearchParams<IEditProfilePayload>();

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

    return (
        <ErrorBoundary>
            <ViewWrapper scroll style={{ paddingHorizontal: 12, paddingVertical: 20 }}>
                <Formik<IEditProfilePayload> onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
                    {({ errors, touched, values, handleChange, handleSubmit, setFieldValue }) => {
                        const handleDate = (fieldName: string, value: any) => {
                            setFieldValue(fieldName, dayjs(value).unix());
                        };

                        return (
                            <View space={1}>
                                <If condition={!!userData?.firstName}>
                                    <View isInvalid={!!errors?.firstName && touched.firstName}>
                                        <Label>First name</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.firstName}
                                            placeholder="First name"
                                            onChangeText={handleChange('firstName')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.firstName}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.lastName}>
                                    <View isRequired isInvalid={!!errors?.lastName && touched.lastName}>
                                        <Label>Last name</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.lastName}
                                            placeholder="Last name"
                                            onChangeText={handleChange('lastName')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.lastName}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.phoneNumber}>
                                    <View isRequired isInvalid={!!errors?.phoneNumber && touched.phoneNumber}>
                                        <Label>Phone number</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.phoneNumber}
                                            placeholder="Eg: +2347012345678"
                                            onChangeText={handleChange('phoneNumber')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.phoneNumber}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.address}>
                                    <View isRequired isInvalid={!!errors?.address && touched.address}>
                                        <Label>Address</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.address}
                                            placeholder="Your home address"
                                            onChangeText={handleChange('address')}
                                        />
                                        <FormErrorMessage
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
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.occupation}>
                                    <View isRequired isInvalid={!!errors?.occupation && touched.occupation}>
                                        <Label>Occupation</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.occupation}
                                            placeholder="Your occupation"
                                            onChangeText={handleChange('occupation')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.occupation}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.placeOfWork}>
                                    <View isRequired isInvalid={!!errors?.placeOfWork && touched.placeOfWork}>
                                        <Label>Place of work</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.placeOfWork}
                                            placeholder="Your place of work"
                                            onChangeText={handleChange('placeOfWork')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.placeOfWork}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.gender}>
                                    <View isRequired isInvalid={!!errors?.gender && touched?.gender}>
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
                                        <FormErrorMessage
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
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.maritalStatus}>
                                    <ErrorBoundary>
                                        <View isRequired isInvalid={!!errors?.maritalStatus && touched.maritalStatus}>
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
                                            <FormErrorMessage
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
                                                {errors?.maritalStatus}
                                            </FormErrorMessage>
                                        </View>
                                    </ErrorBoundary>
                                </If>
                                <If condition={!!userData?.birthDay}>
                                    <View isRequired isInvalid={!!errors.birthDay && touched.birthDay}>
                                        <DateTimePicker
                                            label="Next Birthday"
                                            fieldName="birthDay"
                                            onSelectDate={handleDate}
                                        />
                                        {errors.birthDay && (
                                            <Text color="error.400" fontSize="xs">
                                                Please choose your next birthday
                                            </Text>
                                        )}
                                    </View>
                                </If>
                                <If condition={!!userData?.nextOfKin}>
                                    <View isRequired isInvalid={!!errors?.nextOfKin && touched.nextOfKin}>
                                        <Label>Next Of Kin</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.nextOfKin}
                                            placeholder="Next of Kin's name"
                                            onChangeText={handleChange('nextOfKin')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.nextOfKin}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <If condition={!!userData?.nextOfKinPhoneNo}>
                                    <View isRequired isInvalid={!!errors?.nextOfKinPhoneNo && touched.nextOfKinPhoneNo}>
                                        <Label>Next of kin phone number</Label>
                                        <InputComponent
                                            isRequired
                                            value={values?.phoneNumber}
                                            placeholder="Eg: +2347012345678"
                                            onChangeText={handleChange('nextOfKinPhoneNo')}
                                        />
                                        <FormErrorMessage
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
                                            {errors?.nextOfKinPhoneNo}
                                        </FormErrorMessage>
                                    </View>
                                </If>
                                <View>
                                    <ButtonComponent
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                        isDisabled={values[Object.keys(values)[0]] === userData[Object.keys(values)[0]]}
                                    >
                                        Save
                                    </ButtonComponent>
                                </View>
                            </View>
                        );
                    }}
                </Formik>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(EditProfile);
