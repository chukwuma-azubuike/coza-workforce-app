import { Text } from '~/components/ui/text';
import { Linking, Pressable, View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { IServiceReportPayload, IReportStatus } from '@store/types';
import { useCreateServiceReportMutation } from '@store/services/reports';
import ViewWrapper from '@components/layout/viewWrapper';
import DateTimePicker from '~/components/composite/date-time-picker';
import dayjs from 'dayjs';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import If from '@components/composite/if-container';
import { ServiceReportSchema } from '@utils/schemas';
import { useLocalSearchParams } from 'expo-router';
import FormErrorMessage from '~/components/ui/error-message';
import { Separator } from '~/components/ui/separator';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';

const ServiceReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IServiceReportPayload;

    const { status, updatedAt } = params;

    const { isCampusPastor, isGlobalPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateServiceReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

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
                                    initialValue={values.serviceStartTime}
                                    disabled={isCampusPastor || isGlobalPastor}
                                    onConfirm={handleChange('serviceStartTime') as unknown as (value: Date) => void}
                                />
                                <DateTimePicker
                                    mode="time"
                                    label="Service end Time"
                                    error={errors.serviceEndTime}
                                    touched={touched.serviceEndTime}
                                    placeholder="Select end time"
                                    initialValue={values.serviceEndTime}
                                    disabled={isCampusPastor || isGlobalPastor}
                                    onConfirm={handleChange('serviceEndTime') as unknown as (value: Date) => void}
                                />
                            </View>
                            {!isCampusPastor && !isGlobalPastor && (
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
                            )}
                            {values?.serviceReportLink && (isCampusPastor || isGlobalPastor) && (
                                <Pressable
                                    onPress={() => {
                                        Linking.openURL(values?.serviceReportLink);
                                    }}
                                >
                                    <Text className="text-xl text-green-500 text-center">Press to view report</Text>
                                </Pressable>
                            )}
                            <Separator className="my-2" />

                            <Textarea
                                isDisabled={isCampusPastor}
                                placeholder="Service Observations"
                                onChangeText={handleChange('observations')}
                                value={!!values?.observations ? values?.observations : undefined}
                            />

                            <ReportWorkflowActions
                                reportId={params?._id}
                                reportType={reportType}
                                status={status}
                                ghComment={(params as any)?.ghComment}
                                pastorComment={(params as any)?.pastorComment}
                                gspComment={(params as any)?.gspComment}
                            />
                            <If condition={!isCampusPastor && !isGSP}>
                                <View>
                                    <Button
                                        isLoading={isLoading || isTransitioning}
                                        onPress={handleSubmit as (event: any) => void}
                                    >
                                        {status === IReportStatus.GH_CHANGE_REQUESTED ? 'Resubmit' : !status ? 'Submit' : 'Update'}
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
