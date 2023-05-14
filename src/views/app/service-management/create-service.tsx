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
import { CREATE_SERVICE_ENUM, IAllService, ICreateServicePayload } from '../../../store/types';
import Utils from '../../../utils';
import { CreateServiceSchema } from '../../../utils/schemas';
import useScreenFocus from '../../../hooks/focus';

const tags: any = [
    { id: 'cozasunday', value: 'COZASunday' },
    { id: 'cozawednesday', value: 'COZAWednesday' },
    { id: 'dpe', value: 'DPE' },
    { id: 'home-training', value: 'Home Training' },
    { id: 'leaders-meeting', value: 'Leaders Meeting' },
    { id: '12dg', value: '12DG' },
    { id: '7dg', value: '7DG' },
];

const CreateServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;
    const { setOptions } = useNavigation();

    const { setModalState } = useModal();

    const [createService, { isError, isLoading, isSuccess, error, data, reset }] = useCreateServiceMutation();

    const onSubmit: FormikConfig<ICreateServicePayload>['onSubmit'] = async (values, { resetForm }) => {
        const clockInStartTime = Utils.concatDateTimeToEpoc(values.startDate, values.clockinTime);
        const coordinates = {
            long: CREATE_SERVICE_ENUM.LONG,
            lat: CREATE_SERVICE_ENUM.LAT,
        };
        const name = values.serviceName;
        const isGlobalService = values.serviceType === 'global';
        const leadersLateStartTime = Utils.concatDateTimeToEpoc(values.startDate, values.leaderLateTime);
        const rangeToClockIn = CREATE_SERVICE_ENUM.RANGE_TO_CLOCKIN;
        const serviceEndTime = Utils.concatDateTimeToEpoc(values.startDate, values.endTime);
        const serviceTime = Utils.concatDateTimeToEpoc(values.startDate, values.startTime);
        const workersLateStartTime = Utils.concatDateTimeToEpoc(values.startDate, values.workerLateTime);

        const result = await createService({
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

        if ('data' in result) {
            setModalState({
                message: 'Service successfully created',
                status: 'success',
            });
            reset();
            navigate('Service management', data);
            resetForm(INITIAL_VALUES);
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const INITIAL_VALUES: ICreateServicePayload = {
        startTime: new Date(),
        startDate: new Date(),
        clockinTime: new Date(),
        endTime: new Date(),
        leaderLateTime: new Date(),
        workerLateTime: new Date(),
        serviceTag: '',
        serviceType: '',
        serviceName: '',
    } as ICreateServicePayload;

    useScreenFocus({ onFocus: () => setOptions({ title: 'Create Service' }) });

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
                                        minimumDate={new Date()}
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
                                        isLoading={isLoading}
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