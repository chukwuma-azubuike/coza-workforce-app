import { Icon } from '@rneui/themed';
import { Formik } from 'formik';
import { Center, FormControl, HStack, Text, VStack } from 'native-base';
import React from 'react';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import ErrorBoundary from '@components/composite/error-boundary';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useScreenFocus from '@hooks/focus';
import useGeoLocation from '@hooks/geo-location';
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

    const { isInRange, refresh, deviceCoordinates } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
    });

    const handleRefresh = () => {
        refresh();
        latestServiceIsUninitialized && latestServiceRefetch();
        campusUsersIsUninitialized && refetchCampusUsers();
        campusesIsUninitialized && refetchCampuses();
    };

    useScreenFocus({
        onFocus: refresh,
    });

    let INITIAL_VALUES = {} as IClockInPayload;

    const handleUserPress = (user: IUser) => {
        INITIAL_VALUES = {
            departmentId: user?.departmentId,
            campusId: user?.campusId,
            userId: user?._id || user?.userId,
        } as IClockInPayload;
        setDepartmentId(user?.departmentId);
        setThirdPartyUserId(user);
    };

    return (
        <ErrorBoundary>
            <DynamicSearch
                data={campusUsers}
                disable={!campusUsers}
                onPress={handleUserPress}
                loading={isLoadingUsers || isFetchingUsers}
                searchFields={['firstName', 'lastName', 'departmentName', 'email']}
            />
            <ViewWrapper scroll onRefresh={handleRefresh} refreshing={isFetching}>
                <Formik<IClockInPayload>
                    enableReinitialize
                    onSubmit={handleSubmit}
                    initialValues={INITIAL_VALUES}
                    validationSchema={WorkforceClockinSchema}
                >
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
                            <VStack space="sm" alignItems="flex-start" w="100%" px={2}>
                                <FormControl isRequired>
                                    <FormControl.Label>Campus</FormControl.Label>
                                    <SelectComponent
                                        valueKey="_id"
                                        items={sortedCampuses}
                                        displayKey="campusName"
                                        placeholder="Choose campus"
                                        onValueChange={onCampusChange as any}
                                        selectedValue={values.campusId || campus?._id}
                                    >
                                        {sortedCampuses?.map((campus, index) => (
                                            <SelectItemComponent
                                                value={campus._id}
                                                key={`campus-${index}`}
                                                label={campus.campusName}
                                                isLoading={campusLoading || campusIsFetching}
                                            />
                                        ))}
                                    </SelectComponent>
                                    <FormControl.ErrorMessage
                                        mt={3}
                                        fontSize="2xl"
                                        leftIcon={
                                            <Icon
                                                size={16}
                                                name="warning"
                                                type="antdesign"
                                                color={THEME_CONFIG.error}
                                            />
                                        }
                                    >
                                        {errors?.campusId}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormControl.Label>Department</FormControl.Label>
                                    <SelectComponent
                                        valueKey="_id"
                                        items={sortedDepartments}
                                        displayKey="departmentName"
                                        placeholder="Choose department"
                                        selectedValue={values.departmentId}
                                        onValueChange={onDepartmentChange as any}
                                    >
                                        {sortedDepartments?.map((department, index) => (
                                            <SelectItemComponent
                                                value={department._id}
                                                key={`department-${index}`}
                                                label={department.departmentName}
                                                isLoading={departmentsLoading || departmentIsFetching}
                                            />
                                        ))}
                                    </SelectComponent>
                                    <FormControl.ErrorMessage
                                        mt={3}
                                        fontSize="2xl"
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

                                <FormControl isRequired>
                                    <FormControl.Label>Users</FormControl.Label>
                                    <SelectComponent
                                        valueKey="_id"
                                        items={sortedUsers}
                                        labelSeparator=" "
                                        placeholder="Choose user"
                                        onValueChange={onUserChange as any}
                                        displayKey={['firstName', 'lastName']}
                                        selectedValue={thirdPartyUser?._id as unknown as string}
                                    >
                                        {sortedUsers?.map((user, index) => (
                                            <SelectItemComponent
                                                key={`department-${index}`}
                                                isLoading={usersLoading || usersIsFetching}
                                                label={`${user.firstName} ${user.lastName}`}
                                                value={(user._id || user.userId) as unknown as string}
                                            />
                                        ))}
                                    </SelectComponent>
                                    <FormControl.ErrorMessage
                                        mt={3}
                                        fontSize="2xl"
                                        leftIcon={
                                            <Icon
                                                size={16}
                                                name="warning"
                                                type="antdesign"
                                                color={THEME_CONFIG.error}
                                            />
                                        }
                                    >
                                        {errors?.userId}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                {!!thirdPartyUser && <UserListItem {...thirdPartyUser} />}

                                <Center w="full" mt={10} height={280}>
                                    <ThirdPartyClockButton
                                        isInRangeProp={isInRange}
                                        campusId={campusId as string}
                                        deviceCoordinates={deviceCoordinates}
                                        departmentId={departmentId as string}
                                        userId={thirdPartyUser?._id as string}
                                        roleId={thirdPartyUser?.roleId as string}
                                    />
                                </Center>
                            </VStack>
                        );
                    }}
                </Formik>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(ManualClockin);
