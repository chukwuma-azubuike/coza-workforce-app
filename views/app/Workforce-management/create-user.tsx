import React from 'react';
import { View } from 'react-native';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useUploadUserMutation } from '@store/services/account';
import { ICreateUserPayload } from '@store/types';
import { Formik, FormikConfig } from 'formik';
import { CreateUserSchema } from '@utils/schemas';
import Utils from '@utils/index';
import { useGetCampusesQuery } from '@store/services/campus';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import PickerSelect from '~/components/ui/picker-select';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import ErrorBoundary from '~/components/composite/error-boundary';

const CreateUser: React.FC = () => {
    const {
        isSuperAdmin,
        isGlobalPastor,
        user: { campus, userId },
        rolesPermittedToCreate,
    } = useRole();
    const canSwitchCampus = isSuperAdmin || isGlobalPastor;

    const { setModalState } = useModal();
    const [campusId, setCampusId] = React.useState<string>(canSwitchCampus ? '' : campus?._id);

    const {
        data: allCampuses,
        refetch: refetchAllCampuses,
        isFetching: isFetchingAllCampuses,
        isLoading: allCampusesLoading,
        isUninitialized: campusesIsUninitialized,
    } = useGetCampusesQuery();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
        isUninitialized: campusDepartmentsIsUninitialized,
    } = useGetDepartmentsByCampusIdQuery(campusId, { skip: !campusId, refetchOnMountOrArgChange: true });

    const [uploadUser, { isLoading, error }] = useUploadUserMutation();

    const handleCampus = (value: string) => {
        setCampusId(value);
    };

    const submitForm: FormikConfig<ICreateUserPayload>['onSubmit'] = async (values, { resetForm }) => {
        try {
            const result = await uploadUser({ ...values, email: Utils.formatEmail(values.email) });

            if ('data' in result) {
                setModalState({
                    message: 'User successfully created',
                    defaultRender: true,
                    status: 'success',
                    duration: 1,
                });
                resetForm({ values: INITIAL_VALUES });
                router.back();
            }

            if ('error' in result) {
                setModalState({
                    message: `${(error as any)?.data?.message}`,
                    defaultRender: true,
                    status: 'error',
                    duration: 1,
                });
            }
            // eslint-disable-next-line no-catch-shadow, no-shadow
        } catch (error) {
            setModalState({
                message: 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 1,
            });
        }
    };

    const refresh = () => {
        !campusDepartmentsIsUninitialized && refetchDepartments();
        !campusesIsUninitialized && refetchAllCampuses();
    };

    const INITIAL_VALUES = {
        firstName: '',
        lastName: '',
        email: '',
        departmentId: '',
        roleId: '',
        campusId,
        registeredBy: userId,
        isRegistered: false,
    } as ICreateUserPayload;

    const sortedCampuses = React.useMemo(() => Utils.sortStringAscending(allCampuses, 'campusName'), [allCampuses]);

    const sortedCampusDepartments = React.useMemo(
        () => Utils.sortStringAscending(campusDepartments, 'departmentName'),
        [campusDepartments]
    );

    const memoizedRoles = React.useMemo(() => rolesPermittedToCreate(), []);

    return (
        <ViewWrapper scroll avoidKeyboard noPadding onRefresh={refresh} refreshing={isFetchingDepartments}>
            <View className="px-4 gap-6 items-start w-full">
                <View className="items-center w-full">
                    <Formik<ICreateUserPayload>
                        validateOnChange
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateUserSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <View className="w-full gap-1">
                                <View>
                                    <Label>Campus</Label>
                                    <ErrorBoundary>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="campusName"
                                            value={values?.campusId}
                                            items={sortedCampuses || []}
                                            isLoading={allCampusesLoading || isFetchingAllCampuses}
                                            placeholder="Select Campus"
                                            onValueChange={value => {
                                                handleCampus(value as string);
                                                handleChange('campusId')(value as string);
                                            }}
                                            disabled={!canSwitchCampus}
                                        />
                                    </ErrorBoundary>
                                    {!!errors?.campusId && <FormErrorMessage>{errors?.campusId}</FormErrorMessage>}
                                </View>

                                <View>
                                    <Label>Department</Label>
                                    <ErrorBoundary>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="departmentName"
                                            value={values?.departmentId}
                                            placeholder="Choose department"
                                            isLoading={campusDepartmentsLoading}
                                            items={sortedCampusDepartments || []}
                                            onValueChange={handleChange('departmentId') as any}
                                        />
                                    </ErrorBoundary>
                                    {!!errors?.departmentId && (
                                        <FormErrorMessage>{errors?.departmentId}</FormErrorMessage>
                                    )}
                                </View>
                                <View>
                                    <Label>Role</Label>
                                    <ErrorBoundary>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="name"
                                            value={values?.roleId}
                                            placeholder="Choose role"
                                            items={memoizedRoles || []}
                                            onValueChange={handleChange('roleId') as any}
                                        />
                                    </ErrorBoundary>
                                    {!!errors.roleId && <FormErrorMessage>{errors?.roleId}</FormErrorMessage>}
                                </View>
                                <View>
                                    <Label>First Name</Label>
                                    <Input value={values.firstName} onChangeText={handleChange('firstName')} />
                                    {!!errors?.firstName && <FormErrorMessage>{errors?.firstName}</FormErrorMessage>}
                                </View>
                                <View>
                                    <Label>Last Name</Label>
                                    <Input value={values.lastName} onChangeText={handleChange('lastName')} />
                                    {errors?.lastName && <FormErrorMessage>{errors?.lastName}</FormErrorMessage>}
                                </View>
                                <View>
                                    <Label>Email</Label>
                                    <Input value={values.email} onChangeText={handleChange('email')} />
                                    {!!errors.email && <FormErrorMessage>{errors?.email}</FormErrorMessage>}
                                </View>
                                <View>
                                    <Button
                                        className="mt-2"
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Submit
                                    </Button>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default CreateUser;
