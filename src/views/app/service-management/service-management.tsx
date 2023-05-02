import { ParamListBase, useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import { Box, FormControl, HStack, VStack } from 'native-base';
import React from 'react';
import ButtonComponent from '../../../components/atoms/button';
import { InputComponent } from '../../../components/atoms/input';
import { SelectComponent, SelectItemComponent } from '../../../components/atoms/select';
import { DateTimePickerComponent } from '../../../components/composite/date-picker';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../config/appConfig';
import useModal from '../../../hooks/modal/useModal';
import useRole from '../../../hooks/role';
import { useCreateServiceMutation, useUpdateServiceMutation } from '../../../store/services/services';
import { IAllService, ICreateServicePayload } from '../../../store/types';
import Utils from '../../../utils';
import { CreateServiceSchema } from '../../../utils/schemas';

const tags: any = [
    { id: 'cozasunday', value: 'COZASunday' },
    { id: 'cozawednesday', value: 'COZAWednesday' },
    { id: 'dpe', value: 'DPE' },
    { id: 'home-training', value: 'Home Training' },
    { id: 'leaders-meeting', value: 'Leaders Meeting' },
    { id: '12dg', value: '12DG' },
    { id: '7dg', value: '7DG' },
];

const CreateServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { goBack, setOptions } = useNavigation();

    const propItems = props.route.params as IAllService;

    const { setModalState } = useModal();

    const [createService, { isError, isLoading, isSuccess, error, reset }] = useCreateServiceMutation();
    const [
        updateService,
        {
            isError: isErrorUpdate,
            isLoading: isLoadingUpdate,
            isSuccess: isSuccessUpdate,
            error: errorUpdate,
            error: resetUpdate,
        },
    ] = useUpdateServiceMutation();

    const onSubmit: FormikConfig<ICreateServicePayload>['onSubmit'] = (values, { resetForm }) => {
        const clockInStartTime = Utils.concatDateTimeToEpoc(values.startDate, values.clockinTime);
        const coordinates = {
            long: 7.505862981744857,
            lat: 9.005452823370131,
        };
        const name = values.serviceName;
        const isGlobalService = values.serviceType === 'global';
        const leadersLateStartTime = Utils.concatDateTimeToEpoc(values.startDate, values.leaderLateTime);
        const rangeToClockIn = 100;
        const serviceEndTime = Utils.concatDateTimeToEpoc(values.startDate, values.endTime);
        const serviceTime = Utils.concatDateTimeToEpoc(values.startDate, values.startTime);
        const workersLateStartTime = Utils.concatDateTimeToEpoc(values.startDate, values.workerLateTime);

        if (propItems?._id) {
            updateService({
                _id: propItems?._id,
                clockInStartTime,
                coordinates,
                isGlobalService,
                leadersLateStartTime,
                name,
                rangeToClockIn,
                serviceEndTime,
                serviceTime,
                workersLateStartTime,
            });
        } else {
            createService({
                clockInStartTime,
                coordinates,
                isGlobalService,
                leadersLateStartTime,
                name,
                rangeToClockIn,
                serviceEndTime,
                serviceTime,
                workersLateStartTime,
            });
        }

        console.log({
            _id: propItems._id,
            clockInStartTime,
            coordinates,
            isGlobalService,
            leadersLateStartTime,
            name,
            rangeToClockIn,
            serviceEndTime,
            serviceTime,
            workersLateStartTime,
        });
        // resetForm(INITIAL_VALUES);
    };
    const serviceType = propItems?._id ? (propItems?.isGlobalService ? 'global' : 'local') : '';
    const INITIAL_VALUES: ICreateServicePayload = {
        startTime: propItems?.serviceTime || new Date(),
        startDate: propItems?.serviceTime || new Date(),
        clockinTime: propItems?.clockInStartTime || new Date(),
        endTime: propItems?.serviceEndTime || new Date(),
        leaderLateTime: propItems?.leadersLateStartTime || new Date(),
        workerLateTime: propItems?.workersLateStartTime || new Date(),
        serviceTag: '',
        serviceType: serviceType || '',
        serviceName: propItems?.name || '',
    } as ICreateServicePayload;

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                message: 'Service successfully created',
                defaultRender: true,
                status: 'success',
                duration: 3,
            });
            goBack();
            reset();
        }

        if (isError) {
            setModalState({
                message: error?.data?.message || 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 3,
            });
            reset();
        }
    }, [isSuccess, isError]);

    React.useEffect(() => {
        if (isSuccessUpdate) {
            setModalState({
                message: 'Service successfully updated',
                defaultRender: true,
                status: 'success',
                duration: 3,
            });
            goBack();
            resetUpdate();
        }

        if (isErrorUpdate) {
            setModalState({
                message: errorUpdate?.data?.message || 'Oops, something went wrong!',
                defaultRender: true,
                status: 'error',
                duration: 3,
            });
            reset();
        }
    }, [isSuccessUpdate, isErrorUpdate]);

    const isScreenFocused = useIsFocused();

    useFocusEffect(
        React.useCallback(() => {
            setOptions({ title: `${propItems?._id ? 'Update' : 'Create'} Service` });
            return () => {};
        }, [isScreenFocused])
    );

    return (
        <ViewWrapper scroll noPadding>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={24}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateServicePayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateServiceSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched, setFieldValue }) => (
                            <VStack w="100%" space={4}>
                                <FormControl isRequired isInvalid={!!errors?.serviceName && touched.serviceName}>
                                    <FormControl.Label>Service Name</FormControl.Label>
                                    <InputComponent
                                        keyboardType="phone-pad"
                                        value={values.serviceName}
                                        placeholder="Service Name"
                                        onChangeText={handleChange('serviceName')}
                                    />
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
                                        {errors?.serviceName}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors?.serviceType && touched.serviceType}>
                                    <FormControl.Label>Service Type</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.serviceType}
                                        placeholder="Service Type"
                                        onValueChange={handleChange('serviceType')}
                                    >
                                        <SelectItemComponent value="global" label="Global" />
                                        <SelectItemComponent value="local" label="Local" />
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
                                        {errors?.serviceType}
                                    </FormControl.ErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors?.serviceTag && touched.serviceTag}>
                                    <FormControl.Label>Service Tags</FormControl.Label>
                                    <SelectComponent
                                        selectedValue={values.serviceTag}
                                        placeholder="Service Tags"
                                        onValueChange={handleChange('serviceTag')}
                                    >
                                        {tags?.map((tag: any, index: any) => (
                                            <SelectItemComponent
                                                value={tag.id}
                                                key={`campus-${index}`}
                                                label={tag.value}
                                                // isLoading={campusesIsLoading || campusesIsFetching}
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
                                        {errors?.serviceTag}
                                    </FormControl.ErrorMessage>
                                </FormControl>

                                <HStack justifyContent="space-between">
                                    <DateTimePickerComponent
                                        label="Date"
                                        mode="date"
                                        fieldName="startDate"
                                        onSelectDate={setFieldValue}
                                        value={values.startDate}
                                        // minimumDate={new Date()}
                                    />
                                    <DateTimePickerComponent
                                        label="Service Start Time"
                                        mode="time"
                                        fieldName="startTime"
                                        onSelectDate={setFieldValue}
                                        value={values.startDate}
                                    />
                                </HStack>

                                <HStack justifyContent="space-between">
                                    <DateTimePickerComponent
                                        label="Clock-in Time"
                                        mode="time"
                                        fieldName="clockinTime"
                                        onSelectDate={setFieldValue}
                                        value={values.clockinTime}
                                    />
                                    <DateTimePickerComponent
                                        label="Leaders Late Time"
                                        mode="time"
                                        fieldName="leaderLateTime"
                                        onSelectDate={setFieldValue}
                                        value={values.leaderLateTime}
                                    />
                                </HStack>

                                <HStack justifyContent="space-between">
                                    <DateTimePickerComponent
                                        label="Workers Late Time"
                                        mode="time"
                                        fieldName="workerLateTime"
                                        onSelectDate={setFieldValue}
                                        value={values.workerLateTime}
                                    />
                                    <DateTimePickerComponent
                                        label="Service End Time"
                                        mode="time"
                                        fieldName="endTime"
                                        onSelectDate={setFieldValue}
                                        value={values.endTime}
                                    />
                                </HStack>

                                <FormControl>
                                    <ButtonComponent
                                        mt={4}
                                        isLoading={isLoading || isLoadingUpdate}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Submit
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

export default CreateServiceManagement;
