import { FormControl, HStack, VStack } from 'native-base';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetCampusesQuery } from '@store/services/campus';
import ViewWrapper from '@components/layout/viewWrapper';
import { useGetServicesQuery } from '@store/services/services';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import ButtonComponent from '@components/atoms/button';
import moment from 'moment';
import { downloadFile } from '@utils/downloadFile';
import { useGetAttendanceReportForDownloadQuery } from '@store/services/attendance';
import { useGetPermissionsReportForDownloadQuery } from '@store/services/permissions';
import { useGetTicketsReportForDownloadQuery } from '@store/services/tickets';
import { Alert, View } from 'react-native';
import { Icon } from '@rneui/themed';
import If from '@components/composite/if-container';
import { DateTimePickerComponent } from '@components/composite/date-picker';
import useRole from '@hooks/role';
import { generateCummulativeAttendanceReport } from '@utils/generateCummulativeAttendanceReport';
import { generateReportName } from '@utils/generateReportName';
import { IReportDownloadPayload } from '@store/types';
import Utils from '@utils/index';
import spreadDependencyArray from '@utils/spreadDependencyArray';
import HStackComponent from '@components/layout/h-stack';

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
    const [serviceId, setServiceId] = React.useState<string>('all-services');
    const [triggerFetch, setTriggerFetch] = React.useState<boolean>(false);
    const [dataType, setDataType] = React.useState<IExportType>(type);
    const [startDate, setStartDate] = React.useState<IReportDownloadPayload['startDate']>();
    const [endDate, setEndDate] = React.useState<IReportDownloadPayload['endDate']>();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campusId, { skip: !campusId });

    const sortedCampusDepartments = React.useMemo(
        () => Utils.sortStringAscending(campusDepartments, 'departmentName'),
        [...spreadDependencyArray(campusDepartments, '_id')]
    );

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

    const {
        data: attendance,
        isSuccess: attendanceIsSuccess,
        isLoading: attendanceIsLoading,
        isFetching: attendanceIsFetching,
    } = useGetAttendanceReportForDownloadQuery(
        { endDate, startDate, campusId, serviceId, departmentId },
        { skip: !triggerFetch, refetchOnMountOrArgChange: true }
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
        { skip: !triggerFetch, refetchOnMountOrArgChange: true }
    );
    const {
        data: tickets,
        isSuccess: ticketsIsSuccess,
        isLoading: ticketsIsLoading,
        isFetching: ticketsIsFetching,
    } = useGetTicketsReportForDownloadQuery(
        { endDate, startDate, campusId, serviceId, departmentId },
        { skip: !triggerFetch, refetchOnMountOrArgChange: true }
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

    const handlePress = () => {
        if (!triggerFetch) {
            return setTriggerFetch(true);
        }
        if (readyForDownload && triggerFetch) {
            handleDownload();
        }
    };

    const handleDownload = async () => {
        setTriggerFetch(false);

        if (reportData[dataType]?.length) {
            try {
                return downloadFile(
                    dataType === 'attendance'
                        ? generateCummulativeAttendanceReport(reportData[dataType])
                        : reportData[dataType],
                    generateReportName({
                        campusId,
                        dataType,
                        services,
                        serviceId,
                        departmentId,
                        campusDepartments,
                        campuses: allCampuses,
                    })
                );
            } catch (err) {
                Alert.alert(JSON.stringify(err));
            }
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
        setStartDate(moment(value).unix());
    };

    const handleEndDate = (fieldName: string, value: number) => {
        setEndDate(moment(value).unix());
    };

    return (
        <ViewWrapper style={{ paddingTop: 8 }}>
            <View style={{ alignItems: 'center' }}>
                <View style={{ gap: 10, width: '100%' }}>
                    <FormControl isRequired>
                        <FormControl.Label>Data Type</FormControl.Label>
                        <SelectComponent
                            valueKey="value"
                            displayKey="name"
                            items={dataTypes}
                            selectedValue={dataType}
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
                            valueKey="_id"
                            displayKey="campusName"
                            selectedValue={campusId}
                            items={allCampuses || []}
                            placeholder="Choose campus"
                            isDisabled={cannotSwitchCampus}
                            onValueChange={handleCampus as any}
                        >
                            <SelectItemComponent
                                key="all-campuses"
                                label="All Campuses"
                                value={undefined as unknown as string}
                            />
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
                                valueKey="_id"
                                selectedValue={serviceId}
                                items={pastServices || []}
                                placeholder="Choose service"
                                displayKey={['name', 'serviceTime']}
                                onValueChange={handleService as any}
                            >
                                <SelectItemComponent
                                    key="all-services"
                                    label="All Services"
                                    value={undefined as unknown as string}
                                />
                                {pastServices?.map((service, index) => (
                                    <SelectItemComponent
                                        value={service._id}
                                        key={`service-${index}`}
                                        label={`${service.name} - ${
                                            service.serviceTime ? moment(service.serviceTime).format('DD-MM-YYYY') : ''
                                        }`}
                                        isLoading={servicesLoading}
                                    />
                                ))}
                            </SelectComponent>
                        </FormControl>
                    </If>
                    <HStackComponent style={{ flex: 0 }}>
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
                    </HStackComponent>
                    <FormControl isRequired>
                        <FormControl.Label>Department</FormControl.Label>
                        <SelectComponent
                            valueKey="_id"
                            displayKey="departmentName"
                            selectedValue={departmentId}
                            items={sortedCampusDepartments || []}
                            placeholder="Choose department"
                            onValueChange={handleDepartment as any}
                        >
                            {/* TODO: Restore on crash fix */}
                            {/* <SelectItemComponent key="all-departments" label="All Departments" value="undefined" /> */}
                            {sortedCampusDepartments?.map((department, index) => (
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
                        onPress={handlePress}
                        startIcon={
                            <Icon
                                size={28}
                                color="white"
                                type={!triggerFetch ? 'evilicon' : 'ionicon'}
                                name={!triggerFetch ? 'refresh' : 'download-outline'}
                            />
                        }
                    >
                        {!triggerFetch ? 'Fetch report' : 'Download'}
                    </ButtonComponent>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(Export);
