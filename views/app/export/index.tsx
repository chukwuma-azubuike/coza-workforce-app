import React from 'react';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetCampusesQuery } from '@store/services/campus';
import ViewWrapper from '@components/layout/viewWrapper';
import { useGetServicesQuery } from '@store/services/services';
import dayjs from 'dayjs';
import { downloadFile } from '@utils/downloadFile';
import { useLazyGetAttendanceQuery } from '@store/services/attendance';
import { useLazyGetPermissionsQuery } from '@store/services/permissions';
import { useLazyGetTicketsQuery } from '@store/services/tickets';
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
import { useLocalSearchParams } from 'expo-router';
import PickerSelect from '~/components/ui/picker-select';
import { Button } from '~/components/ui/button';

export type IExportType = 'attendance' | 'tickets' | 'permissions';

export enum IReportTypes {
    TICKETS = 'tickets',
    ATTENDANCE = 'attendance',
    PERMISSIONS = 'permissions',
}

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

const Export: React.FC = () => {
    const params = useLocalSearchParams() as unknown as { type: IExportType };
    const type = params?.type;

    const { isCampusPastor, isQC, isSuperAdmin, user } = useRole();
    const cannotSwitchCampus = isCampusPastor || (isQC && !isSuperAdmin);

    const [campusId, setCampusId] = React.useState<string | undefined>(
        cannotSwitchCampus ? user?.campus?._id : undefined
    );
    const [departmentId, setDepartmentId] = React.useState<string>();
    const [serviceId, setServiceId] = React.useState<string>();
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

    const [
        getTickets,
        { data: tickets, isLoading: ticketsIsLoading, isFetching: ticketsIsFetching, reset: resetTickets },
    ] = useLazyGetTicketsQuery();
    const [
        getAttendance,
        { data: attendance, isLoading: attendanceIsLoading, reset: resetAttendance, isFetching: attendanceIsFetching },
    ] = useLazyGetAttendanceQuery();
    const [
        getPermissions,
        {
            data: permissions,
            reset: resetPermissions,
            isLoading: permissionsIsLoading,
            isFetching: permissionIsFetching,
        },
    ] = useLazyGetPermissionsQuery();

    const handleDataType = (value: IExportType) => {
        setDataType(value);
    };

    const handleCampus = (value: string) => {
        setCampusId(value !== 'null' ? value : undefined);
    };

    const handleDepartment = (value: string) => {
        setDepartmentId(value !== 'null' ? value : undefined);
    };

    const handleService = (value: string) => {
        setServiceId(value !== 'null' ? value : undefined);
    };

    const handleStartDate = (value: string) => {
        setStartDate(dayjs(value).unix() as any);
    };

    const handleEndDate = (value: string) => {
        setEndDate(dayjs(value).unix() as any);
    };

    const handlePress = async () => {
        switch (dataType) {
            case 'attendance':
                try {
                    const res = await getAttendance({
                        endDate,
                        startDate,
                        campusId,
                        serviceId,
                        departmentId,
                    });

                    if (res.data) {
                        if (res.data?.length > 0) {
                            await downloadFile(
                                res.data,
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
                            resetAttendance();
                        } else {
                            Alert.alert('Empty report', 'No records found.');
                        }
                    }
                } catch (error) {}

                break;

            case 'tickets':
                try {
                    const res = await getTickets({
                        endDate,
                        startDate,
                        campusId,
                        serviceId,
                        departmentId,
                    });

                    if (res.data) {
                        if (res.data?.length > 0) {
                            await downloadFile(
                                res.data,
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
                            resetTickets();
                        } else {
                            Alert.alert('Empty report', 'No records found.');
                        }
                    }
                } catch (error) {}

            case 'permissions':
                try {
                    const res = await getPermissions({
                        endDate,
                        startDate,
                        campusId,
                        serviceId,
                        departmentId,
                    });

                    if (res.data) {
                        if (res.data?.length > 0) {
                            await downloadFile(
                                res.data,
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
                            resetPermissions();
                        } else {
                            Alert.alert('Empty report', 'No records found.');
                        }
                    }
                } catch (error) {}

                break;

            default:
                break;
        }
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

    const isPermission = dataType === 'permissions';

    return (
        <ViewWrapper scroll className="p-4">
            <View style={{ alignItems: 'center' }}>
                <View style={{ gap: 16, width: '100%' }}>
                    <View>
                        <Label>Data Type</Label>
                        <PickerSelect
                            valueKey="value"
                            labelKey="name"
                            value={dataType}
                            items={dataTypes}
                            placeholder="Choose data type"
                            onValueChange={handleDataType}
                        />
                    </View>
                    <View>
                        <Label>Campus</Label>
                        <PickerSelect
                            valueKey="_id"
                            labelKey="campusName"
                            items={allCampuses || []}
                            disabled={cannotSwitchCampus}
                            placeholder="Choose campus"
                            onValueChange={handleCampus}
                            isLoading={allCampusesLoading}
                            value={cannotSwitchCampus ? user?.campus?._id : campusId}
                        />
                    </View>
                    <If condition={!isPermission}>
                        <View>
                            <Label>Service</Label>
                            <PickerSelect
                                valueKey="_id"
                                labelKey="name"
                                value={serviceId}
                                isLoading={servicesLoading}
                                items={pastServices || []}
                                placeholder="Choose service"
                                onValueChange={handleService}
                                customLabel={service =>
                                    `${service.name} | ${
                                        service?.serviceTime ? dayjs(service?.serviceTime).format('DD-MM-YYYY') : ''
                                    }`
                                }
                            />
                        </View>
                    </If>
                    <View className="w-full flex-row gap-4">
                        <View className="flex-1">
                            <DateTimePicker
                                mode="date"
                                label="Start date"
                                placeholder="Enter start date"
                                onConfirm={handleStartDate as unknown as (value: Date) => void}
                            />
                        </View>
                        <View className="flex-1">
                            <DateTimePicker
                                mode="date"
                                label="End date"
                                placeholder="Enter end date"
                                onConfirm={handleEndDate as unknown as (value: Date) => void}
                            />
                        </View>
                    </View>
                    <View>
                        <Label>Department</Label>
                        <PickerSelect
                            valueKey="_id"
                            labelKey="departmentName"
                            value={departmentId}
                            items={sortedCampusDepartments || []}
                            isLoading={campusDepartmentsLoading}
                            placeholder="Choose department"
                            onValueChange={handleDepartment}
                        />
                    </View>
                    <Button
                        isLoading={isLoading}
                        onPress={handlePress}
                        disabled={!dataType}
                        startIcon={<Icon size={28} color="white" type="ionicon" name="download-outline" />}
                    >
                        Fetch report
                    </Button>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(Export);
