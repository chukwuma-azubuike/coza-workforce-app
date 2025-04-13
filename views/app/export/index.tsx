import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetCampusesQuery } from '@store/services/campus';
import ViewWrapper from '@components/layout/viewWrapper';
import { useGetServicesQuery } from '@store/services/services';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import ButtonComponent from '@components/atoms/button';
import dayjs from 'dayjs';
import { downloadFile } from '@utils/downloadFile';
import { useGetAttendanceReportForDownloadQuery } from '@store/services/attendance';
import { useGetPermissionsReportForDownloadQuery } from '@store/services/permissions';
import { useGetTicketsReportForDownloadQuery } from '@store/services/tickets';
import { Alert, View } from 'react-native';
import { Icon } from '@rneui/themed';
import If from '@components/composite/if-container';
import DateTimePicker from '~/components/composite/date-time-picker';
import useRole from '@hooks/role';
import { generateCummulativeAttendanceReport } from '@utils/generateCummulativeAttendanceReport';
import { generateReportName } from '@utils/generateReportName';
import { IReportDownloadPayload } from '@store/types';
import Utils from '@utils/index';
import { Label } from '~/components/ui/label';

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

    const [campusId, setCampusId] = React.useState<string | undefined>(cannotSwitchCampus ? user?.campus?._id : '');
    const [departmentId, setDepartmentId] = React.useState<string>();
    const [serviceId, setServiceId] = React.useState<string | undefined>('all-services');
    const [triggerFetch, setTriggerFetch] = React.useState<boolean>(false);
    const [dataType, setDataType] = React.useState<IExportType>(type);
    const [startDate, setStartDate] = React.useState<IReportDownloadPayload['startDate']>();
    const [endDate, setEndDate] = React.useState<IReportDownloadPayload['endDate']>();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(campusId as string, { skip: !campusId });

    const sortedCampusDepartments = React.useMemo(
        () => Utils.sortStringAscending(campusDepartments, 'departmentName'),
        [campusDepartments]
    );

    const {
        data: allCampuses,
        refetch: refetchAllCampuses,
        isFetching: isFetchingAllCampuses,
        isLoading: allCampusesLoading,
    } = useGetCampusesQuery();

    const { data: services, refetch: refetchServices, isLoading: servicesLoading } = useGetServicesQuery({});

    const pastServices = React.useMemo(
        () => services?.filter(service => dayjs(service.clockInStartTime).unix() < dayjs().unix()),
        [services]
    );

    const {
        data: attendance,
        isSuccess: attendanceIsSuccess,
        isLoading: attendanceIsLoading,
        isFetching: attendanceIsFetching,
    } = useGetAttendanceReportForDownloadQuery(
        { endDate, startDate, campusId, serviceId: serviceId === 'all-services' ? undefined : serviceId, departmentId },
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
        {
            endDate,
            startDate,
            campusId: campusId === 'all-campuses' ? undefined : campusId,
            serviceId: serviceId === 'all-services' ? undefined : serviceId,
            departmentId: departmentId === 'all-departments' ? undefined : departmentId,
        },
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
        setStartDate(dayjs(value).unix());
    };

    const handleEndDate = (fieldName: string, value: number) => {
        setEndDate(dayjs(value).unix());
    };

    return (
        <ViewWrapper style={{ paddingTop: 8 }}>
            <View style={{ alignItems: 'center' }}>
                <View style={{ gap: 10, width: '100%' }}>
                    <View>
                        <Label>Data Type</Label>
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
                    </View>
                    <View>
                        <Label>Campus</Label>
                        <SelectComponent
                            valueKey="_id"
                            displayKey="campusName"
                            placeholder="Choose campus"
                            isDisabled={cannotSwitchCampus}
                            onValueChange={handleCampus as any}
                            selectedValue={cannotSwitchCampus ? user?.campus?._id : campusId}
                            items={[{ _id: 'all-campuses', campusName: 'All Campuses' }, ...(allCampuses || [])]}
                        >
                            <SelectItemComponent
                                key="all-campuses"
                                label="All Campuses"
                                value={'all-campuses' as unknown as string}
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
                    </View>
                    <If condition={!isPermission}>
                        <View>
                            <Label>Service</Label>
                            <SelectComponent
                                valueKey="_id"
                                selectedValue={serviceId}
                                placeholder="Choose service"
                                displayKey={['name', 'serviceTime']}
                                onValueChange={handleService as any}
                                items={[{ _id: 'all-services', name: 'All Services' }, ...(pastServices || [])]}
                            >
                                <SelectItemComponent
                                    key="all-services"
                                    label="All Services"
                                    value={'all-services' as unknown as string}
                                />
                                {pastServices?.map((service, index) => (
                                    <SelectItemComponent
                                        value={service._id}
                                        key={`service-${index}`}
                                        label={`${service.name} - ${
                                            service?.serviceTime ? dayjs(service?.serviceTime).format('DD-MM-YYYY') : ''
                                        }`}
                                        isLoading={servicesLoading}
                                    />
                                ))}
                            </SelectComponent>
                        </View>
                    </If>
                    <View className="flex-0">
                        <View className="w-1/2">
                            <DateTimePicker                                label="Start date"
                                fieldName="startDate"
                                onSelectDate={handleStartDate}
                            />
                        </View>
                        <View className="w-1/2">
                            <DateTimePicker                                label="End date"
                                fieldName="endDate"
                                onSelectDate={handleEndDate}
                            />
                        </View>
                    </View>
                    <View>
                        <Label>Department</Label>
                        <SelectComponent
                            valueKey="_id"
                            displayKey="departmentName"
                            selectedValue={departmentId}
                            placeholder="Choose department"
                            onValueChange={handleDepartment as any}
                            items={[
                                { _id: 'all-departments', departmentName: 'All Departments' },
                                ...(sortedCampusDepartments || []),
                            ]}
                        >
                            <SelectItemComponent
                                key="all-departments"
                                label="All Departments"
                                value="all-departments"
                            />
                            {sortedCampusDepartments?.map((department, index) => (
                                <SelectItemComponent
                                    value={department._id}
                                    key={`department-${index}`}
                                    label={department.departmentName}
                                    isLoading={campusDepartmentsLoading}
                                />
                            ))}
                        </SelectComponent>
                    </View>

                    <ButtonComponent
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
