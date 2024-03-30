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
import { AVATAR_FALLBACK_URL } from '@constants/index';
import AvatarComponent from '@components/atoms/avatar';
import Utils from '@utils/index';
import StatusTag from '@components/atoms/status-tag';
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

    const [searchedUser, setSearchedUser] = React.useState<IUser | undefined>();

    const handleUserPress = (user: IUser) => {
        setThirdPartyUserId(user);
        setSearchedUser(user);
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
                    onSubmit={handleSubmit}
                    initialValues={{} as IClockInPayload}
                    validationSchema={WorkforceClockinSchema}
                >
                    {({ errors, values, handleChange }) => {
                        const onCampusChange = (value: string) => {
                            refresh();
                            setCampusId(value);
                            setDepartmentId(undefined);
                            setThirdPartyUserId(undefined);
                            handleChange('campusId');
                            setSearchedUser(undefined);
                        };

                        const onDepartmentChange = (value: string) => {
                            refresh();
                            setDepartmentId(value);
                            setSearchedUser(undefined);
                            setThirdPartyUserId(undefined);
                            handleChange('departmentId');
                        };

                        const onUserChange = (value: string) => {
                            const user = users?.find(user => user._id === value);
                            refresh();
                            setSearchedUser(user);
                            setThirdPartyUserId(user);
                        };

                        return (
                            <VStack space="sm" alignItems="flex-start" w="100%" px={4}>
                                <FormControl isRequired>
                                    <FormControl.Label>Campus</FormControl.Label>
                                    <SelectComponent
                                        onValueChange={onCampusChange}
                                        selectedValue={values.campusId}
                                        defaultValue={campus?._id}
                                        dropdownIcon={
                                            <HStack mr={2} space={2}>
                                                <Icon
                                                    type="entypo"
                                                    name="chevron-small-down"
                                                    color={THEME_CONFIG.lightGray}
                                                />
                                            </HStack>
                                        }
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
                                        onValueChange={onDepartmentChange}
                                        selectedValue={values.departmentId}
                                        dropdownIcon={
                                            <HStack mr={2} space={2}>
                                                <Icon
                                                    type="entypo"
                                                    name="chevron-small-down"
                                                    color={THEME_CONFIG.lightGray}
                                                />
                                            </HStack>
                                        }
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
                                        dropdownIcon={
                                            <HStack mr={2} space={2}>
                                                <Icon
                                                    type="entypo"
                                                    name="chevron-small-down"
                                                    color={THEME_CONFIG.lightGray}
                                                />
                                            </HStack>
                                        }
                                        selectedValue={thirdPartyUser?._id as unknown as string}
                                        onValueChange={onUserChange as unknown as (value: string) => void}
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

                                {!!searchedUser && <UserListItem {...searchedUser} />}

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
