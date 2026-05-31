import * as React from 'react';
import { Formik } from 'formik';
import { IPruReportPayload } from '@store/types';
import { useCreatePruReportMutation } from '@store/services/reports';
import If from '@components/composite/if-container';
import useRole from '@hooks/role';
import { useReportFormSubmit } from '@hooks/report-form-submit';
import ReportWorkflowActions from '@components/composite/report-workflow-actions';
import {
    FormSection,
    NumberField,
    ReportFormShell,
    SubmitButton,
    TextAreaField,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { useLocalSearchParams } from 'expo-router';

const NUMERIC_FIELDS: { key: keyof IPruReportPayload; label: string }[] = [
    { key: 'enquiryCount', label: 'Enquiries handled' },
    { key: 'vehicleDedicationCount', label: 'Vehicle dedications' },
    { key: 'missingItemsCount', label: 'Missing items reported' },
    { key: 'praiseReportDeskCount', label: 'Praise reports received' },
];

const PruReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IPruReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreatePruReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        enquiryCount: params.enquiryCount || '',
        vehicleDedicationCount: params.vehicleDedicationCount || '',
        missingItemsCount: params.missingItemsCount || '',
        praiseReportDeskCount: params.praiseReportDeskCount || '',
        comment: params.comment || '',
    };

    return (
        <Formik<IPruReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IPruReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Desk activity">
                        {NUMERIC_FIELDS.map(field => (
                            <NumberField
                                key={field.key as string}
                                label={field.label}
                                isDisabled={isCampusPastor}
                                value={values[field.key] as any}
                                onChangeText={handleChange(field.key as string)}
                            />
                        ))}
                    </FormSection>

                    <FormSection title="Notes">
                        <TextAreaField
                            label="Comment"
                            placeholder="Any other information"
                            isDisabled={isCampusPastor}
                            value={values?.comment ?? ''}
                            onChangeText={handleChange('comment')}
                        />
                    </FormSection>

                    <ReportWorkflowActions
                        reportId={params?._id}
                        reportType={reportType}
                        status={status}
                        ghComment={(params as any)?.ghComment}
                        pastorComment={(params as any)?.pastorComment}
                        gspComment={(params as any)?.gspComment}
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

export default PruReport;
