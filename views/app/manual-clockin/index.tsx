import { View } from 'react-native';
import { Formik, useFormik } from 'formik';
import React from 'react';
import ErrorBoundary from '@components/composite/error-boundary';
import ViewWrapper from '@components/layout/viewWrapper';
import useGeoLocation, { GeoCoordinates } from '@hooks/geo-location';
import useRole from '@hooks/role';
import { useGetUsersQuery } from '@store/services/account';
import { IClockInPayload } from '@store/services/attendance';
import { useGetCampusesQuery } from '@store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetLatestServiceQuery } from '@store/services/services';
import { IUser } from '@store/types';
import { WorkforceClockinSchema } from '@utils/schemas';
import ThirdPartyClockButton from './clock-button';
import DynamicSearch from '@components/composite/search';
import Utils from '@utils/index';
import UserListItem from '@components/composite/user-list-item';
import FormErrorMessage from '~/components/ui/error-message';
import { Label } from '~/components/ui/label';
import PickerSelect from '~/components/ui/picker-select';

export interface IThirdPartyUserDetails {
    userId: string;
    roleId: string;
    campusId: string;
    departmentId: string;
}

const ManualClockin: React.FC = () => {
    const {
        user: { campus },
    } = useRole();

    const [campusId, setCampusId] = React.useState<string>(campus?._id);
    const [departmentId, setDepartmentId] = React.useState<string>();
    const [thirdPartyUser, setThirdPartyUserId] = React.useState<IUser>();

    const handleSubmit = () => {};

    const {
        data: campuses,
        isLoading: campusLoading,
        isFetching: campusIsFetching,
        refetch: refetchCampuses,
        isUninitialized: campusesIsUninitialized,
    } = useGetCampusesQuery();

    const sortedCampuses = React.useMemo(() => Utils.sortStringAscending(campuses, 'campusName'), [campuses]);

    const {
        data: departments,
        isLoading: departmentsLoading,
        isFetching: departmentIsFetching,
    } = useGetDepartmentsByCampusIdQuery(campusId as string, {
        skip: !campusId,
    });

    const sortedDepartments = React.useMemo(
        () => Utils.sortStringAscending(departments, 'departmentName'),
        [departments]
    );

    const {
        data: campusUsers,
        isLoading: isLoadingUsers,
        isFetching: isFetchingUsers,
        refetch: refetchCampusUsers,
        isUninitialized: campusUsersIsUninitialized,
    } = useGetUsersQuery({ campusId }, { refetchOnMountOrArgChange: true, skip: !campusId });

    const {
        data: users,
        isLoading: usersLoading,
        isFetching: usersIsFetching,
    } = useGetUsersQuery(
        { departmentId },
        {
            skip: !departmentId,
        }
    );

    const sortedUsers = React.useMemo(() => Utils.sortStringAscending(users, 'firstName'), [users]);

    const {
        data: latestService,
        refetch: latestServiceRefetch,
        isUninitialized: latestServiceIsUninitialized,
        isFetching,
    } = useGetLatestServiceQuery(campus._id);

    const { isInRange, refresh, deviceCoordinates, verifyRangeBeforeAction } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
    });

    const handleRefresh = () => {
        refresh();
        latestServiceIsUninitialized && latestServiceRefetch();
        campusUsersIsUninitialized && refetchCampusUsers();
        campusesIsUninitialized && refetchCampuses();
    };

    let INITIAL_VALUES = { campusId: campus?._id } as IClockInPayload;

    const handleUserPress = (user: IUser) => {
        INITIAL_VALUES = {
            departmentId: user?.departmentId,
            campusId: user?.campusId,
            userId: user?._id || user?.userId,
        } as IClockInPayload;
        setThirdPartyUserId(user);
        setDepartmentId(user?.departmentId);
        formik.setFieldValue('userId', user._id);
        formik.setFieldValue('departmentId', user?.departmentId);
    };

    const formik = useFormik<IClockInPayload>({
        enableReinitialize: true,
        onSubmit: handleSubmit,
        initialValues: INITIAL_VALUES,
        validationSchema: WorkforceClockinSchema,
    });

    return (
        <ErrorBoundary>
            <DynamicSearch
                data={campusUsers}
                disable={!campusUsers}
                onPress={handleUserPress}
                loading={isLoadingUsers || isFetchingUsers}
                searchFields={['firstName', 'lastName', 'departmentName', 'email']}
            />
            <ViewWrapper scroll onRefresh={handleRefresh} refreshing={isFetching} className="pt-4">
                <Formik<IClockInPayload> onSubmit={handleSubmit} {...formik}>
                    {({ errors, values, handleChange }) => {
                        const onCampusChange = (value: string) => {
                            refresh();
                            if (!!value) {
                                setCampusId(value);
                                setDepartmentId(undefined);
                                setThirdPartyUserId(undefined);
                                handleChange('campusId')(value);
                            }
                        };

                        const onDepartmentChange = (value: string) => {
                            refresh();
                            if (!!value) {
                                setDepartmentId(value);
                                setThirdPartyUserId(undefined);
                                handleChange('departmentId')(value);
                            }
                        };

                        const onUserChange = (value: string) => {
                            const user = users?.find(user => user._id === value);
                            refresh();
                            if (!!user) {
                                setThirdPartyUserId(user);
                            }
                        };

                        return (
                            <View className="px-2 w-full gap-8">
                                <View className="gap-3 w-full">
                                    <View className="w-full gap-2">
                                        <Label>Campus</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="campusName"
                                            placeholder="Choose campus"
                                            items={sortedCampuses || []}
                                            onValueChange={onCampusChange}
                                            value={values.campusId || campus?._id}
                                            isLoading={campusLoading || campusIsFetching}
                                        />
                                        {errors?.campusId && <FormErrorMessage>{errors?.campusId}</FormErrorMessage>}
                                    </View>
                                    <View className="w-full gap-2">
                                        <Label>Department</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="departmentName"
                                            placeholder="Choose department"
                                            items={sortedDepartments || []}
                                            onValueChange={onDepartmentChange}
                                            value={values.departmentId}
                                            isLoading={departmentsLoading || departmentIsFetching}
                                        />
                                        {errors?.departmentId && (
                                            <FormErrorMessage>{errors?.departmentId}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="w-full gap-2">
                                        <Label>Users</Label>
                                        <PickerSelect
                                            valueKey="_id"
                                            labelKey="firstName"
                                            placeholder="Choose user"
                                            items={sortedUsers || []}
                                            onValueChange={value => {
                                                value && handleChange('userId')(value);
                                                onUserChange(value);
                                            }}
                                            isLoading={usersLoading || usersIsFetching}
                                            value={values.userId || (thirdPartyUser?._id as unknown as string)}
                                            customLabel={user => `${user.firstName} ${user.lastName}`}
                                        />
                                        {errors?.userId && <FormErrorMessage>{errors?.userId}</FormErrorMessage>}
                                    </View>
                                    {!!thirdPartyUser && <UserListItem {...thirdPartyUser} />}
                                </View>
                                <View className="flex-1 w-full">
                                    <ThirdPartyClockButton
                                        campusId={campusId}
                                        isInRange={isInRange as boolean}
                                        refreshLocation={refresh}
                                        user={thirdPartyUser as IUser}
                                        deviceCoordinates={deviceCoordinates as GeoCoordinates}
                                        verifyRangeBeforeAction={verifyRangeBeforeAction}
                                    />
                                </View>
                            </View>
                        );
                    }}
                </Formik>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(ManualClockin);
