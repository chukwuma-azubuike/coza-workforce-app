import * as React from 'react';
import { Formik } from 'formik';
import useModal from '@hooks/modal/useModal';
import { IIncidentReportPayload } from '@store/types';
import { useCreateIncidentReportMutation } from '@store/services/reports';
import { FormSection, ReportFormShell, SubmitButton, TextAreaField } from '@components/composite/report-form-kit';
import { router, useLocalSearchParams } from 'expo-router';

const IncidentReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IIncidentReportPayload;

    const { status, updatedAt, details } = params;

    const [updateReport, { error, isLoading }] = useCreateIncidentReportMutation();
    const { setModalState } = useModal();

    const onSubmit = async (values: IIncidentReportPayload) => {
        try {
            const res = await updateReport({ ...values, status: 'SUBMITTED' });

            if (res.data) {
                setModalState({ defaultRender: true, status: 'success', message: 'Report updated' });
                router.back();
            }
            if (res.error) {
                setModalState({
                    defaultRender: true,
                    status: 'error',
                    message: (error as any)?.data?.message || 'Something went wrong!',
                });
            }
        } catch {}
    };

    const INITIAL_VALUES = { ...params, imageUrl: params.imageUrl || '', details };

    return (
        <Formik<IIncidentReportPayload>
            enableReinitialize
            validateOnChange
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, handleSubmit, values }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Incident">
                        <TextAreaField
                            label="Details of incident"
                            placeholder="Enter details"
                            isDisabled={!!details}
                            value={values?.details ?? ''}
                            onChangeText={handleChange('details')}
                        />
                    </FormSection>
                    {!details && (
                        <SubmitButton
                            label={!status ? 'Submit' : 'Update'}
                            isLoading={isLoading}
                            onPress={handleSubmit as () => void}
                        />
                    )}
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default IncidentReport;
