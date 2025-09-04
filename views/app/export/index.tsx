import React from 'react';
import { useGetDepartmentsByCampusIdQuery } from '@store/services/department';
import { useGetCampusesQuery } from '@store/services/campus';
import ViewWrapper from '@components/layout/viewWrapper';
import { useGetServicesQuery } from '@store/services/services';
import dayjs from 'dayjs';
import { downloadFile } from '@utils/downloadFile';
import { useLazyGetAttendanceReportForDownloadQuery } from '@store/services/attendance';
import { useLazyGetPermissionsReportForDownloadQuery } from '@store/services/permissions';
import { useLazyGetTicketsReportForDownloadQuery } from '@store/services/tickets';
import { Alert, View } from 'react-native';
import { Icon } from '@rneui/themed';
import If from '@components/composite/if-container';
import DateTimePicker from '~/components/composite/date-time-picker';
import useRole from '@hooks/role';
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

    const { data: campusDepartments, isLoading: campusDepartmentsLoading } = useGetDepartmentsByCampusIdQuery(
        campusId as string,
        { skip: !campusId }
    );

    const sortedCampusDepartments = React.useMemo(
        () => Utils.sortStringAscending(campusDepartments, 'departmentName'),
        [campusDepartments]
    );

    const {
        data: allCampuses,

        isLoading: allCampusesLoading,
    } = useGetCampusesQuery();

    const { data: services, isLoading: servicesLoading } = useGetServicesQuery({});

    const pastServices = React.useMemo(
        () => services?.filter(service => dayjs(service.clockInStartTime).unix() < dayjs().unix()),
        [services]
    );

    const [getTickets, { data: tickets, isLoading: ticketsIsLoading, isFetching: ticketsIsFetching }] =
        useLazyGetTicketsReportForDownloadQuery();
    const [getAttendance, { data: attendance, isLoading: attendanceIsLoading, isFetching: attendanceIsFetching }] =
        useLazyGetAttendanceReportForDownloadQuery();
    const [getPermissions, { data: permissions, isLoading: permissionsIsLoading, isFetching: permissionIsFetching }] =
        useLazyGetPermissionsReportForDownloadQuery();

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
                        } else {
                            Alert.alert('Empty report', 'No records found.');
                        }
                    }

                    if (res.error) {
                        const error = res.error as any;
                        Alert.alert(error?.status, error?.error);
                    }

                    return;
                } catch (error) {
                    return;
                }

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
                        } else {
                            Alert.alert('Empty report', 'No records found.');
                        }
                    }

                    if (res.error) {
                        const error = res.error as any;
                        Alert.alert(error?.status, error?.error);
                    }

                    return;
                } catch (error) {
                    return;
                }

            case 'permissions':
                try {
                    const res = await getPermissions({
                        endDate,
                        startDate,
                        campusId,
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
                        } else {
                            Alert.alert('Empty report', 'No records found.');
                        }
                    }

                    if (res.error) {
                        const error = res.error as any;
                        Alert.alert(error?.status, error?.error);
                    }

                    return;
                } catch (error) {
                    return;
                }

            default:
                return;
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
        <ViewWrapper scroll className="px-4 py-4">
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

const datum = [
    {
        _id: '67961b7cfb38ab49e0e795d8',
        departmentId: '64b1d2e7c39dca5d7fbd4ab6',
        departmentName: 'PCU',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '671ce2ca55e898760eb40018',
            firstName: 'Clara Chinonyerem',
            lastName: 'Obi',
            email: 'basilokonkwo98@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl:
                'https://cozaglobalworkforceapp-s3-bucket.s3.us-east-1.amazonaws.com/profile_pictures/Maitama_671ce2ca55e898760eb40018_Clara Chinonyerem_Obi_timestamp=2025-01-26T05:18:07.776Z.jpg',
        },
        category: { _id: '65183f602e67cbcba4a817c9', categoryName: 'Lateness' },
        categoryName: 'Lateness',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ACKNOWLEGDED',
        createdAt: 1737890684970,
        updatedAt: 1737927656019,
    },
    {
        _id: '67942011fb38ab49e0e2566c',
        departmentId: '64b1d31cc39dca5d7fbd4abc',
        departmentName: 'Programme Coordination',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: true,
        isIndividual: false,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737760785612,
        updatedAt: null,
    },
    {
        _id: '679419ecfb38ab49e0e25070',
        departmentId: '64b1d386c39dca5d7fbd4acd',
        departmentName: 'Sounds and Equipment',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419c9979a829fa5f25ce821',
            firstName: 'Timothy',
            lastName: 'Igwe',
            email: 'timigweson@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/pyF1xBK/rn-image-picker-lib-temp-02460272-5626-4edf-8443-342c8bf07f58.jpg',
        },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'CONTESTED',
        createdAt: 1737759212194,
        updatedAt: 1737782848497,
    },
    {
        _id: '679417ecfb38ab49e0e24c90',
        departmentId: '64b1d42cc39dca5d7fbd4ae7',
        departmentName: 'Media',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641eb76fbe48f9d6e4ca6257',
            firstName: 'Stephen',
            lastName: 'Umapia',
            email: 'stevenumapia@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/qmcfnNw/rn-image-picker-lib-temp-dfeb93e4-6a27-4ff9-aeea-9e7efab22e2e.jpg',
        },
        category: { _id: '64156b3b7ee072661fc439a8', categoryName: 'Unauthorised use of phone' },
        categoryName: 'Unauthorised use of phone',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737758700442,
        updatedAt: null,
    },
    {
        _id: '6794141bfb38ab49e0e246dd',
        departmentId: '64d3936591d067a0773a46ec',
        departmentName: 'Witty',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641e0e09be48f9d6e4c990fc',
            firstName: 'Anthonia',
            lastName: 'Collins-Onohwakpo',
            email: 'thoniacollins@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/rvh5CmM/782-A8-C80-3900-44-E6-812-B-9-E35-A7663-C0-F.jpg',
        },
        category: { _id: '65183f202e67cbcba4a81582', categoryName: 'Chewing during session' },
        categoryName: 'Chewing during session',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737757723406,
        updatedAt: null,
    },
    {
        _id: '67941347fb38ab49e0e245f3',
        departmentId: '64b1d467c39dca5d7fbd4aef',
        departmentName: 'Others',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419d5c39a829fa5f25d042c',
            firstName: 'Omotosho',
            lastName: 'Joshua',
            email: 'immijosh@gmail.com',
            roleId: '641495f6dd786f75a803a9c4',
            pictureUrl: 'https://i.ibb.co/hZSZGfp/B5-CDD2-B7-AF7-F-4902-81-FA-4-FF1-B95-FB511.jpg',
        },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737757511453,
        updatedAt: null,
    },
    {
        _id: '6794128efb38ab49e0e24559',
        departmentId: '64b1d2c9c39dca5d7fbd4ab2',
        departmentName: 'Children Ministry',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641622a464c8f76a6acbc997',
            firstName: 'Ogunfile',
            lastName: 'Peace',
            email: 'olapeace2002@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/SvsGx29/rn-image-picker-lib-temp-3f89024f-f22b-4941-9249-6d73b16028a3.jpg',
        },
        category: { _id: '65183f202e67cbcba4a81582', categoryName: 'Chewing during session' },
        categoryName: 'Chewing during session',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737757326442,
        updatedAt: null,
    },
    {
        _id: '6794121bfb38ab49e0e243e6',
        departmentId: '64d3936591d067a0773a46ec',
        departmentName: 'Witty',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641e0e09be48f9d6e4c990fc',
            firstName: 'Anthonia',
            lastName: 'Collins-Onohwakpo',
            email: 'thoniacollins@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/rvh5CmM/782-A8-C80-3900-44-E6-812-B-9-E35-A7663-C0-F.jpg',
        },
        category: { _id: '65183f202e67cbcba4a81582', categoryName: 'Chewing during session' },
        categoryName: 'Chewing during session',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737757211970,
        updatedAt: null,
    },
    {
        _id: '67902a28fb38ab49e0de8c64',
        departmentId: '64b1d42cc39dca5d7fbd4ae7',
        departmentName: 'Media',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '672111f686249b396c6cce17',
            firstName: 'David Bamidele',
            lastName: 'Innocent',
            email: 'bamminn@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
        },
        category: { _id: '64156b3b7ee072661fc439a8', categoryName: 'Unauthorised use of phone' },
        categoryName: 'Unauthorised use of phone',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737501224835,
        updatedAt: null,
    },
    {
        _id: '6790297ffb38ab49e0de8bb6',
        departmentId: '64b1d42cc39dca5d7fbd4ae7',
        departmentName: 'Media',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '672111f686249b396c6cce17',
            firstName: 'David Bamidele',
            lastName: 'Innocent',
            email: 'bamminn@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737501055582,
        updatedAt: null,
    },
    {
        _id: '67902916fb38ab49e0de8b51',
        departmentId: '64b1d2d9c39dca5d7fbd4ab4',
        departmentName: 'Ushery Board',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641d1e02a51750a1000adbee',
            firstName: 'Mary',
            lastName: 'Omolola',
            email: 'maryosayi5@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/fpBVrQS/rn-image-picker-lib-temp-d00ecfb5-b8bb-4d93-a96d-e9756ce4107a.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'CONTESTED',
        createdAt: 1737500950254,
        updatedAt: 1742680150658,
    },
    {
        _id: '67900ddefb38ab49e0de75ed',
        departmentId: '64b1d472c39dca5d7fbd4af1',
        departmentName: 'H&H',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641f62c4df572c917da28aa0',
            firstName: 'Eghaghe',
            lastName: 'Labella',
            email: 'bellasignature2015@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/2SFPJt0/rn-image-picker-lib-temp-53350294-2f57-4673-a3cd-5752438e3a3c.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737493982170,
        updatedAt: null,
    },
    {
        _id: '678e0d2cfb38ab49e0dce886',
        departmentId: '64b1d30cc39dca5d7fbd4aba',
        departmentName: 'Public Relations Unit (PRU)',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641e96eabe48f9d6e4ca1906',
            firstName: 'Akagwu',
            lastName: 'Anthony',
            email: 'tonyakagwu@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/qkXSQdN/rn-image-picker-lib-temp-6faf0f0a-eaa1-4bdd-9cc9-9e4930b10dbc.jpg',
        },
        category: { _id: '64156b3b7ee072661fc439a8', categoryName: 'Unauthorised use of phone' },
        categoryName: 'Unauthorised use of phone',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1737362732274,
        updatedAt: null,
    },
    {
        _id: '6786124c01d4780ecf3aa4ea',
        departmentId: '64b1d31cc39dca5d7fbd4abc',
        departmentName: 'Programme Coordination',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419c3879a829fa5f25cdc10',
            firstName: 'Amiphel',
            lastName: 'Bassuo',
            email: 'aminessbassuo@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/VwPcYJH/03314-AEE-EEBE-4-C9-D-ABBC-EE181476-BE9-C.jpg',
        },
        category: { _id: '64156b3b7ee072661fc439a8', categoryName: 'Unauthorised use of phone' },
        categoryName: 'Unauthorised use of phone',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736839756324,
        updatedAt: null,
    },
    {
        _id: '6785a2a101d4780ecf3a5661',
        departmentId: '64b1d3d6c39dca5d7fbd4adf',
        departmentName: 'Sparkles',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '671ceabf55e898760eb40257',
            firstName: 'Patience',
            lastName: 'Mathias',
            email: 'patiencemathias00@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl:
                'https://cozaglobalworkforceapp-s3-bucket.s3.us-east-1.amazonaws.com/profile_pictures/Maitama_671ceabf55e898760eb40257_Patience_Mathias_timestamp=2025-04-29T11:11:20.238Z.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'CONTESTED',
        createdAt: 1736811169671,
        updatedAt: 1738266265360,
    },
    {
        _id: '6784d31c01d4780ecf374355',
        departmentId: '64b1d472c39dca5d7fbd4af1',
        departmentName: 'H&H',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641f62c4df572c917da28aa0',
            firstName: 'Eghaghe',
            lastName: 'Labella',
            email: 'bellasignature2015@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/2SFPJt0/rn-image-picker-lib-temp-53350294-2f57-4673-a3cd-5752438e3a3c.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736758044879,
        updatedAt: null,
    },
    {
        _id: '6784ce8501d4780ecf373f1a',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736756869148,
        updatedAt: null,
    },
    {
        _id: '6783a32a01d4780ecf3420cc',
        departmentId: '64b1d2f6c39dca5d7fbd4ab8',
        departmentName: 'COZA Transfer Service',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b3239a829fa5f25cb8d3',
            firstName: 'Simdiga',
            lastName: 'Dungus',
            email: 'seemdungus@yahoo.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/cDmrdq1/B320-E504-E3-DB-48-FB-B8-D2-E6-EAF0-A1-C330.jpg',
        },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736680234734,
        updatedAt: null,
    },
    {
        _id: '6782f52d01d4780ecf30c895',
        departmentId: '64b1d2d9c39dca5d7fbd4ab4',
        departmentName: 'Ushery Board',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641d1e02a51750a1000adbee',
            firstName: 'Mary',
            lastName: 'Omolola',
            email: 'maryosayi5@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/fpBVrQS/rn-image-picker-lib-temp-d00ecfb5-b8bb-4d93-a96d-e9756ce4107a.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'CONTESTED',
        createdAt: 1736635693500,
        updatedAt: 1742680182456,
    },
    {
        _id: '6782d00401d4780ecf306ca2',
        departmentId: '64b1d2d9c39dca5d7fbd4ab4',
        departmentName: 'Ushery Board',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641d2a6fbe48f9d6e4c7d894',
            firstName: 'Taiwo',
            lastName: 'Funmilayo',
            email: 'portable1funmy@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl:
                'https://cozaglobalworkforceapp-s3-bucket.s3.us-east-1.amazonaws.com/profile_pictures/Maitama_641d2a6fbe48f9d6e4c7d894_Taiwo_Funmilayo_timestamp=2025-04-26T23:48:33.908Z.jpg',
        },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736626180935,
        updatedAt: null,
    },
    {
        _id: '6780c72401d4780ecf2901f3',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736492836600,
        updatedAt: null,
    },
    {
        _id: '677ee02e01d4780ecf228ed5',
        departmentId: '64b1d2e7c39dca5d7fbd4ab6',
        departmentName: 'PCU',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419db919a829fa5f25d1533',
            firstName: 'Hyetson',
            lastName: 'SHEKINAHGLORY',
            email: 'shekinaglory247@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/rGzsChM/83-B8718-B-4-C0-B-4-EFD-9-C19-D1-A424735-A39.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736368174211,
        updatedAt: null,
    },
    {
        _id: '677edf8901d4780ecf228c57',
        departmentId: '64b1d2e7c39dca5d7fbd4ab6',
        departmentName: 'PCU',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419db919a829fa5f25d1533',
            firstName: 'Hyetson',
            lastName: 'SHEKINAHGLORY',
            email: 'shekinaglory247@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/rGzsChM/83-B8718-B-4-C0-B-4-EFD-9-C19-D1-A424735-A39.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736368009841,
        updatedAt: null,
    },
    {
        _id: '677c3dec01d4780ecf1825ce',
        departmentId: '64b1d42cc39dca5d7fbd4ae7',
        departmentName: 'Media',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419be0f9a829fa5f25cce9b',
            firstName: 'Elijah',
            lastName: 'Affi',
            email: 'affielijah@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/Qnp5zNN/1449-BD36-9-B9-E-48-C8-ADB9-DFE835-FB92-DC.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736195564465,
        updatedAt: null,
    },
    {
        _id: '677c3b6a01d4780ecf181bee',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736194922718,
        updatedAt: null,
    },
    {
        _id: '677b7e2e01d4780ecf147bdb',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '65183f602e67cbcba4a817c9', categoryName: 'Lateness' },
        categoryName: 'Lateness',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736146478461,
        updatedAt: null,
    },
    {
        _id: '677b7de801d4780ecf147a33',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '65183f602e67cbcba4a817c9', categoryName: 'Lateness' },
        categoryName: 'Lateness',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736146408174,
        updatedAt: null,
    },
    {
        _id: '677a59bb01d4780ecf110fd2',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736071611605,
        updatedAt: null,
    },
    {
        _id: '677a55fa01d4780ecf110ce8',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736070650939,
        updatedAt: null,
    },
    {
        _id: '677a552f01d4780ecf110bae',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1736070447301,
        updatedAt: null,
    },
    {
        _id: '6779a78c01d4780ecf0dab13',
        departmentId: '64b1d2c9c39dca5d7fbd4ab2',
        departmentName: 'Children Ministry',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641622a464c8f76a6acbc997',
            firstName: 'Ogunfile',
            lastName: 'Peace',
            email: 'olapeace2002@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/SvsGx29/rn-image-picker-lib-temp-3f89024f-f22b-4941-9249-6d73b16028a3.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ACKNOWLEGDED',
        createdAt: 1736025996189,
        updatedAt: 1736027085356,
    },
    {
        _id: '6779a6fb01d4780ecf0da967',
        departmentId: '64b1d2d9c39dca5d7fbd4ab4',
        departmentName: 'Ushery Board',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '65fcb07e39c446a7bf61a7d0',
            firstName: 'Santiago',
            lastName: 'Joseph',
            email: 'josephsantiagoaondona@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/hDZNVVY/rn-image-picker-lib-temp-28241514-49ea-4d1c-bbc7-8f383682eb77.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ACKNOWLEGDED',
        createdAt: 1736025851626,
        updatedAt: 1736320369551,
    },
    {
        _id: '6778ee6801d4780ecf0a1da3',
        departmentId: '64b1d472c39dca5d7fbd4af1',
        departmentName: 'H&H',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641f62c4df572c917da28aa0',
            firstName: 'Eghaghe',
            lastName: 'Labella',
            email: 'bellasignature2015@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/2SFPJt0/rn-image-picker-lib-temp-53350294-2f57-4673-a3cd-5752438e3a3c.jpg',
        },
        category: { _id: '64156b3b7ee072661fc439a8', categoryName: 'Unauthorised use of phone' },
        categoryName: 'Unauthorised use of phone',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1735978600998,
        updatedAt: null,
    },
    {
        _id: '6778ec2801d4780ecf0a1be2',
        departmentId: '64b1d472c39dca5d7fbd4af1',
        departmentName: 'H&H',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641f62c4df572c917da28aa0',
            firstName: 'Eghaghe',
            lastName: 'Labella',
            email: 'bellasignature2015@gmail.com',
            roleId: '64149597dd786f75a803a9bc',
            pictureUrl: 'https://i.ibb.co/2SFPJt0/rn-image-picker-lib-temp-53350294-2f57-4673-a3cd-5752438e3a3c.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1735978024090,
        updatedAt: null,
    },
    {
        _id: '67788df901d4780ecf08a1f7',
        departmentId: '64b1d2d9c39dca5d7fbd4ab4',
        departmentName: 'Ushery Board',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '641d2a6fbe48f9d6e4c7d894',
            firstName: 'Taiwo',
            lastName: 'Funmilayo',
            email: 'portable1funmy@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl:
                'https://cozaglobalworkforceapp-s3-bucket.s3.us-east-1.amazonaws.com/profile_pictures/Maitama_641d2a6fbe48f9d6e4c7d894_Taiwo_Funmilayo_timestamp=2025-04-26T23:48:33.908Z.jpg',
        },
        category: { _id: '65183fb22e67cbcba4a81a36', categoryName: 'Poor output' },
        categoryName: 'Poor output',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ACKNOWLEGDED',
        createdAt: 1735953913935,
        updatedAt: 1735955348400,
    },
    {
        _id: '67770fa301d4780ecf032f70',
        departmentId: '64b1d386c39dca5d7fbd4acd',
        departmentName: 'Sounds and Equipment',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419c9979a829fa5f25ce821',
            firstName: 'Timothy',
            lastName: 'Igwe',
            email: 'timigweson@gmail.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/pyF1xBK/rn-image-picker-lib-temp-02460272-5626-4edf-8443-342c8bf07f58.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1735856035650,
        updatedAt: null,
    },
    {
        _id: '6776be7801d4780ecf009390',
        departmentId: '64d3936a91d067a0773a4717',
        departmentName: 'Quality Control',
        campus: { _id: '64b1d0e7c39dca5d7fbd496c', campusName: 'Maitama' },
        user: {
            _id: '6419b0a59a829fa5f25cb2bc',
            firstName: 'Oyidiya',
            lastName: 'Mbah',
            email: 'sales.coutureliving@outlook.com',
            roleId: '641495cadd786f75a803a9c0',
            pictureUrl: 'https://i.ibb.co/6w9vwxb/D4-C3-A481-B3-F1-42-B4-9-BCF-DAECC3242642.jpg',
        },
        category: { _id: '64156b527ee072661fc439aa', categoryName: 'Unauthorised dress code' },
        categoryName: 'Unauthorised dress code',
        isDepartment: false,
        isIndividual: true,
        isRetracted: false,
        status: 'ISSUED',
        createdAt: 1735835256709,
        updatedAt: null,
    },
];
