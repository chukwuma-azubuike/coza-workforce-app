import React from 'react';
import { View } from 'react-native';
import { Formik, FormikConfig, FormikProps } from 'formik';
import DateTimePicker from '~/components/composite/date-time-picker';
import ViewWrapper from '@components/layout/viewWrapper';
import useModal from '@hooks/modal/useModal';
import { useUpdateServiceMutation } from '@store/services/services';
import { CREATE_SERVICE_ENUM, IUpdateServicePayload, IService, SERVICE_TAGS } from '@store/types';
import Utils from '@utils/index';
import { UpdateServiceSchema } from '@utils/schemas';
import { router } from 'expo-router';
import FormErrorMessage from '~/components/ui/error-message';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import PickerSelect from '~/components/ui/picker-select';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Icon } from '@rneui/themed';
import DateTimePickerLegend from '~/components/composite/date-time-picker/date-picker';

const UpdateServiceManagement: React.FC<IService> = props => {
    const { setModalState } = useModal();
    const [updateService, { isLoading, reset }] = useUpdateServiceMutation();
    const { setOptions } = useNavigation();
    setOptions({ title: `${props.name} - ${dayjs(props.serviceTime).format('DD MMM YYYY')}` });

    const onSubmit: FormikConfig<IUpdateServicePayload>['onSubmit'] = async (values, { resetForm }) => {
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
        const rangeToClockIn = CREATE_SERVICE_ENUM.RANGE_TO_CLOCKIN as number;
        const serviceEndTime = Utils.concatDateTime(values.serviceDate, values.serviceEndTime) as unknown as string;
        const serviceTime = Utils.concatDateTime(values.serviceDate, values.serviceTime) as unknown as string;
        const workersLateStartTime = Utils.concatDateTime(
            values.serviceDate,
            values.workersLateStartTime
        ) as unknown as string;

        const result = await updateService({
            _id: props?._id,
            clockInStartTime,
            coordinates,
            isGlobalService,
            leadersLateStartTime,
            name,
            rangeToClockIn,
            serviceEndTime,
            serviceTime,
            tag: [values.tag],
            workersLateStartTime,
        });

        if ('data' in result) {
            setModalState({
                message: 'Service successfully created',
                status: 'success',
            });
            reset();
            resetForm({ values: INITIAL_VALUES });
            router.back();
        }

        if ('error' in result) {
            setModalState({
                message: (result.error as any)?.data?.data || 'Oops something went wrong',
                status: 'error',
            });
        }
    };

    const setDefaultTimes = (
        tag: string,
        validateField: FormikProps<IUpdateServicePayload>['validateField'],
        resetForm: FormikProps<IUpdateServicePayload>['resetForm']
    ) => {
        switch (tag) {
            case 'COZA_SUNDAYS':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T08:00:00.000Z',
                        clockInStartTime: '2023-09-07T01:00:00.000Z',
                        serviceEndTime: '2023-09-07T22:59:00.000Z',
                        leadersLateStartTime: '2023-09-07T06:30:00.000Z',
                        workersLateStartTime: '2023-09-07T07:00:00.000Z',
                        name: 'COZA Sunday',
                        tag: 'COZA_SUNDAYS',
                        serviceType: 'local',
                    } as IUpdateServicePayload,
                });

                break;
            case 'COZA_TUESDAYS':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockInStartTime: '2023-09-07T14:00:00.000Z',
                        serviceEndTime: '2023-09-07T22:59:00.000Z',
                        leadersLateStartTime: '2023-09-07T16:30:00.000Z',
                        workersLateStartTime: '2023-09-07T17:00:00.000Z',
                        name: 'COZA Tuesday',
                        tag: 'COZA_TUESDAYS',
                        serviceType: 'global',
                    } as IUpdateServicePayload,
                });

                break;
            case 'COZA_WEDNESDAYS':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockInStartTime: '2023-09-07T14:00:00.000Z',
                        serviceEndTime: '2023-09-07T22:59:00.000Z',
                        leadersLateStartTime: '2023-09-07T16:30:00.000Z',
                        workersLateStartTime: '2023-09-07T17:00:00.000Z',
                        name: 'COZA Wednesday',
                        tag: 'COZA_WEDNESDAYS',
                        serviceType: 'local',
                    } as IUpdateServicePayload,
                });

                break;
            case 'DPE':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T05:00:00.000Z',
                        clockInStartTime: '2023-09-07T02:00:00.000Z',
                        serviceEndTime: '2023-09-07T010:50:00.000Z',
                        leadersLateStartTime: '2023-09-07T05:00:00.000Z',
                        workersLateStartTime: '2023-09-07T05:00:00.000Z',
                        name: 'DPE',
                        tag: 'DPE',
                        serviceType: 'global',
                    } as IUpdateServicePayload,
                });

                break;
            case 'DOMINION_HOUR':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T05:00:00.000Z',
                        clockInStartTime: '2023-09-07T02:00:00.000Z',
                        serviceEndTime: '2023-09-07T010:50:00.000Z',
                        leadersLateStartTime: '2023-09-07T05:00:00.000Z',
                        workersLateStartTime: '2023-09-07T05:00:00.000Z',
                        name: 'Dominion Hour',
                        tag: 'DOMINION_HOUR',
                        serviceType: 'global',
                    } as IUpdateServicePayload,
                });

                break;
            case 'HOME_TRAINING':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockInStartTime: '2023-09-07T12:00:00.000Z',
                        serviceEndTime: '2023-09-07T22:59:00.000Z',
                        leadersLateStartTime: '2023-09-07T17:30:00.000Z',
                        workersLateStartTime: '2023-09-07T17:30:00.000Z',
                        name: 'Home Training',
                        tag: 'HOME_TRAINING',
                        serviceType: 'global',
                    } as IUpdateServicePayload,
                });

                break;
            case 'LEADERS_MEETING':
                resetForm({
                    values: {
                        serviceTime: '2023-09-09T17:00:00.000Z',
                        clockInStartTime: '2023-09-09T15:00:00.000Z',
                        serviceEndTime: '2023-09-02T22:00:00.000Z',
                        leadersLateStartTime: '2023-09-02T17:00:00.000Z',
                        workersLateStartTime: '2023-09-09T15:00:00.000Z',
                        name: 'Leaders Meeting',
                        tag: 'LEADERS_MEETING',
                        serviceType: 'global',
                    } as IUpdateServicePayload,
                });

                break;
            case '12DG':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockInStartTime: '2023-09-07T14:00:00.000Z',
                        serviceEndTime: '2023-09-07T22:59:00.000Z',
                        leadersLateStartTime: '2023-09-07T16:30:00.000Z',
                        workersLateStartTime: '2023-09-07T17:00:00.000Z',
                        name: '12DG',
                        tag: '12DG',
                        serviceType: 'local',
                    } as IUpdateServicePayload,
                });

                break;
            case '7DG':
                resetForm({
                    values: {
                        serviceTime: '2023-09-07T17:00:00.000Z',
                        clockInStartTime: '2023-09-07T14:00:00.000Z',
                        serviceEndTime: '2023-09-07T22:59:00.000Z',
                        leadersLateStartTime: '2023-09-07T16:30:00.000Z',
                        workersLateStartTime: '2023-09-07T17:00:00.000Z',
                        name: '7DG',
                        tag: '7DG',
                        serviceType: 'local',
                    } as IUpdateServicePayload,
                });

                break;
            default:
                break;
        }
        validateField('serviceDate');
    };

    const INITIAL_VALUES: IUpdateServicePayload = props as unknown as IUpdateServicePayload;

    return (
        <ViewWrapper scroll noPadding style={{ paddingTop: 8 }}>
            <View className="px-4 gap-6 items-start w-full mb-12">
                <View className="items-center w-full">
                    <Formik<IUpdateServicePayload>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={UpdateServiceSchema}
                    >
                        {({
                            errors,
                            values,
                            touched,
                            resetForm,
                            handleChange,
                            handleSubmit,
                            setFieldValue,
                            validateField,
                        }) => {
                            const handleServiceTag = (serviceTag: string) => {
                                setFieldValue('tag', serviceTag);
                                setDefaultTimes(serviceTag, validateField, resetForm);
                            };

                            return (
                                <View className="w-full gap-4 pt-4">
                                    <View>
                                        <Label>Service Tag</Label>
                                        <PickerSelect
                                            valueKey="id"
                                            labelKey="value"
                                            items={SERVICE_TAGS}
                                            value={values.tag}
                                            placeholder="Service Tags"
                                            onValueChange={handleServiceTag as any}
                                        />
                                        {!!errors?.tag && <FormErrorMessage>{errors?.tag}</FormErrorMessage>}
                                    </View>
                                    <View>
                                        <Label>Service Type</Label>
                                        <PickerSelect
                                            valueKey="id"
                                            labelKey="label"
                                            items={[
                                                { id: 'local', label: 'Local' },
                                                { id: 'global', label: 'Global' },
                                            ]}
                                            value={values.serviceType}
                                            placeholder="Service Type"
                                            onValueChange={handleChange('serviceType') as any}
                                        />
                                        {!!errors?.serviceType && touched.serviceType && (
                                            <FormErrorMessage>{errors?.serviceType}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View>
                                        <Label>Service Name</Label>
                                        <Input
                                            value={values.name}
                                            placeholder="Service Name"
                                            onChangeText={handleChange('name')}
                                        />
                                        {!!errors?.name && !!touched.name && (
                                            <FormErrorMessage>{errors?.name}</FormErrorMessage>
                                        )}
                                    </View>
                                    <View className="justify-between flex-row gap-4">
                                        <View className="flex-1">
                                            <DateTimePickerLegend
                                                mode="date"
                                                label="Service date"
                                                error={errors.serviceDate}
                                                touched={touched.serviceDate}
                                                placeholder="Select service date"
                                                initialValue={values.serviceTime as string}
                                                onConfirm={
                                                    handleChange('serviceDate') as unknown as (value: Date) => void
                                                }
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <DateTimePicker
                                                mode="time"
                                                label="Service Start Time"
                                                error={errors.serviceTime}
                                                touched={touched.serviceTime}
                                                placeholder="Select service time"
                                                initialValue={values.serviceTime as string}
                                                onConfirm={
                                                    handleChange('serviceTime') as unknown as (value: Date) => void
                                                }
                                            />
                                        </View>
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
                                            label="Service End Time"
                                            error={errors.serviceEndTime}
                                            touched={touched.serviceEndTime}
                                            placeholder="Select service end time"
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
                                            loadingText="Updating Service..."
                                            onPress={handleSubmit as (event: any) => void}
                                            icon={<Icon name="save" type="ionicons" color="white" />}
                                        >
                                            Save changes
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

export default React.memo(UpdateServiceManagement);

UpdateServiceManagement.displayName = 'UpdateServiceManagement';
