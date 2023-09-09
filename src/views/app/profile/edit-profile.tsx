import React from 'react';
import { FormControl, HStack, Text, VStack } from 'native-base';
import ViewWrapper from '@components/layout/viewWrapper';
import ButtonComponent from '@components/atoms/button';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { DateTimePickerComponent } from '@components/composite/date-picker';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import { IEditProfilePayload } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputComponent } from '@components/atoms/input';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@store/services/account';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useAppDispatch } from '@store/hooks';
import { userActionTypes } from '@store/services/users';
import moment from 'moment';

const EditProfile: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const userData = props.route.params as IEditProfilePayload;

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

    const INITIAL_VALUES = userData as IEditProfilePayload;

    const { data: newUserData, refetch: refetchUser, isFetching: newUserDataLoading } = useGetUserByIdQuery(user?._id);

    React.useEffect(() => {
        if (newUserData) {
            dispatch({
                type: userActionTypes.SET_USER_DATA,
                payload: newUserData,
            });
        }
    }, [newUserData]);

    return (
        <ErrorBoundary>
            <ViewWrapper scroll px={4}>
                <Formik<IEditProfilePayload>  onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
                    {({ errors, touched, values, handleChange, handleSubmit, setFieldValue }) => {
                        const handleDate = (fieldName: string, value: any) => {
                            setFieldValue(fieldName, moment(value).unix());
                        };

                        return (
                            <VStack w="100%" space={1}>
                                <If condition={!!userData.firstName}>
                                    <FormControl isRequired isInvalid={!!errors?.firstName && touched.firstName}>
                                        <FormControl.Label>First name</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.firstName}
                                            placeholder="First name"
                                            onChangeText={handleChange('firstName')}
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
                                            {errors?.firstName}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData.lastName}>
                                    <FormControl isRequired isInvalid={!!errors?.lastName && touched.lastName}>
                                        <FormControl.Label>Last name</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.lastName}
                                            placeholder="Last name"
                                            onChangeText={handleChange('lastName')}
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
                                            {errors?.lastName}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.phoneNumber}>
                                    <FormControl isRequired isInvalid={!!errors?.phoneNumber && touched.phoneNumber}>
                                        <FormControl.Label>Phone number</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.phoneNumber}
                                            placeholder="Eg: +2347012345678"
                                            onChangeText={handleChange('phoneNumber')}
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
                                            {errors?.phoneNumber}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.address}>
                                    <FormControl isRequired isInvalid={!!errors?.address && touched.address}>
                                        <FormControl.Label>Address</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.address}
                                            placeholder="Your home address"
                                            onChangeText={handleChange('address')}
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
                                </If>

                                <If condition={!!userData?.occupation}>
                                    <FormControl isRequired isInvalid={!!errors?.occupation && touched.occupation}>
                                        <FormControl.Label>Occupation</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.occupation}
                                            placeholder="Your occupation"
                                            onChangeText={handleChange('occupation')}
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
                                            {errors?.occupation}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.placeOfWork}>
                                    <FormControl isRequired isInvalid={!!errors?.placeOfWork && touched.placeOfWork}>
                                        <FormControl.Label>Place of work</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.placeOfWork}
                                            placeholder="Your place of work"
                                            onChangeText={handleChange('placeOfWork')}
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
                                            {errors?.placeOfWork}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.gender}>
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
                                </If>

                                <If condition={!!userData?.maritalStatus}>
                                    <FormControl
                                        isRequired
                                        isInvalid={!!errors?.maritalStatus && touched.maritalStatus}
                                    >
                                        <FormControl.Label>Marital Status</FormControl.Label>
                                        <SelectComponent
                                            defaultValue={values.maritalStatus}
                                            selectedValue={values.maritalStatus}
                                            onValueChange={handleChange('maritalStatus')}
                                        >
                                            <SelectItemComponent label="Single" value="single" />
                                            <SelectItemComponent label="Married" value="married" />
                                            <SelectItemComponent label="Widowed" value="widowed" />
                                            <SelectItemComponent label="Separated" value="separated" />
                                            <SelectItemComponent label="Divorced" value="divorced" />
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
                                            {errors?.maritalStatus}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.birthDay}>
                                    <FormControl isRequired isInvalid={!!errors.birthDay && touched.birthDay}>
                                        <DateTimePickerComponent
                                            label="Next Birthday"
                                            fieldName="birthDay"
                                            onSelectDate={handleDate}
                                        />
                                        {errors.birthDay && (
                                            <Text color="error.400" fontSize="xs">
                                                Please choose your next birthday
                                            </Text>
                                        )}
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.nextOfKin}>
                                    <FormControl isRequired isInvalid={!!errors?.nextOfKin && touched.nextOfKin}>
                                        <FormControl.Label>Next Of Kin</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.nextOfKin}
                                            placeholder="Next of Kin's name"
                                            onChangeText={handleChange('nextOfKin')}
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
                                            {errors?.nextOfKin}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <If condition={!!userData?.nextOfKinPhoneNo}>
                                    <FormControl
                                        isRequired
                                        isInvalid={!!errors?.nextOfKinPhoneNo && touched.nextOfKinPhoneNo}
                                    >
                                        <FormControl.Label>Next of kin phone number</FormControl.Label>
                                        <InputComponent
                                            isRequired
                                            value={values.phoneNumber}
                                            placeholder="Eg: +2347012345678"
                                            onChangeText={handleChange('nextOfKinPhoneNo')}
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
                                            {errors?.nextOfKinPhoneNo}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                </If>

                                <FormControl>
                                    <ButtonComponent
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                        isDisabled={values[Object.keys(values)[0]] === userData[Object.keys(values)[0]]}
                                    >
                                        Save
                                    </ButtonComponent>
                                </FormControl>
                            </VStack>
                        );
                    }}
                </Formik>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default EditProfile;
