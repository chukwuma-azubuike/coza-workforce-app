import { Linking, View } from 'react-native';
import * as React from 'react';
import { Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { IServiceReportPayload } from '@store/types';
import { useCreateServiceReportMutation } from '@store/services/reports';
import DateTimePicker from '~/components/composite/date-time-picker';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import If from '@components/composite/if-container';
import { ServiceReportSchema } from '@utils/schemas';
import {
    Field,
    FormSection,
    ReportFormShell,
    SubmitButton,
    TextAreaField,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { useLocalSearchParams } from 'expo-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

const ServiceReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IServiceReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGlobalPastor, isGSP } = useRole();
    const readOnly = isCampusPastor || isGlobalPastor;

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
                <ReportFormShell updatedAt={updatedAt} status={status as string} reportId={params?._id} reportType={reportType}>
                    <FormSection title="Service times">
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <DateTimePicker
                                    mode="time"
                                    label="Start time"
                                    error={errors.serviceStartTime}
                                    touched={touched.serviceStartTime}
                                    placeholder="Select start time"
                                    initialValue={values.serviceStartTime}
                                    disabled={readOnly}
                                    onConfirm={handleChange('serviceStartTime') as unknown as (value: Date) => void}
                                />
                            </View>
                            <View className="flex-1">
                                <DateTimePicker
                                    mode="time"
                                    label="End time"
                                    error={errors.serviceEndTime}
                                    touched={touched.serviceEndTime}
                                    placeholder="Select end time"
                                    initialValue={values.serviceEndTime}
                                    disabled={readOnly}
                                    onConfirm={handleChange('serviceEndTime') as unknown as (value: Date) => void}
                                />
                            </View>
                        </View>

                        {!readOnly && (
                            <Field label="Link to service report" error={errors.serviceReportLink && touched.serviceReportLink ? 'Enter a valid link' : undefined}>
                                <Input
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    value={values.serviceReportLink}
                                    placeholder="https://www.link-to-report.com"
                                    onChangeText={handleChange('serviceReportLink')}
                                />
                            </Field>
                        )}
                        {values?.serviceReportLink && readOnly ? (
                            <Button
                                variant="outline"
                                onPress={() => Linking.openURL(values?.serviceReportLink)}
                                startIcon={<Ionicons name="link-outline" size={15} color="#6d28d9" />}
                            >
                                Open service report
                            </Button>
                        ) : null}
                    </FormSection>

                    <FormSection title="Observations">
                        <TextAreaField
                            label="Service observations"
                            placeholder="Service observations"
                            isDisabled={isCampusPastor}
                            value={values?.observations ?? ''}
                            onChangeText={handleChange('observations')}
                        />
                    </FormSection>

                    <ReportWorkflowActions
                        reportId={params?._id}
                        reportType={reportType}
                        status={status}
                        awaitingRole={params?.awaitingRole}
                        ghComment={params?.ghComment}
                        pastorComment={params?.pastorComment}
                        gspComment={params?.gspComment}
                    />
                    <If condition={!isCampusPastor && !isGSP}>
                        <SubmitButton
                            label={submitLabelForStatus(status as string)}
                            isLoading={isLoading || isTransitioning}
                            onPress={handleSubmit as () => void}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default ServiceReport;
