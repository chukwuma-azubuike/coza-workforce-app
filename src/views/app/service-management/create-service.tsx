import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig, FormikProps } from 'formik';
import { Box, FormControl, HStack, VStack } from 'native-base';
import React from 'react';
import ButtonComponent from '@components/atoms/button';
import { InputComponent } from '@components/atoms/input';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import { DateTimePickerComponent } from '@components/composite/date-picker';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { useCreateServiceMutation } from '@store/services/services';
import { CREATE_SERVICE_ENUM, ICreateServicePayload } from '@store/types';
import Utils from '@utils/index';
import { CreateServiceSchema } from '@utils/schemas';

const tags = [
    { id: 'COZA_SUNDAYS', value: 'COZA Sundays' },
    { id: 'COZA_TUESDAYS', value: 'COZA Tuesdays' },
    { id: 'COZA_WEDNESDAYS', value: 'COZA Wednesdays' },
    { id: 'DPE', value: 'DPE' },
    { id: 'HOME_TRAINING', value: 'Home Training' },
    { id: 'LEADERS_MEETING', value: 'Leaders Meeting' },
    { id: '12DG', value: '12DG' },
    { id: '7DG', value: '7DG' },
];

const CreateServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;

    const { setModalState } = useModal();

    const [createService, { isLoading, error, data, reset }] = useCreateServiceMutation();

    const onSubmit: FormikConfig<ICreateServicePayload>['onSubmit'] = async (values, { resetForm }) => {
        const clockInStartTime = Utils.concatDateTimeToEpoc(values.serviceDate, values.clockinTime);
        const coordinates = {
            long: CREATE_SERVICE_ENUM.LONG,
            lat: CREATE_SERVICE_ENUM.LAT,
        };
        const name = values.serviceName;
        const isGlobalService = values.serviceType === 'global';
        const leadersLateStartTime = Utils.concatDateTimeToEpoc(values.serviceDate, values.leaderLateTime);
        const rangeToClockIn = CREATE_SERVICE_ENUM.RANGE_TO_CLOCKIN;
        const serviceEndTime = Utils.concatDateTimeToEpoc(values.serviceDate, values.endTime);
        const serviceTime = Utils.concatDateTimeToEpoc(values.serviceDate, values.serviceTime);
        const workersLateStartTime = Utils.concatDateTimeToEpoc(values.serviceDate, values.workerLateTime);

        const result = await createService({
            clockInStartTime,
            coordinates,
            isGlobalService,
            leadersLateStartTime,
            name,
            rangeToClockIn,
            serviceEndTime,
            serviceTime,
            tag: [values.serviceTag],
            workersLateStartTime,
        });

        if ('data' in result) {
            setModalState({
                message: 'Service successfully created',
                status: 'success',
            });
            reset();
            navigate('Service management', data);
            resetForm(INITIAL_VALUES as any);
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const setDefaultTimes = (
        tag: string,
        setFieldValue: FormikProps<ICreateServicePayload>['setFieldValue'],
        validateForm: FormikProps<ICreateServicePayload>['validateForm']
    ) => {
        switch (tag) {
            case 'COZA_SUNDAYS':
                setFieldValue('serviceTime', '2023-09-07T08:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T01:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T22:59:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T06:30:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T07:00:00.000Z');
                setFieldValue('serviceName', 'COZA Sunday');
                setFieldValue('serviceType', 'local').then(() => {
                    validateForm();
                });

                break;
            case 'COZA_TUESDAYS':
                setFieldValue('serviceTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T14:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T22:59:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T16:30:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('serviceName', 'COZA Tuesday');
                setFieldValue('serviceType', 'global').then(() => {
                    validateForm();
                });

                break;
            case 'COZA_WEDNESDAYS':
                setFieldValue('serviceTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T14:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T22:59:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T16:30:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('serviceName', 'COZA Wednesday');
                setFieldValue('serviceType', 'local').then(() => {
                    validateForm();
                });

                break;
            case 'DPE':
                setFieldValue('serviceTime', '2023-09-07T05:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T02:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T010:50:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T05:00:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T05:00:00.000Z');
                setFieldValue('serviceName', 'DPE');
                setFieldValue('serviceType', 'global').then(() => {
                    validateForm();
                });

                break;
            case 'HOME_TRAINING':
                setFieldValue('serviceTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T12:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T22:59:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T17:30:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T17:30:00.000Z');
                setFieldValue('serviceName', 'Home Training');
                setFieldValue('serviceType', 'global').then(() => {
                    validateForm();
                });

                break;
            case 'LEADERS_MEETING':
                setFieldValue('serviceTime', '2023-09-09T17:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-09T15:00:00.000Z');
                setFieldValue('endTime', '2023-09-02T22:00:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-02T17:00:00.000Z');
                setFieldValue('workerLateTime', '2023-09-09T15:00:00.000Z');
                setFieldValue('serviceName', 'Leaders Meeting');
                setFieldValue('serviceType', 'global').then(() => {
                    validateForm();
                });

                break;
            case '12DG':
                setFieldValue('serviceTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T14:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T22:59:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T16:30:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('serviceName', '12DG');
                setFieldValue('serviceType', 'local').then(() => {
                    validateForm();
                });

                break;
            case '7DG':
                setFieldValue('serviceTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('clockinTime', '2023-09-07T14:00:00.000Z');
                setFieldValue('endTime', '2023-09-07T22:59:00.000Z');
                setFieldValue('leaderLateTime', '2023-09-07T16:30:00.000Z');
                setFieldValue('workerLateTime', '2023-09-07T17:00:00.000Z');
                setFieldValue('serviceName', '7DG');
                setFieldValue('serviceType', 'local').then(() => {
                    validateForm();
                });

                break;
            default:
                break;
        }
    };

    const INITIAL_VALUES: ICreateServicePayload = {
        serviceTime: undefined as unknown as Date,
        serviceDate: undefined as unknown as Date,
        clockinTime: undefined as unknown as Date,
        endTime: undefined as unknown as Date,
        leaderLateTime: undefined as unknown as Date,
        workerLateTime: undefined as unknown as Date,
        serviceTag: '',
        serviceType: '',
        serviceName: '',
    } as ICreateServicePayload;

    return (
        <ViewWrapper scroll noPadding pt={4}>
            <VStack space="lg" alignItems="flex-start" w="100%" px={4} mb={24}>
                <Box alignItems="center" w="100%">
                    <Formik<ICreateServicePayload>
                        validateOnChange
                        enableReinitialize
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateServiceSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched, setFieldValue, validateForm }) => {
                            const handleServiceTag = (serviceTag: string) => {
                                setFieldValue('serviceTag', serviceTag);
                                setDefaultTimes(serviceTag, setFieldValue, validateForm);
                            };

                            return (
                                <VStack w="100%" space={4}>
                                    <FormControl isRequired isInvalid={!!errors?.serviceTag && touched.serviceTag}>
                                        <FormControl.Label>Service Tag</FormControl.Label>
                                        <SelectComponent
                                            placeholder="Service Tags"
                                            selectedValue={values.serviceTag}
                                            onValueChange={handleServiceTag}
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
                                    <FormControl isRequired isInvalid={!!errors?.serviceName && touched.serviceName}>
                                        <FormControl.Label>Service Name</FormControl.Label>
                                        <InputComponent
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
                                    <HStack justifyContent="space-between">
                                        <DateTimePickerComponent
                                            label="Date"
                                            mode="date"
                                            fieldName="serviceDate"
                                            onSelectDate={setFieldValue}
                                            value={values.serviceDate}
                                            minimumDate={new Date()}
                                            errorMessage={errors?.serviceDate}
                                            formControlProps={{
                                                isInvalid: !!errors?.serviceDate && touched.serviceDate,
                                            }}
                                        />
                                        <DateTimePickerComponent
                                            label="Service Start Time"
                                            mode="time"
                                            fieldName="serviceTime"
                                            onSelectDate={setFieldValue}
                                            value={values.serviceTime}
                                            errorMessage={errors?.serviceTime}
                                            formControlProps={{
                                                isInvalid: !!errors?.serviceTime && touched.serviceTime,
                                            }}
                                        />
                                    </HStack>

                                    <HStack justifyContent="space-between">
                                        <DateTimePickerComponent
                                            label="Clock-in Time"
                                            mode="time"
                                            fieldName="clockinTime"
                                            onSelectDate={setFieldValue}
                                            value={values.clockinTime}
                                            errorMessage={errors?.clockinTime}
                                            formControlProps={{
                                                isInvalid: !!errors?.clockinTime && touched.clockinTime,
                                            }}
                                        />
                                        <DateTimePickerComponent
                                            label="Leaders Late Time"
                                            mode="time"
                                            fieldName="leaderLateTime"
                                            onSelectDate={setFieldValue}
                                            value={values.leaderLateTime}
                                            errorMessage={errors?.leaderLateTime}
                                            formControlProps={{
                                                isInvalid: !!errors?.leaderLateTime && touched.leaderLateTime,
                                            }}
                                        />
                                    </HStack>

                                    <HStack justifyContent="space-between">
                                        <DateTimePickerComponent
                                            label="Workers Late Time"
                                            mode="time"
                                            fieldName="workerLateTime"
                                            onSelectDate={setFieldValue}
                                            value={values.workerLateTime}
                                            errorMessage={errors?.workerLateTime}
                                            formControlProps={{
                                                isInvalid: !!errors?.workerLateTime && touched.workerLateTime,
                                            }}
                                        />
                                        <DateTimePickerComponent
                                            label="Service End Time"
                                            mode="time"
                                            fieldName="endTime"
                                            onSelectDate={setFieldValue}
                                            value={values.endTime}
                                            errorMessage={errors?.endTime}
                                            formControlProps={{
                                                isInvalid: !!errors?.endTime && touched.endTime,
                                            }}
                                        />
                                    </HStack>

                                    <FormControl>
                                        <ButtonComponent
                                            mt={4}
                                            isLoading={isLoading}
                                            isLoadingText="Creating Service..."
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Create service
                                        </ButtonComponent>
                                    </FormControl>
                                </VStack>
                            );
                        }}
                    </Formik>
                </Box>
            </VStack>
        </ViewWrapper>
    );
};

export default CreateServiceManagement;
