import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IServiceReportPayload } from '@store/types';
import { useCreateServiceReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import DateTimePicker from '~/components/composite/date-time-picker';
import dayjs from 'dayjs';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import { ServiceReportSchema } from '@utils/schemas';
import { router, useLocalSearchParams } from 'expo-router';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';

const ServiceReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IServiceReportPayload;

    const { status, updatedAt } = params;

    const {
        isCampusPastor,
        user: { userId },
    } = useRole();

    const [updateReport, { error, isError, isSuccess, reset, isLoading }] = useCreateServiceReportMutation();

    const onSubmit = async (values: IServiceReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'SUBMITTED' });

            onResponse(res);
        } catch (error) {}
    };

    const onRequestReview = async (values: IServiceReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'REVIEW_REQUESTED' });

            onResponse(res);
        } catch (error) {}
    };

    const onApprove = async (values: IServiceReportPayload) => {
        try {
            const res = await updateReport({ ...values, userId, status: 'APPROVED' });

            onResponse(res);
        } catch (error) {}
    };

    const onResponse = React.useCallback(
        (
            res:
                | {
                      data: void;
                      error?: undefined;
                  }
                | {
                      data?: undefined;
                      error: any;
                  }
        ) => {
            if (res.data) {
                setModalState({
                    defaultRender: true,
                    status: 'success',
                    message: 'Report updated',
                });
                router.back();
            }
            if (res.error) {
                setModalState({
                    defaultRender: true,
                    status: 'error',
                    message: (error as any)?.data?.message || 'Something went wrong!',
                });
            }
        },
        []
    );

    const { setModalState } = useModal();

    const INITIAL_VALUES = {
        ...params,
        serviceStartTime: params.serviceStartTime || '',
        serviceEndTime: params.serviceEndTime || '',
        serviceReportLink: params.serviceReportLink || '',
        observations: params.observations || '',
        imageUrl: params.imageUrl || '',
    };

    return (
        <Formik<IServiceReportPayload>
            validateOnChange
            onSubmit={onSubmit}
            enableReinitialize
            validationSchema={ServiceReportSchema}
            initialValues={INITIAL_VALUES as unknown as IServiceReportPayload}
        >
            {({ handleChange, errors, handleSubmit, values, touched }) => (
                <ViewWrapper scroll noPadding>
                    <View className="mt-4 gap-4">
                        <Text className="w-full text-muted-foreground text-center">
                            {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                        </Text>
                        <View className="px-4 gap-4">
                            <View className="gap-4 flex-row">
                                <DateTimePicker
                                    mode="time"
                                    label="Service Start Time"
                                    error={errors.serviceStartTime}
                                    touched={touched.serviceStartTime}
                                    placeholder="Select start time"
                                    onConfirm={handleChange('serviceStartTime') as unknown as (value: Date) => void}
                                />
                                <DateTimePicker
                                    mode="time"
                                    label="Service end Time"
                                    error={errors.serviceEndTime}
                                    touched={touched.serviceEndTime}
                                    placeholder="Select end time"
                                    onConfirm={handleChange('serviceEndTime') as unknown as (value: Date) => void}
                                />
                            </View>
                            <View>
                                <Label>Link to Service Report</Label>
                                <Input
                                    keyboardType="url"
                                    value={values.serviceReportLink}
                                    placeholder="https://www.link-to-report.com"
                                    onChangeText={handleChange('serviceReportLink')}
                                />
                                {errors.serviceReportLink && touched.serviceReportLink && (
                                    <FormErrorMessage>This field cannot be empty</FormErrorMessage>
                                )}
                            </View>
                            <Separator className="my-2" />

                            <Textarea
                                isDisabled={isCampusPastor}
                                placeholder="Service Observations"
                                onChangeText={handleChange('observations')}
                                value={!!values?.observations ? values?.observations : undefined}
                            />

                            <If condition={!isCampusPastor}>
                                <View>
                                    <Button isLoading={isLoading} onPress={handleSubmit as (event: any) => void}>
                                        {`${!status ? 'Submit' : 'Update'}`}
                                    </Button>
                                </View>
                            </If>
                            <If condition={isCampusPastor}>
                                <Textarea
                                    isDisabled={!isCampusPastor}
                                    placeholder="Pastor's comment"
                                    onChangeText={handleChange('pastorComment')}
                                    value={values?.pastorComment ? values?.pastorComment : ''}
                                />
                                <View className="justify-between gap-4 flex-row">
                                    <Button
                                        onPress={() => onRequestReview(values)}
                                        isLoading={isLoading}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Request Review
                                    </Button>
                                    <Button onPress={() => onApprove(values)} isLoading={isLoading} size="sm">
                                        Approve
                                    </Button>
                                </View>
                            </If>
                        </View>
                    </View>
                </ViewWrapper>
            )}
        </Formik>
    );
};

export default ServiceReport;
