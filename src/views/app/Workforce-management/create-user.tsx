import React from 'react';
import { Box, FormControl, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import useModal from '../../../hooks/modal/useModal';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useUploadUserMutation } from '../../../store/services/account';
import { ICreateUserPayload } from '../../../store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateUserSchema } from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputComponent } from '../../../components/atoms/input';
import { useGetRolesQuery } from '../../../store/services/role';

const CreateUser: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigation } = props;
    const { goBack } = navigation;

    const {
        user: { campus, userId },
    } = useRole();

    const { setModalState } = useModal();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campus._id);

    const {
        data: allRoles,
        refetch: refetchRoles,
        isFetching: isFetchingRoles,
        isLoading: rolesIsLoading,
    } = useGetRolesQuery();

    const [uploadUser, { isLoading, error }] = useUploadUserMutation();

    const submitForm: FormikConfig<ICreateUserPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await uploadUser(values);

            if ('data' in result) {
                setModalState({
                    message: 'User successfully created',
                    defaultRender: true,
                    status: 'success',
                    duration: 3,
                });
                resetForm(INITIAL_VALUES);
                goBack();
            }

            if ('error' in result) {
                setModalState({
                    message: `${error?.data?.message}`,
                    defaultRender: true,
                    status: 'error',
                    duration: 6,
                });
            }
            // eslint-disable-next-line no-catch-shadow, no-shadow
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 6,
            });
        }
    };

    const refresh = () => {
        refetchDepartments();
        refetchRoles();
    };

    const INITIAL_VALUES = {
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        roleId: '',
        campusId: campus._id,
        registeredBy: userId,
        isRegistered: false,
    } as ICreateUserPayload;

    return (
        <ViewWrapper scroll noPadding onRefresh={refresh} refreshing={isFetchingDepartments || isFetchingRoles}>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateUserPayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateUserSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <VStack w="100%" space={1}>
                                <FormControl isRequired isInvalid={!!errors?.departmentId}>
                                    <FormControl.Label>Department</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.departmentId}
                                        placeholder="Choose department"
                                        onValueChange={handleChange('departmentId')}
                                    >
                                        {campusDepartments?.map((department, index) => (
                                            <SelectItemComponent
                                                value={department._id}
                                                key={`department-${index}`}
                                                label={department.departmentName}
                                                isLoading={campusDepartmentsLoading}
                                            />
                                        ))}
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
                                        {errors?.departmentId}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors?.roleId}>
                                    <FormControl.Label>Role</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.roleId}
                                        placeholder="Choose role"
                                        onValueChange={handleChange('roleId')}
                                    >
                                        {allRoles?.map((role, index) => (
                                            <SelectItemComponent
                                                value={role._id}
                                                key={`role-${index}`}
                                                label={role.name}
                                                isLoading={rolesIsLoading}
                                            />
                                        ))}
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
                                        {errors?.roleId}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors?.firstName}>
                                    <FormControl.Label>First Name</FormControl.Label>
                                    <InputComponent value={values.firstName} onChangeText={handleChange('firstName')} />
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
                                <FormControl isRequired isInvalid={!!errors?.firstName}>
                                    <FormControl.Label>Last Name</FormControl.Label>
                                    <InputComponent value={values.lastName} onChangeText={handleChange('lastName')} />
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
                                <FormControl isRequired isInvalid={!!errors?.email}>
                                    <FormControl.Label>Email</FormControl.Label>
                                    <InputComponent value={values.email} onChangeText={handleChange('email')} />
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
                                        {errors?.email}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl>
                                    <ButtonComponent
                                        type="submit"
                                        mt={4}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Submit
                                    </ButtonComponent>
                                </FormControl>
                            </VStack>
                        )}
                    </Formik>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default CreateUser;
