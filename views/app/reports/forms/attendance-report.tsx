import * as React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import { IAttendanceReportPayload } from '@store/types';
import { useCreateAttendanceReportMutation } from '@store/services/reports';
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
    TotalChip,
    submitLabelForStatus,
} from '@components/composite/report-form-kit';
import { useLocalSearchParams } from 'expo-router';

const AttendanceReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as IAttendanceReportPayload;
    const { status, updatedAt } = params;

    const { isCampusPastor, isGSP } = useRole();

    const [updateReport, { isLoading }] = useCreateAttendanceReportMutation();
    const { submit: onSubmit, isTransitioning, reportType } = useReportFormSubmit(updateReport as any, params);

    const INITIAL_VALUES = {
        ...params,
        femaleGuestCount: params.femaleGuestCount || '',
        maleGuestCount: params.maleGuestCount || '',
        otherInfo: params.otherInfo || '',
        infants: params.infants || '',
        total: params.total || '',
    };

    const computeTotal = React.useCallback(
        (values: IAttendanceReportPayload) => `${+values.femaleGuestCount + +values.maleGuestCount + +values.infants}`,
        []
    );

    return (
        <Formik<IAttendanceReportPayload>
            validateOnChange
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES as unknown as IAttendanceReportPayload}
        >
            {({ handleChange, handleSubmit, values, setFieldValue }) => (
                <ReportFormShell updatedAt={updatedAt} status={status as string}>
                    <FormSection title="Attendance">
                        <NumberField
                            label="Number of male guests"
                            isDisabled={isCampusPastor}
                            value={values.maleGuestCount as any}
                            onChangeText={handleChange('maleGuestCount')}
                        />
                        <NumberField
                            label="Number of female guests"
                            isDisabled={isCampusPastor}
                            value={values.femaleGuestCount as any}
                            onChangeText={handleChange('femaleGuestCount')}
                        />
                        <NumberField
                            label="Number of infant guests"
                            isDisabled={isCampusPastor}
                            value={values.infants as any}
                            onChangeText={handleChange('infants')}
                        />
                        <View className="flex-row gap-2 pt-1">
                            <TotalChip label="Total attendance" value={computeTotal(values)} />
                        </View>
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
                            onPress={() => {
                                setFieldValue('total', computeTotal(values));
                                handleSubmit();
                            }}
                        />
                    </If>
                </ReportFormShell>
            )}
        </Formik>
    );
};

export default AttendanceReport;
