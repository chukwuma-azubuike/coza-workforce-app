import { Text } from '~/components/ui/text';
import { View } from 'react-native';
import { Formik } from 'formik';
import React from 'react';
import If from '@components/composite/if-container';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import useModal from '@hooks/modal/useModal';
import useRole from '@hooks/role';
import {
    ICampusReport,
    IGSPReportPayload,
    useGetCampusReportSummaryQuery,
    useSubmitGSPReportMutation,
} from '@store/services/reports';
import { IReportStatus } from '@store/types';
import { GSPReportSchema } from '@utils/schemas';
import ReportDataView from '@components/composite/report-views';
import { DataTable, ReportSection } from '@components/composite/report-views/primitives';
import { FormSection, SubmitButton, TextAreaField } from '@components/composite/report-form-kit';
import ReportStatusPill from '@components/composite/report-status-pill';
import { resolveReportType } from '@constants/report-actions';
import { Skeleton } from '~/components/ui/skeleton';
import { router, useLocalSearchParams } from 'expo-router';

const CampusReport: React.FC = () => {
    const params = useLocalSearchParams() as unknown as ICampusReport & { campusName: string };
    const { serviceId, campusId } = params;
    const { user, isCampusPastor, isGlobalPastor } = useRole();

    const { data, refetch, isLoading, isFetching } = useGetCampusReportSummaryQuery(
        {
            serviceId: serviceId as string,
            campusId: campusId as string,
        },
        {
            refetchOnFocus: true,
        }
    );

    useScreenFocus({ onFocus: refetch });

    const departments = data?.departmentalReport ?? [];

    const reportsNotApproved = React.useMemo(
        () =>
            departments.find(
                (report: any) =>
                    report.status === IReportStatus.PENDING || report.status === IReportStatus.REVIEW_REQUESTED
            ),
        [departments]
    );

    const incidentRows = React.useMemo(
        () =>
            (data?.incidentReport ?? []).map(elm => [
                elm?.departmentName ?? '—',
                elm?.incidentReport?.details ?? '—',
            ]),
        [data?.incidentReport]
    );

    const handleRefresh = () => {
        serviceId && refetch();
    };

    const approvedReports = React.useMemo(
        () => departments.filter(report => report?.report?.status === IReportStatus.APPROVED),
        [departments]
    );
    const submittedReportIds = React.useMemo(
        () => approvedReports?.map(report => report?.report?._id),
        [approvedReports]
    );
    const incidentReportIds = React.useMemo(
        () => data?.incidentReport.map(report => report?.incidentReport?._id),
        [data]
    );

    const INITIAL_VALUES = {
        campusId,
        serviceId,
        userId: user?._id,
        incidentReportIds,
        submittedReportIds,
        campusCoordinatorComment: '',
        status: IReportStatus.GSP_SUBMITTED,
    };

    const [submitGSPReport, { error, isLoading: isSubmitLoading, reset }] = useSubmitGSPReportMutation();
    const { setModalState } = useModal();

    const onSubmit = async (values: IGSPReportPayload) => {
        // Ensure all departmental reports are approved before submitting
        if (values?.submittedReportIds?.length < (departments.length ?? 0)) {
            setModalState({ message: 'Kindly ensure all departmental reports have been approved', status: 'info' });
            return;
        }

        if (!!reportsNotApproved) {
            return setModalState({ message: 'All reports need to be approved before submitting', status: 'info' });
        }
        const result = await submitGSPReport(values);

        if ('data' in result) {
            setModalState({ message: 'Submitted to GSP', status: 'success' });
            reset();
            router.back();
        }

        if ('error' in result) {
            setModalState({ message: (error as any)?.data?.message || 'Something went wrong', status: 'error' });
        }
    };

    return (
        <ViewWrapper scroll noPadding avoidKeyboard refreshing={isLoading} onRefresh={handleRefresh}>
            <View className="px-4 pt-3 pb-12 gap-4">
                {isGlobalPastor && params?.campusName ? (
                    <Text className="!text-2xl font-bold text-foreground">{params.campusName}</Text>
                ) : null}

                {isLoading || isFetching ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)
                ) : (
                    <>
                        {departments.map((dept, i) => (
                            <View key={`${dept.departmentName}-${i}`} className="gap-2">
                                <View className="flex-row items-center justify-between px-1">
                                    <Text className="!text-base font-bold text-foreground">{dept.departmentName}</Text>
                                    {dept?.report?.status ? (
                                        <ReportStatusPill status={dept.report.status as string} size="sm" />
                                    ) : null}
                                </View>
                                <ReportDataView
                                    reportType={resolveReportType({
                                        reportType: (dept?.report as any)?.reportType,
                                        departmentName: dept.departmentName,
                                    })}
                                    data={dept?.report}
                                />
                            </View>
                        ))}

                        {incidentRows.length > 0 && (
                            <ReportSection title="Incidents">
                                <DataTable headers={['Department', 'Incident']} rows={incidentRows} />
                            </ReportSection>
                        )}
                    </>
                )}

                {/* GSP view of the CP's note */}
                <If condition={isGlobalPastor}>
                    {data?.campusCoordinatorComment ? (
                        <ReportSection title="For the GSP's attention">
                            <Text className="!text-[13px] text-foreground leading-relaxed">
                                {data.campusCoordinatorComment}
                            </Text>
                        </ReportSection>
                    ) : null}
                </If>

                {/* CP comment + submit to GSP */}
                <If condition={isCampusPastor}>
                    <Formik<IGSPReportPayload>
                        onSubmit={onSubmit}
                        validationSchema={GSPReportSchema}
                        initialValues={INITIAL_VALUES as unknown as IGSPReportPayload}
                    >
                        {({ errors, handleChange, handleSubmit, values }) => (
                            <View className="gap-3">
                                <FormSection title="For the GSP's attention">
                                    <TextAreaField
                                        label="Comment"
                                        placeholder="Add a note for the GSP…"
                                        value={values?.campusCoordinatorComment ?? ''}
                                        onChangeText={handleChange('campusCoordinatorComment')}
                                        error={errors?.campusCoordinatorComment}
                                    />
                                </FormSection>
                                <SubmitButton
                                    label="Submit to GSP"
                                    isLoading={isSubmitLoading}
                                    onPress={handleSubmit as () => void}
                                />
                            </View>
                        )}
                    </Formik>
                </If>
            </View>
        </ViewWrapper>
    );
};

export default CampusReport;
