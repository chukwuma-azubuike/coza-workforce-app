import React, { memo, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
import CpReturnBanner from '@components/composite/cp-return-banner';
import ReportDataView from '@components/composite/report-views';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { getReportStatusMeta } from '@constants/report-status';
import { actionsFor, makeIdempotencyKey, toLogicalRole, transitionErrorMessage, ReportAction } from '@constants/report-actions';
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

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

const HISTORY_ROLE_LABELS: Record<string, string> = {
    HOD: 'Head of Department',
    AHOD: 'Asst. HOD',
    GH: 'Group Head',
    CP: 'Campus Pastor',
    GSP: 'Global Senior Pastor',
};

const HISTORY_ACTION_LABELS: Record<string, string> = {
    SUBMIT: 'Submitted report',
    APPROVE: 'Approved',
    CHANGE_REQUESTED: 'Requested changes',
};

const humanize = (key: string): string =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();

const HistoryRow: React.FC<{ entry: IReviewHistoryEntry; isLast: boolean }> = ({ entry, isLast }) => (
    <View className="flex-row gap-3">
        <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
                <Ionicons name="person-outline" size={14} color="#71717a" />
            </View>
            {!isLast && <View className="w-0.5 flex-1 bg-border mt-1" />}
        </View>
        <View className="flex-1 pb-4 gap-0.5">
            <Text className="text-sm font-semibold text-foreground">
                {HISTORY_ROLE_LABELS[entry.actorRole] ?? entry.actorRole}
            </Text>
            <Text className="text-sm leading-8 text-muted-foreground">{dayjs(entry.timestamp).fromNow()}</Text>
            <Text className="text-sm leading-8 text-foreground mt-1">
                {HISTORY_ACTION_LABELS[entry.action] ?? humanize(entry.action)}
            </Text>
            {entry.comment ? (
                <View className="mt-1.5 bg-secondary rounded-xl px-3 py-2">
                    <Text className="text-sm text-foreground leading-snug">"{entry.comment}"</Text>
                </View>
            ) : null}
        </View>
    </View>
);

const CommentCard: React.FC<{ label: string; comment: string }> = ({ label, comment }) => (
    <Card className="p-4 gap-1.5">
        <SectionLabel>{label}</SectionLabel>
        <Text className="!text-[13px] text-foreground leading-snug">"{comment}"</Text>
    </Card>
);

const ApprovalsReportDetail: React.FC = () => {
    const params = useLocalSearchParams<RouteParams>();
    const { reportId, reportType, departmentName, campus, serviceName, status } = params;

    const { isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP } = useRole();
    const role = toLogicalRole({ isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP });

    const [pendingCommentAction, setPendingCommentAction] = useState<ReportAction | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [doneStatus, setDoneStatus] = useState<IReportStatus | null>(null);

    const { data: detail, isLoading, refetch } = useGetGhReportDetailQuery(
        { reportId: reportId as string, reportType: reportType as string },
        { skip: !reportId }
    );

    const [transition, { isLoading: isTransitioning }] = useTransitionReportMutation();

    const reportStatus = (detail?.status ?? status) as IReportStatus;
    const actions = useMemo(() => actionsFor(reportStatus, role), [reportStatus, role]);

    // Resolve the report fields and type defensively: the backend may nest the
    // doc under `reportData`/`report`, return it flat on the detail object, or
    // omit `reportType` (in which case the list row's value carries through).
    const d = detail as any;
    const resolvedReportType = (d?.reportType ?? reportType) as string | undefined;
    const resolvedReportData = d?.reportData ?? d?.report ?? d ?? undefined;

    const reviewHistory = detail?.reviewHistory ?? [];

    const cpReturnEntry = useMemo<IReviewHistoryEntry | null>(() => {
        return (
            [...reviewHistory]
                .reverse()
                .find(e => e.actorRole === 'CP' && e.action === 'CHANGE_REQUESTED') ?? null
        );
    }, [reviewHistory]);

    const reversedHistory = useMemo(() => [...reviewHistory].reverse(), [reviewHistory]);

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

    const serviceLabel = serviceName || campus;
    const submittedByName = detail?.submittedBy || 'Head of Department';

    const renderActionBar = () => {
        if (doneStatus) {
            const meta = getReportStatusMeta(doneStatus);
            return (
                <View className={cn('flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2', meta.containerClass)}>
                    <Ionicons name="checkmark" size={15} color="#16a34a" />
                    <Text className={cn('!text-[13px] font-semibold', meta.textClass)}>{meta.label}</Text>
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
                <View className="px-4 pt-3 pb-8 gap-3">
                    {/* CP Return Banner — shown when CP sent back with changes */}
                    {!isLoading && reportStatus === IReportStatus.CP_CHANGE_REQUESTED && cpReturnEntry && (
                        <CpReturnBanner entry={cpReturnEntry} />
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
                                <AvatarComponent
                                    alt="hod"
                                    className="w-11 h-11"
                                    imageUrl={AVATAR_FALLBACK_URL}
                                />
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

                    {/* Latest stage comments */}
                    {!isLoading && detail?.ghComment ? (
                        <CommentCard label="Group Head note" comment={detail.ghComment} />
                    ) : null}
                    {!isLoading && detail?.pastorComment ? (
                        <CommentCard label="Campus Pastor note" comment={detail.pastorComment} />
                    ) : null}
                    {!isLoading && detail?.gspComment ? (
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
                    {!isLoading && reversedHistory.length > 0 && (
                        <Card className="px-4 gap-3">
                            <View className="flex-row items-center justify-between">
                                <SectionLabel>Approval history</SectionLabel>
                                <Button variant="ghost" textClassName='!text-sm' size="sm" onPress={() => setShowHistory(h => !h)}>
                                    {showHistory ? 'Hide' : 'Show all'}
                                </Button>
                            </View>
                            {showHistory && (
                                <View className="gap-0">
                                    {reversedHistory.map((entry, i) => (
                                        <HistoryRow
                                            key={`${entry.timestamp}-${i}`}
                                            entry={entry}
                                            isLast={i === reversedHistory.length - 1}
                                        />
                                    ))}
                                </View>
                            )}
                        </Card>
                    )}

                    {/* Actions */}
                    <View className="flex-row items-center gap-2 pt-1">{renderActionBar()}</View>
                </View>
            </ScrollView>

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
