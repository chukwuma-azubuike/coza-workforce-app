import * as React from 'react';
import { Formik } from 'formik';
import { IProtocolReportPayload } from '@store/types';
import { useCreateProtocolReportMutation } from '@store/services/reports';
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

const ProtocolReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IProtocolReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateProtocolReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        incidentCount: params.incidentCount || '',
        theft: params.theft || '',
        specialGuestCount: params.specialGuestCount || '',
        comment: params.comment || '',
    };

    return (
        <Formik<IProtocolReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IProtocolReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Protocol activity">
                        <NumberField
                            label="Incidents recorded"
                            isDisabled={isCampusPastor}
                            value={values.incidentCount as any}
                            onChangeText={handleChange('incidentCount')}
                        />
                        <NumberField
                            label="Special guests received"
                            isDisabled={isCampusPastor}
                            value={values.specialGuestCount as any}
                            onChangeText={handleChange('specialGuestCount')}
                        />
                        <TextAreaField
                            label="Theft incidents"
                            placeholder="Narrative of any theft incidents"
                            isDisabled={isCampusPastor}
                            value={values?.theft ?? ''}
                            onChangeText={handleChange('theft')}
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

export default ProtocolReport;
