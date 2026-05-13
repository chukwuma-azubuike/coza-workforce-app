import React, { memo, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { v4 as uuid } from 'uuid';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import AvatarComponent from '@components/atoms/avatar';
import ReportStatusPill from '@components/composite/report-status-pill';
import ReportCommentSheet from '@components/composite/report-comment-sheet';
import CpReturnBanner from '@components/composite/cp-return-banner';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import {
    useApproveReportMutation,
    useRequestReportChangesMutation,
    usePushReportBackToHodMutation,
    useGetGhReportDetailQuery,
} from '@store/services/grouphead';
import { IReportStatus, IReportHistoryEntry } from '@store/types';
import { cn } from '~/lib/utils';
import { extractApiError } from '@utils/index';

interface RouteParams {
    reportId: string;
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

interface AttendanceStatProps {
    label: string;
    value: number;
    total: number;
    containerClass: string;
    textClass: string;
}

const AttendanceStat: React.FC<AttendanceStatProps> = ({ label, value, total, containerClass, textClass }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <View className={cn('flex-1 rounded-xl p-2.5 items-center', containerClass)}>
            <Text className={cn('!text-[24px] font-bold leading-none', textClass)}>{value}</Text>
            <Text className={cn('!text-[10px] font-semibold mt-1', textClass)}>{label}</Text>
            <Text className={cn('!text-[10px] mt-0.5 opacity-65', textClass)}>{pct}%</Text>
        </View>
    );
};

const HISTORY_ROLE_LABELS: Record<string, string> = {
    HOD: 'Head of Department',
    AHOD: 'Asst. HOD',
    GH: 'Group Head',
    CP: 'Campus Pastor',
    GSP: 'Global Senior Pastor',
};

const HISTORY_ACTION_LABELS: Record<string, string> = {
    SUBMITTED: 'Submitted report',
    GH_APPROVED: 'Approved — forwarded to CP',
    GH_CHANGE_REQUESTED: 'Requested changes',
    CP_APPROVED: 'Approved — forwarded to GSP',
    CP_CHANGE_REQUESTED: 'Returned for changes',
    GSP_APPROVED: 'Approved',
    GSP_CHANGE_REQUESTED: 'Returned for changes',
};

const HistoryRow: React.FC<{ entry: IReportHistoryEntry; isLast: boolean }> = ({ entry, isLast }) => (
    <View className="flex-row gap-3">
        <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
                <Ionicons name="person-outline" size={14} color="#71717a" />
            </View>
            {!isLast && <View className="w-0.5 flex-1 bg-border mt-1" />}
        </View>
        <View className="flex-1 pb-4 gap-0.5">
            <Text className="!text-[13px] font-semibold text-foreground">{entry.actorName}</Text>
            <Text className="!text-[11px] text-muted-foreground">
                {HISTORY_ROLE_LABELS[entry.actorRole] ?? entry.actorRole} · {dayjs(entry.createdAt).fromNow()}
            </Text>
            <Text className="!text-[12px] text-foreground mt-1">
                {HISTORY_ACTION_LABELS[entry.action] ?? entry.action}
            </Text>
            {entry.comment ? (
                <View className="mt-1.5 bg-secondary rounded-xl px-3 py-2">
                    <Text className="!text-[12px] text-foreground leading-snug">"{entry.comment}"</Text>
                </View>
            ) : null}
        </View>
    </View>
);

const ApprovalsReportDetail: React.FC = () => {
    const params = useLocalSearchParams<RouteParams>();
    const { reportId, serviceId, departmentName, campus, serviceName, status } = params;

    const [showRequestChanges, setShowRequestChanges] = useState(false);
    const [showPushBack, setShowPushBack] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [actionDone, setActionDone] = useState<'approved' | 'changes-requested' | 'pushed-back' | null>(null);

    const { data: detail, isLoading } = useGetGhReportDetailQuery(
        { reportId: reportId as string },
        { skip: !reportId }
    );

    const [approveReport, { isLoading: isApproving }] = useApproveReportMutation();
    const [requestChanges, { isLoading: isRequestingChanges }] = useRequestReportChangesMutation();
    const [pushBackToHod, { isLoading: isPushingBack }] = usePushReportBackToHodMutation();

    const isBusy = isApproving || isRequestingChanges || isPushingBack;

    const reportStatus = (detail?.status ?? status) as string;

    const cpReturnEntry = useMemo(() => {
        if (!detail?.history) return null;
        return [...detail.history]
            .reverse()
            .find(e => e.actorRole === 'CP' && e.action === 'CP_CHANGE_REQUESTED') ?? null;
    }, [detail]);

    const reversedHistory = useMemo(
        () => (detail?.history ? [...detail.history].reverse() : []),
        [detail]
    );

    const handleApprove = () => {
        Alert.alert('Approve Report', 'Approve this report and forward to Campus Pastor?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: async () => {
                    try {
                        await approveReport({
                            reportId: reportId as string,
                            idempotencyKey: uuid(),
                        }).unwrap();
                        setActionDone('approved');
                    } catch (err) {
                        Alert.alert('Error', extractApiError(err, 'Could not approve report. Please try again.'));
                    }
                },
            },
        ]);
    };

    const handleRequestChanges = async (comment: string) => {
        try {
            await requestChanges({
                reportId: reportId as string,
                comment,
                idempotencyKey: uuid(),
            }).unwrap();
            setShowRequestChanges(false);
            setActionDone('changes-requested');
        } catch (err) {
            Alert.alert('Error', extractApiError(err, 'Could not request changes. Please try again.'));
        }
    };

    const handlePushBack = async (comment: string) => {
        try {
            await pushBackToHod({
                reportId: reportId as string,
                comment,
                idempotencyKey: uuid(),
            }).unwrap();
            setShowPushBack(false);
            setActionDone('pushed-back');
        } catch (err) {
            Alert.alert('Error', extractApiError(err, 'Could not push report back. Please try again.'));
        }
    };

    const serviceLabel = serviceName || campus;
    const att = detail?.attendance;

    const renderActionBar = () => {
        if (actionDone === 'approved') {
            return (
                <View className="flex-1 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 items-center justify-center flex-row gap-2">
                    <Ionicons name="checkmark" size={15} color="#16a34a" />
                    <Text className="!text-[13px] font-semibold text-green-700 dark:text-green-400">
                        Forwarded to CP
                    </Text>
                </View>
            );
        }
        if (actionDone === 'changes-requested') {
            return (
                <View className="flex-1 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 items-center justify-center flex-row gap-2">
                    <Ionicons name="create-outline" size={15} color="#d97706" />
                    <Text className="!text-[13px] font-semibold text-yellow-700 dark:text-yellow-400">
                        Changes requested
                    </Text>
                </View>
            );
        }
        if (actionDone === 'pushed-back') {
            return (
                <View className="flex-1 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 items-center justify-center flex-row gap-2">
                    <Ionicons name="arrow-undo-outline" size={15} color="#ef4444" />
                    <Text className="!text-[13px] font-semibold text-red-700 dark:text-red-400">
                        Pushed back to HOD
                    </Text>
                </View>
            );
        }

        if (reportStatus === IReportStatus.HOD_SUBMITTED) {
            return (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isBusy}
                        startIcon={<Ionicons name="create-outline" size={15} color="#71717a" />}
                        onPress={() => setShowRequestChanges(true)}
                    >
                        Request Changes
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        isLoading={isApproving}
                        disabled={isBusy}
                        startIcon={<Ionicons name="checkmark" size={16} color="white" />}
                        onPress={handleApprove}
                    >
                        Approve
                    </Button>
                </>
            );
        }

        if (reportStatus === IReportStatus.CP_CHANGE_REQUESTED) {
            return (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isBusy}
                        startIcon={<Ionicons name="arrow-undo-outline" size={15} color="#71717a" />}
                        onPress={() => setShowPushBack(true)}
                    >
                        Push to HOD
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        isLoading={isApproving}
                        disabled={isBusy}
                        startIcon={<Ionicons name="checkmark" size={16} color="white" />}
                        onPress={handleApprove}
                    >
                        Re-approve
                    </Button>
                </>
            );
        }

        // Terminal / in-flight state — no actions
        const stateChip: Record<string, string> = {
            [IReportStatus.GH_APPROVED]: 'With Campus Pastor',
            [IReportStatus.GH_CHANGE_REQUESTED]: 'Awaiting HOD revision',
            [IReportStatus.CP_APPROVED]: 'With GSP',
            [IReportStatus.GSP_APPROVED]: 'Fully Approved',
            [IReportStatus.GSP_CHANGE_REQUESTED]: 'GSP returned to CP',
        };
        const chipLabel = stateChip[reportStatus];
        if (chipLabel) {
            return (
                <View className="flex-1 h-12 rounded-xl bg-secondary border border-border items-center justify-center">
                    <Text className="!text-[13px] font-semibold text-muted-foreground">{chipLabel}</Text>
                </View>
            );
        }
        return null;
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
                                    firstName={detail?.submittedBy?.firstName}
                                    lastName={detail?.submittedBy?.lastName}
                                    imageUrl={detail?.submittedBy?.pictureUrl ?? AVATAR_FALLBACK_URL}
                                />
                                <View className="flex-1">
                                    <Text className="!text-sm font-semibold text-foreground">
                                        {detail?.submittedBy
                                            ? `${detail.submittedBy.firstName} ${detail.submittedBy.lastName}`
                                            : 'Head of Department'}
                                    </Text>
                                    <Text className="!text-[11px] text-muted-foreground mt-0.5">
                                        Head of Department
                                        {detail?.submittedAt
                                            ? ` · submitted ${dayjs(detail.submittedAt).fromNow()}`
                                            : ''}
                                    </Text>
                                </View>
                                {!isLoading && <ReportStatusPill status={reportStatus} size="sm" />}
                            </View>
                        )}
                    </Card>

                    {/* Attendance */}
                    <Card className="p-4 gap-3">
                        <SectionLabel>Attendance</SectionLabel>
                        {isLoading || !att ? (
                            <View className="gap-2">
                                <View className="flex-row gap-2">
                                    <Skeleton className="flex-1 h-20 rounded-xl" />
                                    <Skeleton className="flex-1 h-20 rounded-xl" />
                                    <Skeleton className="flex-1 h-20 rounded-xl" />
                                </View>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </View>
                        ) : (
                            <>
                                <View className="flex-row gap-2">
                                    <AttendanceStat
                                        label="Present"
                                        value={att.present}
                                        total={att.total}
                                        containerClass="bg-green-100 dark:bg-green-900/20"
                                        textClass="text-green-700 dark:text-green-400"
                                    />
                                    <AttendanceStat
                                        label="Late"
                                        value={att.late}
                                        total={att.total}
                                        containerClass="bg-amber-100 dark:bg-amber-900/20"
                                        textClass="text-amber-700 dark:text-amber-400"
                                    />
                                    <AttendanceStat
                                        label="Absent"
                                        value={att.absent}
                                        total={att.total}
                                        containerClass="bg-red-100 dark:bg-red-900/20"
                                        textClass="text-red-700 dark:text-red-400"
                                    />
                                </View>
                                <View className="h-2 rounded-full overflow-hidden flex-row">
                                    <View className="bg-green-600" style={[styles.bar, { flex: att.present }]} />
                                    <View className="bg-amber-500" style={[styles.bar, { flex: att.late }]} />
                                    <View className="bg-red-600" style={[styles.bar, { flex: att.absent }]} />
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="!text-[10px] text-muted-foreground">0</Text>
                                    <Text className="!text-[11px] text-muted-foreground font-medium">
                                        {att.total} total workforce
                                    </Text>
                                    <Text className="!text-[10px] text-muted-foreground">{att.total}</Text>
                                </View>
                            </>
                        )}
                    </Card>

                    {/* Narrative */}
                    <Card className="p-4 gap-2">
                        <SectionLabel>Report narrative</SectionLabel>
                        {isLoading ? (
                            <View className="gap-1.5">
                                <Skeleton className="h-3.5 w-full rounded" />
                                <Skeleton className="h-3.5 w-full rounded" />
                                <Skeleton className="h-3.5 w-4/5 rounded" />
                            </View>
                        ) : (
                            <Text className="!text-[13px] text-foreground leading-relaxed">
                                {detail?.narrative ?? '—'}
                            </Text>
                        )}
                    </Card>

                    {/* Key highlights */}
                    {(isLoading || (detail?.highlights?.length ?? 0) > 0) && (
                        <Card className="p-4 gap-2.5">
                            <SectionLabel>Key highlights</SectionLabel>
                            {isLoading ? (
                                <View className="gap-2">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-3.5 w-full rounded" />)}
                                </View>
                            ) : (
                                <View className="gap-2">
                                    {detail!.highlights.map((h, i) => (
                                        <View key={i} className="flex-row items-start gap-2.5">
                                            <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <Text className="!text-[13px] text-foreground leading-snug flex-1">{h}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Card>
                    )}

                    {/* Attachments */}
                    {(isLoading || (detail?.attachments?.length ?? 0) > 0) && (
                        <Card className="p-0">
                            <View className="px-4 pt-3.5 pb-2">
                                <SectionLabel>
                                    {`Attachments${detail?.attachments ? ` (${detail.attachments.length})` : ''}`}
                                </SectionLabel>
                            </View>
                            {isLoading ? (
                                <View className="px-4 pb-3 gap-2">
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </View>
                            ) : (
                                detail!.attachments.map((att, i) => (
                                    <View key={i}>
                                        {i > 0 && <Separator />}
                                        <View className="flex-row items-center gap-3 px-4 py-3">
                                            <View className="w-8 h-8 rounded-lg bg-secondary items-center justify-center shrink-0">
                                                <Ionicons name="attach-outline" size={14} color="#8b5cf6" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="!text-[13px] font-medium text-foreground">{att.name}</Text>
                                                <Text className="!text-[11px] text-muted-foreground">{att.size}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </Card>
                    )}

                    {/* Report history */}
                    {!isLoading && (detail?.history?.length ?? 0) > 0 && (
                        <Card className="p-4 gap-3">
                            <View className="flex-row items-center justify-between">
                                <SectionLabel>Approval history</SectionLabel>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={() => setShowHistory(h => !h)}
                                >
                                    {showHistory ? 'Hide' : 'Show all'}
                                </Button>
                            </View>
                            {showHistory && (
                                <View className="gap-0">
                                    {reversedHistory.map((entry, i) => (
                                        <HistoryRow
                                            key={entry._id}
                                            entry={entry}
                                            isLast={i === reversedHistory.length - 1}
                                        />
                                    ))}
                                </View>
                            )}
                        </Card>
                    )}

                    {/* Actions */}
                    <View className="flex-row items-center gap-2 pt-1">
                        {renderActionBar()}
                    </View>
                </View>
            </ScrollView>

            {/* Comment sheets */}
            <ReportCommentSheet
                visible={showRequestChanges}
                title="Request Changes"
                placeholder="Explain what needs to be changed…"
                submitLabel="Request Changes"
                isLoading={isRequestingChanges}
                onClose={() => setShowRequestChanges(false)}
                onSubmit={handleRequestChanges}
            />
            <ReportCommentSheet
                visible={showPushBack}
                title="Push Back to HOD"
                placeholder="Explain why this is being returned to the HOD…"
                submitLabel="Push Back"
                isLoading={isPushingBack}
                onClose={() => setShowPushBack(false)}
                onSubmit={handlePushBack}
            />
        </>
    );
};

export default memo(ApprovalsReportDetail);

const styles = StyleSheet.create({
    bar: { height: '100%' },
});
