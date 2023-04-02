import { Icon } from '@rneui/themed';
import { Formik } from 'formik';
import { Center, FormControl, HStack, VStack } from 'native-base';
import React from 'react';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import ErrorBoundary from '../../../components/composite/error-boundary';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../config/appConfig';
import useScreenFocus from '../../../hooks/focus';
import useGeoLocation from '../../../hooks/geo-location';
import useRole from '../../../hooks/role';
import { useGetUsersByDepartmentIdQuery } from '../../../store/services/account';
import { ICampusCoordinates, IClockInPayload } from '../../../store/services/attendance';
import { useGetCampusByIdQuery, useGetCampusesQuery } from '../../../store/services/campus';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useGetLatestServiceQuery } from '../../../store/services/services';
import { IUser } from '../../../store/types';
import { WorkforceClockinSchema } from '../../../utils/schemas';
import ThirdPartyClockButton from './clock-button';

export interface IThirdPartyUserDetails {
    userId: string;
    roleId: string;
    campusId: string;
    departmentId: string;
}

const ManualClockin: React.FC = () => {
    const [campusId, setCampusId] = React.useState<string>();
    const [departmentId, setDepartmentId] = React.useState<string>();
    const [thirdPartyUser, setThirdPartyUserId] = React.useState<IUser>();

    const handleSubmit = () => {};

    const { data: campuses, isLoading: campusLoading } = useGetCampusesQuery();

    const { data: departments, isLoading: departmentsLoading } = useGetDepartmentsByCampusIdQuery(campusId, {
        skip: !campusId,
    });

    const { data: users, isLoading: usersLoading } = useGetUsersByDepartmentIdQuery(departmentId as string, {
        skip: !departmentId,
    });

    const {
        user: { campus },
    } = useRole();

    const { data: latestService, refetch: latestServiceRefetch, isFetching } = useGetLatestServiceQuery(campus._id);

    const { data: campusData } = useGetCampusByIdQuery(campus?._id);

    const selectCoordinateRef = React.useMemo(() => {
        if (latestService?.isGlobalService) return latestService?.coordinates;

        return campusData?.coordinates;
    }, [latestService, campusData]);

    const campusCoordinates = {
        latitude: selectCoordinateRef?.lat,
        longitude: selectCoordinateRef?.long,
    };

    const { isInRange, refresh, deviceCoordinates } = useGeoLocation({
        rangeToClockIn: latestService?.rangeToClockIn as number,
        campusCoordinates: campusCoordinates as ICampusCoordinates,
    });

    const handleRefresh = () => {
        refresh();
        latestServiceRefetch();
    };

    useScreenFocus({
        onFocus: refresh,
    });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll onRefresh={handleRefresh} refreshing={isFetching}>
                <Formik<IClockInPayload>
                    onSubmit={handleSubmit}
                    initialValues={{} as IClockInPayload}
                    validationSchema={WorkforceClockinSchema}
                >
                    {({ errors, touched, values, handleChange, handleSubmit, setFieldValue }) => {
                        const handleDate = (fieldName: string, value: any) => {
                            setFieldValue(fieldName, value);
                        };

                        const onCampusChange = (value: string) => {
                            refresh();
                            setCampusId(value);
                            setDepartmentId(undefined);
                            setThirdPartyUserId(undefined);
                            handleChange('campusId');
                        };

                        const onDepartmentChange = (value: string) => {
                            refresh();
                            setDepartmentId(value);
                            setThirdPartyUserId(undefined);
                            handleChange('departmentId');
                        };

                        const onUserChange = (value: string) => {
                            refresh();
                            setThirdPartyUserId(users?.find(user => user._id === value));
                        };

                        return (
                            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                                <FormControl isRequired>
                                    <FormControl.Label>Campus</FormControl.Label>
                                    <SelectComponent
                                        onValueChange={onCampusChange}
                                        selectedValue={values.campusId}
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
                                        {campuses?.map((campus, index) => (
                                            <SelectItemComponent
                                                value={campus._id}
                                                key={`campus-${index}`}
                                                label={campus.campusName}
                                                isLoading={campusLoading}
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
                                        {departments?.map((department, index) => (
                                            <SelectItemComponent
                                                value={department._id}
                                                key={`department-${index}`}
                                                isLoading={departmentsLoading}
                                                label={department.departmentName}
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
                                        {users?.map((user, index) => (
                                            <SelectItemComponent
                                                isLoading={usersLoading}
                                                key={`department-${index}`}
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

                                <Center w="full" mt={10}>
                                    <ThirdPartyClockButton
                                        isInRangeProp={isInRange}
                                        campusId={campusId as string}
                                        deviceCoordinates={deviceCoordinates}
                                        departmentId={departmentId as string}
                                        userId={thirdPartyUser?._id as string}
                                        roleId={thirdPartyUser?.role?._id as string}
                                        campusCoordinates={campusCoordinates as ICampusCoordinates}
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

export default ManualClockin;
