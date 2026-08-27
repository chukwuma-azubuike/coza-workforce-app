import React, { memo, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import AvatarComponent from '@components/atoms/avatar';
import ReportStatusPill from '@components/composite/report-status-pill';
import ReportCommentSheet from '@components/composite/report-comment-sheet';
import ReportReturnBanner from '@components/composite/report-return-banner';
import ReviewHistory from '@components/composite/review-history';
import ReportDataView from '@components/composite/report-views';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { getReportStatusMeta } from '@constants/report-status';
import { buildReportFormParams } from '@constants/report-routes';
import {
    actionsFor,
    makeIdempotencyKey,
    toLogicalRole,
    transitionErrorMessage,
    ReportAction,
} from '@constants/report-actions';
import { useGetGhReportDetailQuery, useTransitionReportMutation } from '@store/services/grouphead';
import { IReportStatus, IReviewHistoryEntry } from '@store/types';
import useRole from '@hooks/role';
import { cn } from '~/lib/utils';

interface RouteParams {
    reportId: string;
    reportType: string;
    departmentId: string;
    serviceId: string;
    departmentName: string;
    campus: string;
    serviceName: string;
    status: string;
}

// Statuses that mean "a reviewer sent this back". Used to decide whether to lead
// with the return banner rather than the ordinary submitted-by header.
const RETURNED_STATUSES: ReadonlySet<string> = new Set([
    IReportStatus.GH_CHANGE_REQUESTED,
    IReportStatus.CP_CHANGE_REQUESTED,
    IReportStatus.GSP_CHANGE_REQUESTED,
    IReportStatus.REVIEW_REQUESTED,
]);

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

const CommentCard: React.FC<{ label: string; comment: string }> = ({ label, comment }) => (
    <Card className="p-4 gap-1.5">
        <SectionLabel>{label}</SectionLabel>
        <Text className="!text-[13px] text-foreground leading-snug line-clamp-none">"{comment}"</Text>
    </Card>
);

const ApprovalsReportDetail: React.FC = () => {
    const params = useLocalSearchParams<RouteParams>();
    const { reportId, reportType, departmentId, serviceId, departmentName, campus, serviceName, status } = params;

    const insets = useSafeAreaInsets();
    const { isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP } = useRole();
    const role = toLogicalRole({ isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP });

    const [pendingCommentAction, setPendingCommentAction] = useState<ReportAction | null>(null);
    const [doneStatus, setDoneStatus] = useState<IReportStatus | null>(null);

    const {
        data: detail,
        isLoading,
        refetch,
    } = useGetGhReportDetailQuery(
        { reportId: reportId as string, reportType: reportType as string },
        { skip: !reportId }
    );

    const [transition, { isLoading: isTransitioning }] = useTransitionReportMutation();

    const reportStatus = (detail?.status ?? status) as IReportStatus;
    const actions = useMemo(
        () => actionsFor(reportStatus, role, detail?.awaitingRole),
        [reportStatus, role, detail?.awaitingRole]
    );

    // Resolve the report fields and type defensively: the backend may nest the
    // doc under `reportData`/`report`, return it flat on the detail object, or
    // omit `reportType` (in which case the list row's value carries through).
    const d = detail as any;
    const resolvedReportType = (d?.reportType ?? reportType) as string | undefined;
    const resolvedReportData = d?.reportData ?? d?.report ?? d ?? undefined;

    const reviewHistory = detail?.reviewHistory ?? [];

    // The most recent return, whoever sent it back. Previously this only matched the
    // Campus Pastor, so a HOD — the role that actually has to respond — never saw a
    // banner for the Group Head return that brought them here.
    const returnEntry = useMemo<IReviewHistoryEntry | null>(() => {
        if (!RETURNED_STATUSES.has(reportStatus)) return null;
        return [...reviewHistory].reverse().find(e => e.action === 'CHANGE_REQUESTED') ?? null;
    }, [reviewHistory, reportStatus]);

    // ─── Edit path ──────────────────────────────────────────────────────────
    // Owning the "move it to HOD_SUBMITTED" action is what makes a report yours to
    // fill in — true for a DRAFT and for anything a reviewer returned. Without this
    // the only button was Resubmit, which fires the transition with the report
    // untouched: the reviewer gets back the identical figures they just rejected.
    const submitAction = useMemo(
        () => actions.find(action => action.toStatus === IReportStatus.HOD_SUBMITTED) ?? null,
        [actions]
    );

    const editTarget = useMemo(() => {
        if (!submitAction) return null;
        return buildReportFormParams({
            reportType: resolvedReportType,
            departmentName: departmentName || detail?.departmentName,
            // Only `departmentId`/`serviceId` are seeded from the route — the form
            // needs them to address the update. Display-only params (campus,
            // serviceName) are deliberately left out: the form posts its whole value
            // object back, and a campus *name* landing in a field that expects an id
            // fails on the server rather than on the screen.
            report: {
                departmentId,
                serviceId,
                ...(resolvedReportData ?? {}),
                _id: resolvedReportData?._id ?? reportId,
                status: reportStatus,
            },
        });
    }, [
        submitAction,
        resolvedReportType,
        resolvedReportData,
        departmentName,
        detail?.departmentName,
        departmentId,
        serviceId,
        reportId,
        reportStatus,
    ]);

    const canEdit = !!submitAction && !!editTarget && !doneStatus && !isLoading && !!detail;

    const openEditor = () => {
        if (!editTarget) return;
        router.push({ pathname: editTarget.pathname as any, params: editTarget.params });
    };

    const runAction = async (action: ReportAction, comment?: string) => {
        try {
            const res = await transition({
                reportId: reportId as string,
                reportType: reportType as string,
                toStatus: action.toStatus,
                comment,
                idempotencyKey: makeIdempotencyKey(),
            }).unwrap();
            setPendingCommentAction(null);
            setDoneStatus(res?.status ?? action.toStatus);
        } catch (err) {
            const info = transitionErrorMessage(err);
            setPendingCommentAction(null);
            if (info.shouldRefresh) refetch();
            Alert.alert(info.isValidation ? 'Comment required' : 'Could not update', info.message);
        }
    };

    const onActionPress = (action: ReportAction) => {
        if (action.requireComment) {
            setPendingCommentAction(action);
            return;
        }
        Alert.alert(action.label, `${action.label} this report?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: action.label, onPress: () => runAction(action) },
        ]);
    };

    // Resubmitting a returned report untouched is a legitimate choice — the reviewer
    // may have asked for a note rather than a number — but it is the choice that
    // wastes a review cycle, so it says what it does rather than just "Resubmit".
    const onResubmitUnchanged = (action: ReportAction) => {
        Alert.alert(
            'Resubmit without changes?',
            'This sends the report back for review exactly as it is. Nothing you were asked to change will have changed.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Make changes', onPress: openEditor },
                { text: 'Resubmit as is', style: 'destructive', onPress: () => runAction(action) },
            ]
        );
    };

    const serviceLabel = serviceName || campus;
    const submittedByName = detail?.submittedBy || 'Head of Department';

    const renderActionBar = () => {
        if (doneStatus) {
            const meta = getReportStatusMeta(doneStatus);
            return (
                <View
                    className={cn(
                        'flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2',
                        meta.containerClass
                    )}
                >
                    <Ionicons name="checkmark" size={15} color="#16a34a" />
                    <Text className={cn('!text-[13px] font-semibold', meta.textClass)}>{meta.label}</Text>
                </View>
            );
        }

        // The report is this user's to fill in. Editing leads; resubmitting untouched
        // stays available but has to be chosen.
        if (canEdit && submitAction) {
            return (
                <View className="flex-1 gap-2">
                    <Button
                        size="sm"
                        className="h-12"
                        disabled={isTransitioning}
                        startIcon={<Ionicons name="create-outline" size={18} color="white" />}
                        onPress={openEditor}
                    >
                        {returnEntry ? 'Make changes' : 'Open report'}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-9"
                        disabled={isTransitioning}
                        isLoading={isTransitioning}
                        onPress={() =>
                            returnEntry ? onResubmitUnchanged(submitAction) : onActionPress(submitAction)
                        }
                    >
                        {returnEntry ? 'Resubmit without changes' : submitAction.label}
                    </Button>
                </View>
            );
        }

        if (isLoading) {
            return (
                <View className="flex-1 h-12 rounded-xl bg-secondary border border-border items-center justify-center">
                    <Skeleton className="h-4 w-28 rounded" />
                </View>
            );
        }

        if (!actions.length) {
            // No actions for this role/status — show a neutral state chip.
            const meta = getReportStatusMeta(reportStatus);
            return (
                <View className="flex-1 h-12 rounded-xl bg-secondary border border-border items-center justify-center">
                    <Text className="!text-[13px] font-semibold text-muted-foreground">{meta.label}</Text>
                </View>
            );
        }

        return (
            <>
                {actions.map(action => (
                    <Button
                        key={action.toStatus + action.label}
                        variant={action.variant === 'approve' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        disabled={isTransitioning}
                        isLoading={isTransitioning}
                        startIcon={
                            <Ionicons
                                name={action.variant === 'approve' ? 'checkmark' : 'create-outline'}
                                size={20}
                                color={action.variant === 'approve' ? 'white' : '#71717a'}
                            />
                        }
                        onPress={() => onActionPress(action)}
                    >
                        {action.label}
                    </Button>
                ))}
            </>
        );
    };

    return (
        <>
            <ScrollView className="flex-1 bg-background">
                <View className="px-4 pt-3 pb-6 gap-3">
                    {/* Why it came back — first thing on the screen, whoever returned it. */}
                    {!isLoading && returnEntry && (
                        <ReportReturnBanner
                            entry={returnEntry}
                            callToAction={
                                canEdit ? 'Update the report below, then submit it for review again.' : undefined
                            }
                        />
                    )}

                    {/* Submitted by */}
                    <Card className="p-4">
                        {isLoading ? (
                            <View className="flex-row items-center gap-3">
                                <Skeleton className="w-11 h-11 rounded-full" />
                                <View className="gap-1.5">
                                    <Skeleton className="h-4 w-32 rounded" />
                                    <Skeleton className="h-3 w-48 rounded" />
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row items-center gap-3">
                                <AvatarComponent alt="hod" className="w-11 h-11" imageUrl={AVATAR_FALLBACK_URL} />
                                <View className="flex-1">
                                    <Text className="font-semibold text-foreground">{submittedByName}</Text>
                                    <Text className="text-sm text-muted-foreground mt-0.5">
                                        {departmentName || detail?.departmentName}
                                        {serviceLabel ? ` · ${serviceLabel}` : ''}
                                    </Text>
                                    <Text className="text-sm text-muted-foreground mt-0.5">
                                        {dayjs(detail?.serviceTime).format('DD MMM YYYY, hh:mm A')}
                                    </Text>
                                </View>
                                <ReportStatusPill status={reportStatus} size="sm" role={role ?? 'GROUP_HEAD'} />
                            </View>
                        )}
                    </Card>

                    {/* Latest stage comments. The one that matches the return already leads
                        the screen as a banner, so skip it here rather than say it twice. */}
                    {!isLoading && detail?.ghComment && returnEntry?.actorRole !== 'GH' ? (
                        <CommentCard label="Group Head note" comment={detail.ghComment} />
                    ) : null}
                    {!isLoading && detail?.pastorComment && returnEntry?.actorRole !== 'CP' ? (
                        <CommentCard label="Campus Pastor note" comment={detail.pastorComment} />
                    ) : null}
                    {!isLoading && detail?.gspComment && returnEntry?.actorRole !== 'GSP' ? (
                        <CommentCard label="GSP note" comment={detail.gspComment} />
                    ) : null}

                    {/* Report data */}
                    {isLoading ? (
                        <Card className="p-4 gap-2">
                            <SectionLabel>Report data</SectionLabel>
                            <Skeleton className="h-3.5 w-full rounded" />
                            <Skeleton className="h-3.5 w-full rounded" />
                            <Skeleton className="h-3.5 w-4/5 rounded" />
                        </Card>
                    ) : (
                        <ReportDataView reportType={resolvedReportType} data={resolvedReportData} />
                    )}

                    {/* Report history */}
                    {!isLoading && <ReviewHistory history={reviewHistory} />}
                </View>
            </ScrollView>

            {/* Actions pinned above the fold. A returned report is reached from a
                notification and is read top-down; leaving the only way to act at the
                bottom of a long report meant scrolling past everything to find it. */}
            <View
                className="flex-row items-center gap-2 px-4 pt-3 border-t border-border bg-background"
                style={{ paddingBottom: insets.bottom + 12 }}
            >
                {renderActionBar()}
            </View>

            {/* Comment sheet — shared across all change-request actions */}
            <ReportCommentSheet
                visible={pendingCommentAction !== null}
                title={pendingCommentAction?.label ?? 'Request Changes'}
                placeholder="Explain what needs to be changed…"
                submitLabel={pendingCommentAction?.label ?? 'Submit'}
                isLoading={isTransitioning}
                onClose={() => setPendingCommentAction(null)}
                onSubmit={comment => pendingCommentAction && runAction(pendingCommentAction, comment)}
            />
        </>
    );
};

export default memo(ApprovalsReportDetail);
