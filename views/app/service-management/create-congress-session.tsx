import React from 'react';
import { View } from 'react-native';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import { Formik, FormikConfig } from 'formik';
import ButtonComponent from '@components/atoms/button';
import { SelectComponent, SelectItemComponent } from '@components/atoms/select';
import DateTimePicker from '~/components/composite/date-time-picker';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useModal from '@hooks/modal/useModal';
import { useCreateServiceMutation } from '@store/services/services';
import { Congress_SESSION_TAGS, CREATE_SERVICE_ENUM, ICreateServicePayload } from '@store/types';
import Utils from '@utils/index';
import { CreateServiceSchema } from '@utils/schemas';
import { router, useLocalSearchParams } from 'expo-router';

const CreateCGWGSession: React.FC = () => {
    const params = useLocalSearchParams() as any as { CongressId: string };
    const { setModalState } = useModal();
    const CongressId = params?.CongressId;

    const [createSession, { isLoading, error, data, reset }] = useCreateServiceMutation();

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

        const result = await createSession({
            CongressId,
            name,
            isCongress: !!CongressId,
            clockInStartTime,
            coordinates,
            isGlobalService,
            rangeToClockIn,
            serviceEndTime,
            serviceTime,
            leadersLateStartTime,
            tag: [values.serviceTag],
            workersLateStartTime,
        });

        if ('data' in result) {
            setModalState({
                message: 'Session successfully created',
                status: 'success',
            });
            reset();
            router.push({ pathname: '/service-management', params: data as any });
            resetForm({ values: INITIAL_VALUES });
        }

        if ('error' in result) {
            setModalState({
                message: 'Oops something went wrong',
                status: 'error',
            });
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
        <ViewWrapper scroll noPadding>
            <View space="lg" alignItems="flex-start" w="100%" mb={24} className="px-4">
                <View alignItems="center" w="100%">
                    <Formik<ICreateServicePayload>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateServiceSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched, setFieldValue }) => (
                            <View w="100%" space={4}>
                                <View isInvalid={!!errors?.serviceName && touched.serviceName}>
                                    <Label>Session Name</Label>
                                    <Input
                                        value={values.serviceName}
                                        placeholder="Session Name"
                                        onChangeText={handleChange('serviceName')}
                                    />
                                    <FormErrorMessage
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
                                    </FormErrorMessage>
                                </View>
                                <View isInvalid={!!errors?.serviceType && touched.serviceType}>
                                    <Label>Session Type</Label>
                                    <SelectComponent
                                        selectedValue={values.serviceType}
                                        placeholder="Session Type"
                                        onValueChange={handleChange('serviceType')}
                                    >
                                        <SelectItemComponent value="global" label="Global" />
                                        <SelectItemComponent value="local" label="Local" />
                                    </SelectComponent>
                                    <FormErrorMessage
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
                                    </FormErrorMessage>
                                </View>
                                <View isInvalid={!!errors?.serviceTag && touched.serviceTag}>
                                    <Label>Session Tag</Label>
                                    <SelectComponent
                                        placeholder="Session Tags"
                                        selectedValue={values.serviceTag}
                                        onValueChange={handleChange('serviceTag')}
                                    >
                                        {Congress_SESSION_TAGS?.map((tag: any, index: any) => (
                                            <SelectItemComponent
                                                value={tag.id}
                                                key={`campus-${index}`}
                                                label={tag.value}
                                            />
                                        ))}
                                    </SelectComponent>
                                    <FormErrorMessage
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
                                    </FormErrorMessage>
                                </View>

                                <View justifyContent="space-between">
                                    <DateTimePicker
                                        label="Date"
                                        mode="date"
                                        fieldName="serviceDate"
                                        onSelectDate={setFieldValue}
                                        value={values.serviceDate}
                                        minimumDate={new Date()}
                                    />
                                    <DateTimePicker
                                        label="Session Start Time"
                                        mode="time"
                                        fieldName="serviceTime"
                                        onSelectDate={setFieldValue}
                                        value={values.serviceTime}
                                    />
                                </View>

                                <View justifyContent="space-between">
                                    <DateTimePicker
                                        label="Clock-in Time"
                                        mode="time"
                                        fieldName="clockinTime"
                                        onSelectDate={setFieldValue}
                                        value={values.clockinTime}
                                    />
                                    <DateTimePicker
                                        label="Leaders Late Time"
                                        mode="time"
                                        fieldName="leaderLateTime"
                                        onSelectDate={setFieldValue}
                                        value={values.leaderLateTime}
                                    />
                                </View>

                                <View justifyContent="space-between">
                                    <DateTimePicker
                                        label="Workers Late Time"
                                        mode="time"
                                        fieldName="workerLateTime"
                                        onSelectDate={setFieldValue}
                                        value={values.workerLateTime}
                                    />
                                    <DateTimePicker
                                        label="Session End Time"
                                        mode="time"
                                        fieldName="endTime"
                                        onSelectDate={setFieldValue}
                                        value={values.endTime}
                                    />
                                </View>

                                <View>
                                    <ButtonComponent
                                        mt={4}
                                        isLoading={isLoading}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        Create Session
                                    </ButtonComponent>
                                </View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCGWGSession);
