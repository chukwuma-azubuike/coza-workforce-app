import { Text } from '~/components/ui/text';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import React from 'react';
import { THEME_CONFIG } from '@config/appConfig';
import { Button } from '~/components/ui/button';
import ReportCommentSheet from '@components/composite/report-comment-sheet';
import { TRANSITION_COMMENT_MIN } from '@constants/report-actions';
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
    const { serviceId, campusId, status: campusStatus } = params;
    const { user, isCampusPastor, isGlobalPastor } = useRole();

    const [pendingChangeRequest, setPendingChangeRequest] = React.useState(false);

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

    // ─── GSP decision (approve / request changes on the campus report) ───────────
    // Reuses the campus-report submit endpoint with a GSP status. A campus is still
    // actionable while it sits at a pre-GSP-final stage; once finalised/returned we
    // just reflect the status.
    const AWAITING_GSP: string[] = [IReportStatus.GSP_SUBMITTED, IReportStatus.CP_APPROVED];
    const gspCanAct = isGlobalPastor && (!campusStatus || AWAITING_GSP.includes(campusStatus as string));

    const submitGspDecision = async (status: IReportStatus, comment?: string) => {
        const result = await submitGSPReport({
            campusId,
            serviceId,
            userId: user?._id,
            submittedReportIds,
            incidentReportIds,
            campusCoordinatorComment: comment ?? '',
            status,
        } as unknown as IGSPReportPayload);

        if ('data' in result) {
            setModalState({
                message: status === IReportStatus.GSP_APPROVED ? 'Campus report approved' : 'Changes requested',
                status: 'success',
            });
            setPendingChangeRequest(false);
            router.back();
        }
        if ('error' in result) {
            setModalState({ message: (error as any)?.data?.message || 'Something went wrong', status: 'error' });
        }
    };

    const onGspApprove = () =>
        Alert.alert('Approve campus report', 'Approve this campus report as final?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Approve', onPress: () => submitGspDecision(IReportStatus.GSP_APPROVED) },
        ]);

    return (
        <>
        <ViewWrapper scroll noPadding avoidKeyboard refreshing={isLoading} onRefresh={handleRefresh}>
            <View className="px-4 pt-3 pb-12 gap-4">
                {isGlobalPastor && params?.campusName ? (
                    <Text className="!text-2xl font-bold text-foreground">{params.campusName}</Text>
                ) : null}

                {isLoading || isFetching ? (
                    // Mirror the real layout: dept header row + a report-data card beneath it
                    [1, 2, 3, 4].map(i => (
                        <View key={i} className="gap-2">
                            {/* Department name + status pill */}
                            <View className="flex-row items-center justify-between px-1">
                                <Skeleton className="h-5 w-2/5 rounded" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </View>
                            {/* Report data card */}
                            <View className="rounded-3xl border border-border overflow-hidden">
                                {/* Section label */}
                                <View className="px-4 pt-4 pb-2">
                                    <Skeleton className="h-3 w-1/3 rounded" />
                                </View>
                                {/* 2-up stat tiles */}
                                <View className="flex-row gap-2 px-4 pb-4">
                                    <View className="flex-1 rounded-xl bg-secondary p-3 gap-2">
                                        <Skeleton className="h-7 w-10 rounded" />
                                        <Skeleton className="h-3 w-3/4 rounded" />
                                    </View>
                                    <View className="flex-1 rounded-xl bg-secondary p-3 gap-2">
                                        <Skeleton className="h-7 w-10 rounded" />
                                        <Skeleton className="h-3 w-3/4 rounded" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))
                ) : departments.length === 0 && incidentRows.length === 0 ? (
                    <View className="py-16 items-center gap-3">
                        <View className="w-14 h-14 rounded-3xl bg-secondary items-center justify-center">
                            <Ionicons name="document-text-outline" size={28} color={THEME_CONFIG.lightGray} />
                        </View>
                        <Text className="text-sm text-muted-foreground text-center px-8 line-clamp-none">
                            No departmental reports found for this campus and service yet.
                        </Text>
                    </View>
                ) : (
                    <>
                        {departments.map((dept, i) => (
                            <View key={`${dept.departmentName}-${i}`} className="gap-2">
                                <View className="flex-row items-center justify-between px-1">
                                    <Text className="!text-base font-bold text-foreground">{dept.departmentName}</Text>
                                    {dept?.report?.status ? (
                                        <ReportStatusPill status={dept.report.status as string} size="sm" role="CAMPUS_PASTOR" />
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

                {/* GSP view of the CP's note + approve / request-changes actions */}
                <If condition={isGlobalPastor}>
                    {data?.campusCoordinatorComment ? (
                        <ReportSection title="For the GSP's attention">
                            <Text className="!text-[13px] text-foreground leading-relaxed">
                                {data.campusCoordinatorComment}
                            </Text>
                        </ReportSection>
                    ) : null}

                    {!isLoading && !isFetching && departments.length > 0 ? (
                        gspCanAct ? (
                            <View className="flex-row items-center gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    isLoading={isSubmitLoading}
                                    startIcon={<Ionicons name="create-outline" size={20} color={THEME_CONFIG.gray} />}
                                    onPress={() => setPendingChangeRequest(true)}
                                >
                                    Request changes
                                </Button>
                                <Button
                                    className="flex-1"
                                    isLoading={isSubmitLoading}
                                    startIcon={<Ionicons name="checkmark" size={20} color="white" />}
                                    onPress={onGspApprove}
                                >
                                    Approve
                                </Button>
                            </View>
                        ) : campusStatus ? (
                            <View className="pt-1 flex-row">
                                <ReportStatusPill status={campusStatus as string} role="GSP" />
                            </View>
                        ) : null
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

        <ReportCommentSheet
            visible={pendingChangeRequest}
            title="Request changes"
            placeholder="Explain what the campus needs to revise…"
            submitLabel="Request changes"
            isLoading={isSubmitLoading}
            onClose={() => setPendingChangeRequest(false)}
            onSubmit={comment => {
                if ((comment?.trim().length ?? 0) < TRANSITION_COMMENT_MIN) {
                    setModalState({
                        message: `Please provide a comment of at least ${TRANSITION_COMMENT_MIN} characters.`,
                        status: 'info',
                    });
                    return;
                }
                submitGspDecision(IReportStatus.GSP_CHANGE_REQUESTED, comment);
            }}
        />
        </>
    );
};

export default CampusReport;
