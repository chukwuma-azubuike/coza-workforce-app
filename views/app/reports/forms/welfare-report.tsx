import * as React from 'react';
import { Formik } from 'formik';
import { IWelfareReportPayload } from '@store/types';
import { useCreateWelfareReportMutation } from '@store/services/reports';
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

const WelfareReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IWelfareReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateWelfareReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        medicalSupportCount: params.medicalSupportCount || '',
        medicalIncident: params.medicalIncident || '',
        aidRequestCount: params.aidRequestCount || '',
        aidTreatedCount: params.aidTreatedCount || '',
        aidDeclinedCount: params.aidDeclinedCount || '',
        comment: params.comment || '',
    };

    return (
        <Formik<IWelfareReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IWelfareReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Medical support">
                        <NumberField
                            label="People given medical support"
                            isDisabled={isCampusPastor}
                            value={values.medicalSupportCount as any}
                            onChangeText={handleChange('medicalSupportCount')}
                        />
                        <TextAreaField
                            label="Medical incident"
                            placeholder="Narrative of any medical incidents"
                            isDisabled={isCampusPastor}
                            value={values?.medicalIncident ?? ''}
                            onChangeText={handleChange('medicalIncident')}
                        />
                    </FormSection>

                    <FormSection title="Aid requests">
                        <NumberField
                            label="Aid requests received"
                            isDisabled={isCampusPastor}
                            value={values.aidRequestCount as any}
                            onChangeText={handleChange('aidRequestCount')}
                        />
                        <NumberField
                            label="Aid requests treated"
                            isDisabled={isCampusPastor}
                            value={values.aidTreatedCount as any}
                            onChangeText={handleChange('aidTreatedCount')}
                        />
                        <NumberField
                            label="Aid requests declined"
                            isDisabled={isCampusPastor}
                            value={values.aidDeclinedCount as any}
                            onChangeText={handleChange('aidDeclinedCount')}
                        />
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
                        awaitingRole={(params as any)?.awaitingRole}
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

export default WelfareReport;
