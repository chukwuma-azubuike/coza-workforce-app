import React from 'react';
import { View } from 'react-native';
import { Formik, FormikConfig } from 'formik';
import DateTimePicker from '~/components/composite/date-time-picker';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { useCreateServiceMutation } from '@store/services/services';
import { Congress_SESSION_TAGS, CREATE_SERVICE_ENUM, ICreateServicePayload } from '@store/types';
import Utils from '@utils/index';
import { CreateServiceSchema } from '@utils/schemas';
import { router, useLocalSearchParams } from 'expo-router';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import FormErrorMessage from '~/components/ui/error-message';
import PickerSelect from '~/components/ui/picker-select';
import { Button } from '~/components/ui/button';

const CreateCGWGSession: React.FC = () => {
    const params = useLocalSearchParams() as any as { CongressId: string };
    const { setModalState } = useModal();
    const CongressId = params?.CongressId;

    const [createSession, { isLoading, data, reset }] = useCreateServiceMutation();

    const onSubmit: FormikConfig<ICreateServicePayload>['onSubmit'] = async (values, { resetForm }) => {
        const clockInStartTime = Utils.concatDateTime(values.serviceDate, values.clockInStartTime) as unknown as string;
        const coordinates = {
            long: CREATE_SERVICE_ENUM.LONG,
            lat: CREATE_SERVICE_ENUM.LAT,
        };
        const name = values.name;
        const isGlobalService = values.serviceType === 'global';
        const leadersLateStartTime = Utils.concatDateTime(
            values.serviceDate,
            values.leadersLateStartTime
        ) as unknown as string;
        const rangeToClockIn = CREATE_SERVICE_ENUM.RANGE_TO_CLOCKIN;
        const serviceEndTime = Utils.concatDateTime(values.serviceDate, values.serviceEndTime) as unknown as string;
        const serviceTime = Utils.concatDateTime(values.serviceDate, values.serviceTime) as unknown as string;
        const workersLateStartTime = Utils.concatDateTime(
            values.serviceDate,
            values.workersLateStartTime
        ) as unknown as string;

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
            tag: [values.tag],
            workersLateStartTime,
        });

        if ('data' in result) {
            setModalState({
                message: 'Session successfully created',
                status: 'success',
            });
            reset();
            router.back();
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
        serviceDate: undefined as unknown as Date,
        serviceTime: undefined as unknown as Date,
        clockInStartTime: undefined as unknown as Date,
        serviceEndTime: undefined as unknown as Date,
        leadersLateStartTime: undefined as unknown as Date,
        workersLateStartTime: undefined as unknown as Date,
        name: '',
        tag: '',
        serviceType: '',
    } as unknown as ICreateServicePayload;

    return (
        <ViewWrapper scroll className="pt-4">
            <View className="gap-6 items-start w-full">
                <View className="items-center w-full">
                    <Formik<ICreateServicePayload>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={CreateServiceSchema}
                    >
                        {({ errors, values, handleChange, handleSubmit, touched }) => {
                            return (
                                <View className="w-full gap-2">
                                    <View>
                                        <Label>Session Name</Label>
                                        <Input
                                            value={values.name}
                                            placeholder="Session Name"
                                            onChangeText={handleChange('name')}
                                        />
                                        {!!errors?.name && touched.name && (
                                            <FormErrorMessage>{errors?.name}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Session Type</Label>
                                        <PickerSelect
                                            valueKey="id"
                                            labelKey="label"
                                            items={[
                                                { id: 'local', label: 'Local' },
                                                { id: 'global', label: 'Global' },
                                            ]}
                                            value={values.serviceType}
                                            placeholder="Session Type"
                                            onValueChange={handleChange('serviceType') as any}
                                        />
                                        {!!errors?.serviceType && touched.serviceType && (
                                            <FormErrorMessage>{errors?.serviceType}</FormErrorMessage>
                                        )}
                                    </View>

                                    <View>
                                        <Label>Session Tag</Label>

                                        <PickerSelect
                                            valueKey="id"
                                            labelKey="value"
                                            value={values.tag}
                                            placeholder="Session Tags"
                                            items={Congress_SESSION_TAGS}
                                            onValueChange={handleChange('tag') as any}
                                        />
                                        {!!errors?.tag && touched.tag && (
                                            <FormErrorMessage>{errors?.tag}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="justify-between flex-row gap-4">
                                        <DateTimePicker
                                            mode="date"
                                            label="Session date"
                                            minimumDate={new Date()}
                                            error={errors.serviceDate}
                                            touched={touched.serviceDate}
                                            placeholder="Select service date"
                                            initialValue={values.serviceDate as string}
                                            onConfirm={handleChange('serviceDate') as unknown as (value: Date) => void}
                                        />
                                        <DateTimePicker
                                            mode="time"
                                            label="Session Start Time"
                                            error={errors.serviceTime}
                                            touched={touched.serviceTime}
                                            placeholder="Select Session time"
                                            initialValue={values.serviceTime as string}
                                            onConfirm={handleChange('serviceTime') as unknown as (value: Date) => void}
                                        />
                                    </View>
                                    <View className="justify-between flex-row gap-4">
                                        <DateTimePicker
                                            mode="time"
                                            label="Clock-in Time"
                                            error={errors.clockInStartTime}
                                            touched={touched.clockInStartTime}
                                            placeholder="Select clock-in time"
                                            initialValue={values.clockInStartTime as string}
                                            onConfirm={
                                                handleChange('clockInStartTime') as unknown as (value: Date) => void
                                            }
                                        />
                                        <DateTimePicker
                                            mode="time"
                                            label="Leaders Late Time"
                                            error={errors.leadersLateStartTime}
                                            touched={touched.leadersLateStartTime}
                                            placeholder="Select leaders late time"
                                            initialValue={values.leadersLateStartTime as string}
                                            onConfirm={
                                                handleChange('leadersLateStartTime') as unknown as (value: Date) => void
                                            }
                                        />
                                    </View>
                                    <View className="justify-between flex-row gap-4">
                                        <DateTimePicker
                                            mode="time"
                                            label="Workers Late Time"
                                            error={errors.workersLateStartTime}
                                            touched={touched.workersLateStartTime}
                                            placeholder="Select workers late time"
                                            initialValue={values.workersLateStartTime as string}
                                            onConfirm={
                                                handleChange('workersLateStartTime') as unknown as (value: Date) => void
                                            }
                                        />
                                        <DateTimePicker
                                            mode="time"
                                            label="Session End Time"
                                            error={errors.serviceEndTime}
                                            touched={touched.serviceEndTime}
                                            placeholder="Select Session end time"
                                            initialValue={values.serviceEndTime as string}
                                            onConfirm={
                                                handleChange('serviceEndTime') as unknown as (value: Date) => void
                                            }
                                        />
                                    </View>
                                    <View>
                                        <Button
                                            className="mt-2"
                                            isLoading={isLoading}
                                            loadingText="Creating Session..."
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Create Session
                                        </Button>
                                    </View>
                                </View>
                            );
                        }}
                    </Formik>
                </View>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateCGWGSession);
