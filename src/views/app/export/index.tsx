import { Box, FormControl, VStack } from 'native-base';
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

export type IExportType = 'attendance' | 'tickets' | 'permissions';

export enum IReportTypes {
    TICKETS = 'tickets',
    ATTENDANCE = 'attendance',
    PERMISSIONS = 'permissions',
}

const Export: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const params = props.route.params as { type: IExportType };
    const type = params?.type;

    const [campusId, setCampusId] = React.useState<string>('');
    const [departmentId, setDepartmentId] = React.useState<string>();
    const [serviceId, setServiceId] = React.useState<string>();
    const downloadState = React.useState<boolean>(false);
    const [dataType, setDataType] = React.useState<IExportType>(type);

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

    const queryParamsReady = !!campusId || !!serviceId || !!departmentId;

    const {
        data: attendance,
        isSuccess: attendanceIsSuccess,
        isLoading: attendanceIsLoading,
    } = useGetAttendanceReportForDownloadQuery(
        {
            campusId,
            serviceId,
            departmentId,
        },
        { skip: !queryParamsReady && dataType !== 'attendance' && !queryParamsReady, refetchOnMountOrArgChange: true }
    );
    const {
        data: permissions,
        isSuccess: permissionsIsSuccess,
        isLoading: permissionsIsLoading,
    } = useGetPermissionsReportForDownloadQuery(
        {
            campusId,
            departmentId,
        },
        { skip: !queryParamsReady && dataType !== 'permissions' && !queryParamsReady, refetchOnMountOrArgChange: true }
    );
    const {
        data: tickets,
        isSuccess: ticketsIsSuccess,
        isLoading: ticketsIsLoading,
    } = useGetTicketsReportForDownloadQuery(
        {
            campusId,
            serviceId,
            departmentId,
        },
        { skip: !queryParamsReady && dataType !== 'tickets' && !queryParamsReady, refetchOnMountOrArgChange: true }
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

    const isLoading = attendanceIsLoading || ticketsIsLoading || permissionsIsLoading;

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

    const readyForDownload = !downloadState[0] && (attendanceIsSuccess || ticketsIsSuccess || permissionsIsSuccess);

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

                        <FormControl isRequired>
                            <FormControl.Label>Service</FormControl.Label>
                            <SelectComponent
                                placeholder="Choose service"
                                selectedValue={serviceId}
                                onValueChange={handleService}
                            >
                                {services?.map((service, index) => (
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
                        <FormControl isRequired>
                            <FormControl.Label>Department</FormControl.Label>
                            <SelectComponent
                                selectedValue={departmentId}
                                placeholder="Choose department"
                                onValueChange={handleDepartment}
                            >
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
