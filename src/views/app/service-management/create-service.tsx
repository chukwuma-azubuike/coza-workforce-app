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
import { CREATE_SERVICE_ENUM, ICreateServicePayload, SERVICE_TAGS } from '@store/types';
import Utils from '@utils/index';
import { CreateServiceSchema } from '@utils/schemas';

const CreateServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { navigate } = navigation;
    const { setModalState } = useModal();
    const [createService, { isLoading, data, reset }] = useCreateServiceMutation();

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
            resetForm({ values: INITIAL_VALUES });
            navigate('Service management', data);
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
        validateField: FormikProps<ICreateServicePayload>['validateField'],
        resetForm: FormikProps<ICreateServicePayload>['resetForm']
    ) => {
        switch (tag) {
            case 'COZA_SUNDAYS':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T08:00:00.000Z',
                        clockinTime: '2023-09-07T01:00:00.000Z',
                        endTime: '2023-09-07T22:59:00.000Z',
                        leaderLateTime: '2023-09-07T06:30:00.000Z',
                        workerLateTime: '2023-09-07T07:00:00.000Z',
                        serviceName: 'COZA Sunday',
                        serviceTag: 'COZA_SUNDAYS',
                        serviceType: 'local',
                    } as ICreateServicePayload,
                });

                break;
            case 'COZA_TUESDAYS':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockinTime: '2023-09-07T14:00:00.000Z',
                        endTime: '2023-09-07T22:59:00.000Z',
                        leaderLateTime: '2023-09-07T16:30:00.000Z',
                        workerLateTime: '2023-09-07T17:00:00.000Z',
                        serviceName: 'COZA Tuesday',
                        serviceTag: 'COZA_TUESDAYS',
                        serviceType: 'global',
                    } as ICreateServicePayload,
                });

                break;
            case 'COZA_WEDNESDAYS':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockinTime: '2023-09-07T14:00:00.000Z',
                        endTime: '2023-09-07T22:59:00.000Z',
                        leaderLateTime: '2023-09-07T16:30:00.000Z',
                        workerLateTime: '2023-09-07T17:00:00.000Z',
                        serviceName: 'COZA Wednesday',
                        serviceTag: 'COZA_WEDNESDAYS',
                        serviceType: 'local',
                    } as ICreateServicePayload,
                });

                break;
            case 'DPE':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T05:00:00.000Z',
                        clockinTime: '2023-09-07T02:00:00.000Z',
                        endTime: '2023-09-07T010:50:00.000Z',
                        leaderLateTime: '2023-09-07T05:00:00.000Z',
                        workerLateTime: '2023-09-07T05:00:00.000Z',
                        serviceName: 'DPE',
                        serviceTag: 'DPE',
                        serviceType: 'global',
                    } as ICreateServicePayload,
                });

                break;
            case 'HOME_TRAINING':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockinTime: '2023-09-07T12:00:00.000Z',
                        endTime: '2023-09-07T22:59:00.000Z',
                        leaderLateTime: '2023-09-07T17:30:00.000Z',
                        workerLateTime: '2023-09-07T17:30:00.000Z',
                        serviceName: 'Home Training',
                        serviceTag: 'HOME_TRAINING',
                        serviceType: 'global',
                    } as ICreateServicePayload,
                });

                break;
            case 'LEADERS_MEETING':
                resetForm({
                    values: {
                        serviceTime: '2023-09-09T17:00:00.000Z',
                        clockinTime: '2023-09-09T15:00:00.000Z',
                        endTime: '2023-09-02T22:00:00.000Z',
                        leaderLateTime: '2023-09-02T17:00:00.000Z',
                        workerLateTime: '2023-09-09T15:00:00.000Z',
                        serviceName: 'Leaders Meeting',
                        serviceTag: 'LEADERS_MEETING',
                        serviceType: 'global',
                    } as ICreateServicePayload,
                });

                break;
            case '12DG':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockinTime: '2023-09-07T14:00:00.000Z',
                        endTime: '2023-09-07T22:59:00.000Z',
                        leaderLateTime: '2023-09-07T16:30:00.000Z',
                        workerLateTime: '2023-09-07T17:00:00.000Z',
                        serviceName: '12DG',
                        serviceTag: '12DG',
                        serviceType: 'local',
                    } as ICreateServicePayload,
                });

                break;
            case '7DG':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockinTime: '2023-09-07T14:00:00.000Z',
                        endTime: '2023-09-07T22:59:00.000Z',
                        leaderLateTime: '2023-09-07T16:30:00.000Z',
                        workerLateTime: '2023-09-07T17:00:00.000Z',
                        serviceName: '7DG',
                        serviceTag: '7DG',
                        serviceType: 'local',
                    } as ICreateServicePayload,
                });

                break;
            default:
                break;
        }
        validateField('serviceDate');
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
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateServiceSchema}
                    >
                        {({
                            errors,
                            values,
                            handleChange,
                            handleSubmit,
                            touched,
                            setFieldValue,
                            resetForm,
                            validateField,
                        }) => {
                            const handleServiceTag = (serviceTag: string) => {
                                setFieldValue('serviceTag', serviceTag);
                                setDefaultTimes(serviceTag, validateField, resetForm);
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
                                            {SERVICE_TAGS?.map((tag: any, index: any) => (
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
                                                isInvalid: !!errors?.serviceDate,
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

export default React.memo(CreateServiceManagement);
