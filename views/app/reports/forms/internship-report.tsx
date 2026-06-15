import * as React from 'react';
import { Formik } from 'formik';
import { IInternshipReportPayload } from '@store/types';
import { useCreateInternshipReportMutation } from '@store/services/reports';
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
    TextField,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { useLocalSearchParams } from 'expo-router';

const InternshipReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IInternshipReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateInternshipReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        classMemberCount: params.classMemberCount || '',
        classTaken: params.classTaken || '',
        convertsCompletedClassCount: params.convertsCompletedClassCount || '',
        location: params.location || '',
        comment: params.comment || '',
    };

    return (
        <Formik<IInternshipReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IInternshipReportPayload}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Class">
                        <TextField
                            label="Class taken"
                            placeholder="Topic or title of the class"
                            isDisabled={isCampusPastor}
                            value={values?.classTaken ?? ''}
                            onChangeText={handleChange('classTaken')}
                        />
                        <TextField
                            label="Location"
                            placeholder="Venue where the class was held"
                            isDisabled={isCampusPastor}
                            value={values?.location ?? ''}
                            onChangeText={handleChange('location')}
                        />
                    </FormSection>

                    <FormSection title="Attendance">
                        <NumberField
                            label="Class attendance"
                            isDisabled={isCampusPastor}
                            value={values.classMemberCount as any}
                            onChangeText={handleChange('classMemberCount')}
                        />
                        <NumberField
                            label="Converts who completed the class"
                            isDisabled={isCampusPastor}
                            value={values.convertsCompletedClassCount as any}
                            onChangeText={handleChange('convertsCompletedClassCount')}
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

export default InternshipReport;
