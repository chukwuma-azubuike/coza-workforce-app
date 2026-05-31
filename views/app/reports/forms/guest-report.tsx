import * as React from 'react';
import { Formik } from 'formik';
import { IGuestReportPayload } from '@store/types';
import { useCreateGuestReportMutation } from '@store/services/reports';
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

const GuestReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IGuestReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateGuestReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        firstTimersCount: params.firstTimersCount || '',
        newConvertsCount: params.newConvertsCount || '',
        otherInfo: params.otherInfo || '',
    };

    return (
        <Formik<IGuestReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IGuestReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Guests">
                        <NumberField
                            label="Number of first timers"
                            isDisabled={isCampusPastor}
                            value={values.firstTimersCount as any}
                            onChangeText={handleChange('firstTimersCount')}
                        />
                        <NumberField
                            label="Number of new converts"
                            isDisabled={isCampusPastor}
                            value={values.newConvertsCount as any}
                            onChangeText={handleChange('newConvertsCount')}
                        />
                    </FormSection>

                    <FormSection title="Notes">
                        <TextAreaField
                            label="Other information"
                            placeholder="Any other information"
                            isDisabled={isCampusPastor}
                            value={values?.otherInfo ?? ''}
                            onChangeText={handleChange('otherInfo')}
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

export default GuestReport;
