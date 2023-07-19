import { Box, FormControl, VStack } from 'native-base';
import React, { useState } from 'react';
import useRole from '../../../hooks/role';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import useModal from '../../../hooks/modal/useModal';
import { useGetDepartmentsByCampusIdQuery } from '../../../store/services/department';
import { useGetCampusesQuery } from '../../../store/services/campus';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { Formik, FormikConfig } from 'formik';
import { useGetServicesQuery } from '../../../store/services/services';
import { IExportFilters } from '../../../store/types';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import { THEME_CONFIG } from '../../../config/appConfig';
import ButtonComponent from '../../../components/atoms/button';
import moment from 'moment';
import { Platform } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { downloadFile } from '../../../store/services/fetch-utils/fetchBlob';
import { Icon } from '@rneui/themed';

export type IExportType = 'ATTENDANCE' | 'TICKETS' | 'PERMISSIONS';

export const dataValues = {
    ATTENDANCE: 'attendance',
    TICKETS: 'ticket',
    PERMISSIONS: 'permissions',
};

const Export: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    // const { navigation } = props;
    // const { goBack } = navigation;
    const { type } = props.route.params as { type: IExportType };

    const {
        user: { campus: userCampus },
        isGlobalPastor,
    } = useRole();

    const [selectedCampus, setSelectedCampus] = useState(isGlobalPastor ? '' : userCampus._id);
    const [isLoading, setIsLoading] = useState(false);

    const isAttendance = type === 'ATTENDANCE';
    const isTickets = type === 'TICKETS';
    const isPermissions = type === 'PERMISSIONS';

    const { setModalState } = useModal();

    const {
        data: campusDepartments,
        refetch: refetchDepartments,
        isFetching: isFetchingDepartments,
        isLoading: campusDepartmentsLoading,
    } = useGetDepartmentsByCampusIdQuery(userCampus._id);

    const {
        data: allCampuses,
        refetch: refetchAllCampuses,
        isFetching: isFetchingAllCampuses,
        isLoading: allCampusesLoading,
    } = useGetCampusesQuery();

    const campusIdForServiceQuery = isGlobalPastor ? selectedCampus : userCampus._id;

    const {
        data: services,
        refetch: refetchServices,
        isLoading: servicesLoading,
    } = useGetServicesQuery({ campusId: campusIdForServiceQuery });

    const refresh = () => {
        refetchDepartments();
        refetchAllCampuses();
        refetchServices();
    };

    const submitForm: FormikConfig<IExportFilters>['onSubmit'] = async (values, { resetForm }) => {
        setIsLoading(true);
        if (Platform.OS === 'ios') {
            downloadFile({
                data: values.data,
                serviceId: values.serviceId,
                campusId: values.campusId,
                departmentId: values.departmentId,
            });

            setIsLoading(false);

            setModalState({
                message: 'File downloading',
                defaultRender: true,
                status: 'success',
                duration: 3,
            });
            resetForm();
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'Application needs access to your storage to download File',
                        buttonPositive: 'string',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Start downloading
                    downloadFile({
                        data: values.data,
                        serviceId: values.serviceId,
                        campusId: values.campusId,
                        departmentId: values.departmentId,
                    });
                    setIsLoading(false);
                    setModalState({
                        message: 'File downloading',
                        defaultRender: true,
                        status: 'success',
                        duration: 3,
                    });
                    resetForm();
                } else {
                    // If permission denied then show alert
                    setIsLoading(false);
                    setModalState({
                        message: 'Storage Permission Not Granted',
                        defaultRender: true,
                        status: 'error',
                        duration: 5,
                    });
                }
            } catch (err) {
                // To handle permission related exception
                setIsLoading(false);
                setModalState({
                    message: 'Oops, an error occured',
                    defaultRender: true,
                    status: 'error',
                    duration: 5,
                });
            }
        }
    };

    const dataType = isAttendance ? 'attendance' : isTickets ? 'ticket' : isPermissions ? 'permissions' : 'attendance';

    const dataTypes = [
        {
            name: 'Attendance',
            value: dataValues.ATTENDANCE,
        },
        {
            name: 'Tickets',
            value: dataValues.TICKETS,
        },
        {
            name: 'Permissions',
            value: dataValues.PERMISSIONS,
        },
    ];

    const INITIAL_VALUES: IExportFilters = {
        campusId: isGlobalPastor ? '' : userCampus._id,
        departmentId: '',
        serviceId: '',
        data: dataType,
    };

    return (
        <ViewWrapper scroll noPadding onRefresh={refresh} refreshing={isFetchingDepartments || isFetchingAllCampuses}>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                <Box alignItems="center" w="100%">
                    <Formik<IExportFilters>
                        validateOnChange
                        enableReinitialize
                        onSubmit={submitForm}
                        initialValues={INITIAL_VALUES}
                        // validationSchema={CreateUserSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit }) => (
                            <VStack w="100%" space={1}>
                                <FormControl isRequired isInvalid={!!errors?.data}>
                                    <FormControl.Label>Data Type</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.data}
                                        placeholder="Choose data type"
                                        onValueChange={handleChange('data')}
                                    >
                                        {dataTypes?.map((data, index) => (
                                            <SelectItemComponent
                                                value={data.value}
                                                key={`data-${index}`}
                                                label={data.name}
                                                // isLoading={allCampusesLoading}
                                            />
                                        ))}
                                    </SelectComponent>
                                    <FormControl.ErrorMessage
                                        fontSize="2xl"
                                        mt={3}
                                        leftIcon={
                                            <Icon
                                                size={16}
                                                name="warning"
                                                type="antdesign"
                                                color={THEME_CONFIG.error}
                                            />
                                        }
                                    >
                                        {errors?.data}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                <FormControl isRequired isInvalid={!!errors?.campusId}>
                                    <FormControl.Label>Campus</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={selectedCampus}
                                        placeholder="Choose campus"
                                        onValueChange={value => {
                                            handleChange('campusId');
                                            setSelectedCampus(value);
                                        }}
                                        // isDisabled={!isGlobalPastor}
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
                                    <FormControl.ErrorMessage
                                        fontSize="2xl"
                                        mt={3}
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

                                <FormControl
                                    isRequired={values.data !== dataValues.PERMISSIONS}
                                    isInvalid={!!errors?.serviceId}
                                >
                                    <FormControl.Label>Service</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.serviceId}
                                        placeholder="Choose service"
                                        onValueChange={handleChange('serviceId')}
                                    >
                                        {services?.map((service, index) => (
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
                                    <FormControl.ErrorMessage
                                        fontSize="2xl"
                                        mt={3}
                                        leftIcon={
                                            <Icon
                                                size={16}
                                                name="warning"
                                                type="antdesign"
                                                color={THEME_CONFIG.error}
                                            />
                                        }
                                    >
                                        {errors?.serviceId}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                <FormControl isRequired={false} isInvalid={!!errors?.departmentId}>
                                    <FormControl.Label>Department</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.departmentId}
                                        placeholder="Choose department"
                                        onValueChange={handleChange('departmentId')}
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
                                    <FormControl.ErrorMessage
                                        fontSize="2xl"
                                        mt={3}
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

                                <FormControl>
                                    <ButtonComponent
                                        type="submit"
                                        mt={4}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Download
                                    </ButtonComponent>
                                </FormControl>
                            </VStack>
                        )}
                    </Formik>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default Export;
