import React from 'react';
import { Box, FormControl, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import useModal from '../../../hooks/modal/useModal';
import { ParamListBase } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useGetUsersByDepartmentIdQuery, useUploadUserMutation } from '../../../store/services/account';
import { ICreateUserPayload, IDepartment, IRole } from '../../../store/types';
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

    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id']>(); //Just for 3P testing
    const [roleId, setRoleId] = React.useState<IRole['_id']>();

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

    const {
        data: workers,
        refetch: refetchWorkers,
        isFetching: isFetchingWorkers,
    } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
    });

    const [uploadUser, { isError, isLoading, isSuccess, error }] = useUploadUserMutation();

    const submitForm: FormikConfig<ICreateUserPayload>['onSubmit'] = (values, { resetForm }) => {
        let stop = false;
        const newValues = {
            ...values,
            departmentId,
            roleId,
            isRegistered: false,
        };

        Object.entries(newValues).forEach(array => {
            if (array[1] === undefined) {
                setModalState({
                    message: `Plese select a ${array[0]}`,
                    defaultRender: true,
                    status: 'error',
                    duration: 3,
                });
                stop = true;
            }
        });

        if (stop) return;

        if (workers) {
            const userExists = workers.find(worker => worker.email === values.email);
            if (userExists) {
                setModalState({
                    message: 'User email already exists',
                    defaultRender: true,
                    status: 'error',
                    duration: 3,
                });
                return;
            }
        }

        console.log('Everything is fine');
        uploadUser(newValues);

        if (isSuccess) {
            setModalState({
                message: 'User successfully created',
                defaultRender: true,
                status: 'success',
                duration: 3,
            });
            console.log('success');
            resetForm(INITIAL_VALUES);
            setDepartmentId('');
            setRoleId('');

            goBack();
        }

        if (isError) {
            setModalState({
                message: `${error?.data?.message}`,
                defaultRender: true,
                status: 'error',
                duration: 3,
            });
        }
    };

    const handleDepartment = (value: IDepartment['_id']) => {
        setDepartmentId(value);
    };

    const refresh = () => {
        refetchDepartments();
        refetchRoles();
        refetchWorkers();
        console.log('refetched');
    };

    const INITIAL_VALUES = {
        firstName: '',
        lastName: '',
        email: '',
        campusId: campus._id,
        departmentId: '',
        roleId: '',
        registeredBy: userId,
        isRegistered: false,
    } as ICreateUserPayload;

    return (
        <ViewWrapper
            scroll
            noPadding
            onRefresh={refresh}
            refreshing={isFetchingDepartments || isFetchingRoles || isFetchingWorkers}
        >
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
                                        selectedValue={departmentId}
                                        placeholder="Choose department"
                                        onValueChange={val => {
                                            handleChange('departmentId');
                                            handleDepartment(val);
                                        }}
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
                                        selectedValue={roleId}
                                        placeholder="Choose role"
                                        onValueChange={val => {
                                            handleChange('roleId');
                                            setRoleId(val);
                                        }}
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
                                        {errors?.departmentId}
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
