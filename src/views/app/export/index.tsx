import { Box, FormControl, HStack, VStack } from 'native-base';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useGetCampusesQuery } from '../../../store/services/campus';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { useGetServicesQuery } from '../../../store/services/services';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import ButtonComponent from '../../../components/atoms/button';
import moment from 'moment';
import { downloadFile } from '../../../utils/downloadFile';
import { useGetAttendanceReportForDownloadQuery } from '../../../store/services/attendance';
import { useGetPermissionsReportForDownloadQuery } from '../../../store/services/permissions';
import { useGetTicketsReportForDownloadQuery } from '../../../store/services/tickets';
import { Alert } from 'react-native';
import { Icon } from '@rneui/themed';
import If from '../../../components/composite/if-container';
import { DateTimePickerComponent } from '../../../components/composite/date-picker';
import useRole from '../../../hooks/role';

export type IExportType = 'attendance' | 'tickets' | 'permissions';

export enum IReportTypes {
    TICKETS = 'tickets',
    ATTENDANCE = 'attendance',
    PERMISSIONS = 'permissions',
}

const Export: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props?.route?.params as { type: IExportType };
    const type = params?.type;

    const { isCampusPastor, isQC, user } = useRole();
    const cannotSwitchCampus = isCampusPastor || isQC;

    const [campusId, setCampusId] = React.useState<string>(cannotSwitchCampus ? user?.campus?._id : '');
    const [departmentId, setDepartmentId] = React.useState<string>();
    const [serviceId, setServiceId] = React.useState<string>();
    const downloadState = React.useState<boolean>(false);
    const [dataType, setDataType] = React.useState<IExportType>(type);
    const [startDate, setStartDate] = React.useState<number>();
    const [endDate, setEndDate] = React.useState<number>();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campusId, { skip: !campusId });

    const {
        data: allCampuses,
        refetch: refetchAllCampuses,
        isFetching: isFetchingAllCampuses,
        isLoading: allCampusesLoading,
    } = useGetCampusesQuery();

    const { data: services, refetch: refetchServices, isLoading: servicesLoading } = useGetServicesQuery({});

    const pastServices = React.useMemo(
        () => services?.filter(service => moment(service.clockInStartTime).unix() < moment().unix()),
        [services]
    );

    const queryParamsReady = !!campusId || !!serviceId || !!departmentId;

    const {
        data: attendance,
        isSuccess: attendanceIsSuccess,
        isLoading: attendanceIsLoading,
        isFetching: attendanceIsFetching,
    } = useGetAttendanceReportForDownloadQuery(
        {
            campusId,
            serviceId,
            departmentId,
        },
        { skip: !queryParamsReady && dataType !== 'attendance', refetchOnMountOrArgChange: true }
    );
    const {
        data: permissions,
        isSuccess: permissionsIsSuccess,
        isLoading: permissionsIsLoading,
        isFetching: permissionIsFetching,
    } = useGetPermissionsReportForDownloadQuery(
        {
            endDate,
            campusId,
            startDate,
            departmentId,
        },
        { skip: !queryParamsReady && dataType !== 'permissions', refetchOnMountOrArgChange: true }
    );
    const {
        data: tickets,
        isSuccess: ticketsIsSuccess,
        isLoading: ticketsIsLoading,
        isFetching: ticketsIsFetching,
    } = useGetTicketsReportForDownloadQuery(
        {
            campusId,
            serviceId,
            departmentId,
        },
        { skip: !queryParamsReady && dataType !== 'tickets', refetchOnMountOrArgChange: true }
    );

    const handleDataType = (value: IExportType) => {
        setDataType(value);
    };

    const handleCampus = (value: string) => {
        setCampusId(value);
    };

    const handleDepartment = (value: string) => {
        setDepartmentId(value);
    };

    const handleService = (value: string) => {
        setServiceId(value);
    };

    const handleDownload = async () => {
        if (reportData[dataType]?.length) {
            return downloadFile(
                reportData[dataType],
                `${services?.find(service => service._id === serviceId)?.name}_${
                    allCampuses?.find(campus => campus._id === campusId)?.campusName
                }_${
                    campusDepartments?.find(department => department._id === departmentId)?.departmentName
                }_${dataType}_report`
            );
        }
        Alert.alert('Empty report', 'No records to download.');
    };

    const reportData = {
        tickets,
        permissions,
        attendance,
    };

    const isLoading =
        ticketsIsLoading ||
        ticketsIsFetching ||
        attendanceIsLoading ||
        attendanceIsFetching ||
        permissionsIsLoading ||
        permissionIsFetching;

    const dataTypes = [
        {
            name: 'Attendance',
            value: IReportTypes.ATTENDANCE,
        },
        {
            name: 'Tickets',
            value: IReportTypes.TICKETS,
        },
        {
            name: 'Permissions',
            value: IReportTypes.PERMISSIONS,
        },
    ];

    const readyForDownload = attendanceIsSuccess || ticketsIsSuccess || permissionsIsSuccess;
    const isPermission = dataType === 'permissions';

    const handleStartDate = (fieldName: string, value: number) => {
        setStartDate(moment(value).valueOf() / 1000);
    };

    const handleEndDate = (fieldName: string, value: number) => {
        setEndDate(moment(value).valueOf() / 1000);
    };

    return (
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Box alignItems="center" w="100%">
                    <VStack w="100%" space={1}>
                        <FormControl isRequired>
                            <FormControl.Label>Data Type</FormControl.Label>
                            <SelectComponent
                                defaultValue={dataType}
                                placeholder="Choose data type"
                                onValueChange={handleDataType as any}
                            >
                                {dataTypes?.map((data, index) => (
                                    <SelectItemComponent value={data.value} key={`data-${index}`} label={data.name} />
                                ))}
                            </SelectComponent>
                        </FormControl>
                        <FormControl isRequired>
                            <FormControl.Label>Campus</FormControl.Label>
                            <SelectComponent
                                selectedValue={campusId}
                                placeholder="Choose campus"
                                onValueChange={handleCampus}
                                isDisabled={cannotSwitchCampus}
                            >
                                {allCampuses?.map((campus, index) => (
                                    <SelectItemComponent
                                        value={campus._id}
                                        key={`campus-${index}`}
                                        label={campus.campusName}
                                        isLoading={allCampusesLoading}
                                    />
                                ))}
                            </SelectComponent>
                        </FormControl>
                        <If condition={!isPermission}>
                            <FormControl isRequired>
                                <FormControl.Label>Service</FormControl.Label>
                                <SelectComponent
                                    placeholder="Choose service"
                                    selectedValue={serviceId}
                                    onValueChange={handleService}
                                >
                                    {pastServices?.map((service, index) => (
                                        <SelectItemComponent
                                            value={service._id}
                                            key={`service-${index}`}
                                            label={`${service.name} - ${
                                                service.serviceTime
                                                    ? moment(service.serviceTime).format('DD-MM-YYYY')
                                                    : ''
                                            }`}
                                            isLoading={servicesLoading}
                                        />
                                    ))}
                                </SelectComponent>
                            </FormControl>
                        </If>
                        <If condition={isPermission}>
                            <HStack justifyContent="space-between">
                                <FormControl w="1/2">
                                    <DateTimePickerComponent
                                        label="Start date"
                                        fieldName="startDate"
                                        onSelectDate={handleStartDate}
                                    />
                                </FormControl>
                                <FormControl w="1/2">
                                    <DateTimePickerComponent
                                        label="End date"
                                        fieldName="endDate"
                                        onSelectDate={handleEndDate}
                                    />
                                </FormControl>
                            </HStack>
                        </If>
                        <FormControl isRequired>
                            <FormControl.Label>Department</FormControl.Label>
                            <SelectComponent
                                selectedValue={departmentId}
                                placeholder="Choose department"
                                onValueChange={handleDepartment}
                            >
                                {/* TODO: Restore on crash fix */}
                                {/* <SelectItemComponent label="No department" value={undefined as unknown as string} /> */}
                                {campusDepartments?.map((department, index) => (
                                    <SelectItemComponent
                                        value={department._id}
                                        key={`department-${index}`}
                                        label={department.departmentName}
                                        isLoading={campusDepartmentsLoading}
                                    />
                                ))}
                            </SelectComponent>
                        </FormControl>

                        <ButtonComponent
                            mt={4}
                            type="submit"
                            isLoading={isLoading}
                            onPress={handleDownload}
                            isDisabled={!readyForDownload}
                            startIcon={<Icon name="download-outline" type="ionicon" size={28} color="white" />}
                        >
                            Download
                        </ButtonComponent>
                    </VStack>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default Export;
