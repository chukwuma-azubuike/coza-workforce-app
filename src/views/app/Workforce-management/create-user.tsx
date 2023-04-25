import React from 'react';
import { Box, FormControl, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import useModal from '../../../hooks/modal/useModal';
import { ParamListBase, useIsFocused, useNavigation } from '@react-navigation/native';
import useRole from '../../../hooks/role';
import { useGetDepartmentsByCampusIdQuery, useGetDepartmentsQuery } from '../../../store/services/department';
import { useCreateUserMutation, useGetUsersByDepartmentIdQuery } from '../../../store/services/account';
import { IDepartment, IRegisterPayload } from '../../../store/types';
import { Formik, FormikConfig } from 'formik';
import { RegisterSchema } from '../../../utils/schemas';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputComponent } from '../../../components/atoms/input';
import Utils from '../../../utils';

const createUser: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { goBack, setOptions } = useNavigation();

    const {
        user: { campus },
    } = useRole();

    const [icon, setIcon] = React.useState<{ name: string; type: string }>({
        type: 'ionicon',
        name: 'briefcase-outline',
    });

    const [departmentId, setDepartmentId] = React.useState<IDepartment['_id']>(); //Just for 3P testing

    const { setModalState } = useModal();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isSuccess: campusDepartmentsSuccess,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campus._id);

    const {
        data: workers,
        isLoading: workersLoading,
        isSuccess: workerSuccess,
    } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
    });

    const { data: departments, isError: departmentsError } = useGetDepartmentsQuery();

    const [createUser, { isError, isLoading, isSuccess, error }] = useCreateUserMutation();

    const handleSubmit: FormikConfig<IRegisterPayload>['onSubmit'] = (values, { resetForm }) => {
        createUser(values);
        resetForm(INITIAL_VALUES);
        setDepartmentId('');
    };

    const handleDepartment = (value: IDepartment['_id']) => {
        setDepartmentId(value);
    };

    const refresh = () => {
        refetchDepartments();
    };

    const INITIAL_VALUES = {} as IRegisterPayload;

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                message: 'User successfully issued',
                defaultRender: true,
                status: 'success',
                duration: 3,
            });
            goBack();
        }

        if (isError) {
            setModalState({
                message: `${error.message}`,
                defaultRender: true,
                status: 'error',
                duration: 3,
            });
        }
    }, [isSuccess, isError]);

    const isScreenFocused = useIsFocused();

    return (
        <ViewWrapper>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Box alignItems="center" w="100%">
                    <Formik<IRegisterPayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={handleSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={RegisterSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <VStack w="100%" space={1}>
                                <FormControl isRequired isInvalid={!!errors?.departmentId}>
                                    <FormControl.Label>Department</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={departmentId}
                                        placeholder="Choose department"
                                        onValueChange={handleDepartment}
                                    >
                                        {Utils.sortItem(campusDepartments, 'departmentName')?.map(
                                            (department, index) => (
                                                <SelectItemComponent
                                                    value={department._id}
                                                    key={`department-${index}`}
                                                    label={department.departmentName}
                                                    isLoading={campusDepartmentsLoading}
                                                />
                                            )
                                        )}
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
                                    <InputComponent />
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
                                    <InputComponent />
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
                                    <InputComponent />
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

export default createUser;
