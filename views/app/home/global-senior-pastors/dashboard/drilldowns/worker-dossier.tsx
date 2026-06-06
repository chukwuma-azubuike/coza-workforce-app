import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import { AlertTriangle, Award, Briefcase, Calendar, CheckCircle, Clock, MapPin, User, XCircle } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import ViewWrapper from '~/components/layout/viewWrapper';
import ErrorBoundary from '@components/composite/error-boundary';
import AvatarComponent from '~/components/atoms/avatar';
import { useGetGspWorkerQuery, IGspWorkerHistoryEntry } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import SegmentedBar from '../components/segmented-bar';
import ContactRow from '../components/contact-row';
import RatePill from '../components/rate-pill';
import CollapsibleSection from '../components/collapsible-section';
import { formatCompactNumber, formatPercent } from '../lib';

const AVATAR_FALLBACK = 'https://ui-avatars.com/api/?background=random&size=256';

/* ── Attendance status colours & icons ─────────────────────────────────────── */
const STATUS_CONFIG: Record<
    IGspWorkerHistoryEntry['status'],
    { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
    present: {
        label: 'Present',
        color: THEME_CONFIG.success,
        bg: 'bg-green-100 dark:bg-green-900/40',
        icon: <CheckCircle size={14} color={THEME_CONFIG.success} />,
    },
    late: {
        label: 'Late',
        color: THEME_CONFIG.warning,
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        icon: <Clock size={14} color={THEME_CONFIG.warning} />,
    },
    absent: {
        label: 'Absent',
        color: THEME_CONFIG.error,
        bg: 'bg-red-100 dark:bg-red-900/40',
        icon: <XCircle size={14} color={THEME_CONFIG.error} />,
    },
    permitted: {
        label: 'Permitted',
        color: THEME_CONFIG.info,
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        icon: <CheckCircle size={14} color={THEME_CONFIG.info} />,
    },
};

const HistoryEntry: React.FC<{ entry: IGspWorkerHistoryEntry; isLast: boolean }> = React.memo(
    ({ entry, isLast }) => {
        const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.absent;
        return (
            <View className="flex-row gap-3">
                {/* Timeline spine */}
                <View className="items-center" style={{ width: 24 }}>
                    <View className={`w-6 h-6 rounded-full ${cfg.bg} items-center justify-center`}>{cfg.icon}</View>
                    {!isLast && <View className="flex-1 w-px bg-border mt-1" />}
                </View>

                {/* Content */}
                <View className={`flex-1 pb-4 gap-0.5 ${isLast ? '' : ''}`}>
                    <Text className="text-sm font-semibold text-foreground">{entry.serviceName}</Text>
                    <Text className="!text-[12px] text-muted-foreground">
                        {dayjs.unix(entry.serviceDate).format('ddd D MMM YYYY')}
                    </Text>
                    <View className={`self-start mt-1 px-2 py-0.5 rounded-full ${cfg.bg}`}>
                        <Text style={{ color: cfg.color }} className="!text-[11px] font-bold">
                            {cfg.label}
                            {entry.clockIn ? ` · in ${entry.clockIn}` : ''}
                            {entry.clockOut ? ` out ${entry.clockOut}` : ''}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
);

HistoryEntry.displayName = 'HistoryEntry';

/* ── Permission / ticket status badge ─────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toLowerCase();
    const bg =
        s === 'approved' || s === 'resolved' || s === 'closed'
            ? 'bg-green-100 dark:bg-green-900/40'
            : s === 'pending'
              ? 'bg-amber-100 dark:bg-amber-900/40'
              : s === 'rejected' || s === 'denied'
                ? 'bg-red-100 dark:bg-red-900/40'
                : 'bg-secondary';
    const textCol =
        s === 'approved' || s === 'resolved' || s === 'closed'
            ? 'text-green-700 dark:text-green-400'
            : s === 'pending'
              ? 'text-amber-700 dark:text-amber-400'
              : s === 'rejected' || s === 'denied'
                ? 'text-red-700 dark:text-red-400'
                : 'text-muted-foreground';

    return (
        <View className={`px-2 py-0.5 rounded-full ${bg}`}>
            <Text className={`!text-[10px] font-bold ${textCol} capitalize`}>{status}</Text>
        </View>
    );
};

/* ── Main screen ────────────────────────────────────────────────────────────── */
const WorkerDossier: React.FC = () => {
    const { userId, startDate, endDate } = useLocalSearchParams<{
        userId: string;
        workerName?: string;
        startDate?: string;
        endDate?: string;
    }>();

    const win = {
        startDate: startDate ? Number(startDate) : undefined,
        endDate: endDate ? Number(endDate) : undefined,
    };

    const { data, isLoading, isError, refetch } = useGetGspWorkerQuery(
        { userId: userId as string, ...win },
        { skip: !userId }
    );

    const w = data?.worker;
    const att = data?.attendance;
    const contact = data?.contact;
    const score = data?.score;

    const isAtRisk = att ? att.summary.rate < 0.5 : false;

    const attendanceSegments = att
        ? [
              { label: 'Present', value: att.summary.present, color: THEME_CONFIG.success },
              { label: 'Late', value: att.summary.late, color: THEME_CONFIG.warning },
              { label: 'Absent', value: att.summary.absent, color: THEME_CONFIG.error },
          ]
        : [];

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="px-4 gap-6 pt-4 pb-10">
                {isLoading ? (
                    <SectionSkeleton rows={12} />
                ) : isError ? (
                    <SectionCard>
                        <SectionError onRetry={refetch} />
                    </SectionCard>
                ) : !w ? (
                    <SectionCard>
                        <SectionEmpty message="Worker not found." />
                    </SectionCard>
                ) : (
                    <ErrorBoundary>
                        {/* ── Profile header ──────────────────────────────────── */}
                        <View className="items-center gap-3">
                            <AvatarComponent
                            alt={w.name}
                                imageUrl={w.photo ?? AVATAR_FALLBACK}
                                className="!w-20 !h-20"
                            />
                            <View className="items-center gap-1">
                                <Text className="text-xl font-bold text-foreground text-center">{w.name}</Text>
                                {w.departments?.primary?.departmentName && (
                                    <Text className="text-sm text-muted-foreground text-center">
                                        {w.departments?.primary?.departmentName}
                                        {w.departments?.secondary?.departmentName
                                            ? ` · ${w.departments?.secondary?.departmentName}`
                                            : ''}
                                    </Text>
                                )}
                                <RatePill rate={att?.summary.rate} />
                            </View>
                        </View>

                        {/* ── At-Risk banner ──────────────────────────────────── */}
                        {isAtRisk && (
                            <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30">
                                <AlertTriangle size={20} color={THEME_CONFIG.error} />
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-red-700 dark:text-red-400">
                                        At Risk
                                    </Text>
                                    <Text className="!text-[12px] text-red-600 dark:text-red-500">
                                        Attendance rate below 50% — pastoral follow-up recommended.
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* ── Contact action row ──────────────────────────────── */}
                        {contact && <ContactRow contact={contact} />}

                        {/* ── Worker profile info ─────────────────────────────── */}
                        <SectionCard className="gap-3">
                            {[
                                { icon: <MapPin size={15} color={THEME_CONFIG.lightGray} />, label: w.campus?.campusName },
                                w.gender && {
                                    icon: <User size={15} color={THEME_CONFIG.lightGray} />,
                                    label: `${w.gender}${w.maritalStatus ? ` · ${w.maritalStatus}` : ''}`,
                                },
                                w.occupation && {
                                    icon: <Briefcase size={15} color={THEME_CONFIG.lightGray} />,
                                    label: w.occupation,
                                },
                                w.memberSince && {
                                    icon: <Calendar size={15} color={THEME_CONFIG.lightGray} />,
                                    label: `Member since ${dayjs(w.memberSince).format('MMM YYYY')}`,
                                },
                            ]
                                .filter(Boolean)
                                .map((item: any, i) => (
                                    <View key={i} className="flex-row items-center gap-2.5">
                                        {item.icon}
                                        <Text className="text-sm text-foreground">{item.label}</Text>
                                    </View>
                                ))}
                        </SectionCard>

                        {/* ── Attendance summary ──────────────────────────────── */}
                        {att && (
                            <SectionCard className="gap-4">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-md font-bold text-foreground">Attendance</Text>
                                    {score && (
                                        <View className="flex-row items-center gap-1.5">
                                            <Award size={14} color={THEME_CONFIG.warning} />
                                            <Text className="!text-[12px] text-muted-foreground">
                                                Score{' '}
                                                <Text className="font-bold text-foreground">
                                                    {score.average.toFixed(1)}
                                                </Text>
                                                {' avg · '}
                                                {score.servicesScored} services
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <SegmentedBar
                                    segments={attendanceSegments}
                                    headline={formatPercent(att.summary.rate, 1)}
                                    headlineCaption={`${formatCompactNumber(att.summary.present + att.summary.late)} of ${formatCompactNumber(att.summary.expected)} expected`}
                                    footnote={
                                        att.summary.permitted
                                            ? `${formatCompactNumber(att.summary.permitted)} on approved permission`
                                            : undefined
                                    }
                                />
                            </SectionCard>
                        )}

                        {/* ── Attendance history timeline ─────────────────────── */}
                        {att && att.history.length > 0 && (
                            <SectionCard className="gap-4">
                                <Text className="text-md font-bold text-foreground">Service history</Text>
                                <View>
                                    {att.history.map((entry, i) => (
                                        <HistoryEntry
                                            key={entry.serviceId}
                                            entry={entry}
                                            isLast={i === att.history.length - 1}
                                        />
                                    ))}
                                </View>
                            </SectionCard>
                        )}

                        {/* ── Permissions (collapsible) ───────────────────────── */}
                        {data.permissions.length > 0 && (
                            <SectionCard>
                                <CollapsibleSection
                                    title="Permissions"
                                    badge={data.permissions.filter(p => p.status.toLowerCase() === 'pending').length}
                                >
                                    <View className="gap-0">
                                        {data.permissions.map((p, i) => (
                                            <React.Fragment key={p.permissionId}>
                                                {i > 0 && <Separator />}
                                                <View className="py-3 gap-1">
                                                    <View className="flex-row items-center justify-between gap-2">
                                                        <Text className="text-sm font-semibold text-foreground flex-1">
                                                            {p.category}
                                                        </Text>
                                                        <StatusBadge status={p.status} />
                                                    </View>
                                                    {!!p.reason && (
                                                        <Text className="text-sm text-muted-foreground line-clamp-none">
                                                            {p.reason}
                                                        </Text>
                                                    )}
                                                    <Text className="!text-[11px] text-muted-foreground">
                                                        {dayjs(p.createdAt).format('D MMM YYYY')}
                                                    </Text>
                                                </View>
                                            </React.Fragment>
                                        ))}
                                    </View>
                                </CollapsibleSection>
                            </SectionCard>
                        )}

                        {/* ── Tickets (collapsible) ───────────────────────────── */}
                        {data.tickets.length > 0 && (
                            <SectionCard>
                                <CollapsibleSection
                                    title="Tickets"
                                    badge={data.tickets.filter(t => t.status.toLowerCase() === 'open').length}
                                >
                                    <View className="gap-0">
                                        {data.tickets.map((t, i) => (
                                            <React.Fragment key={t.ticketId}>
                                                {i > 0 && <Separator />}
                                                <View className="py-3 gap-1">
                                                    <View className="flex-row items-center justify-between gap-2">
                                                        <Text className="text-sm font-semibold text-foreground flex-1">
                                                            {t.category}
                                                        </Text>
                                                        <StatusBadge status={t.status} />
                                                    </View>
                                                    <Text className="!text-[11px] text-muted-foreground">
                                                        {dayjs(t.createdAt).format('D MMM YYYY')}
                                                    </Text>
                                                </View>
                                            </React.Fragment>
                                        ))}
                                    </View>
                                </CollapsibleSection>
                            </SectionCard>
                        )}
                    </ErrorBoundary>
                )}
            </View>
        </ViewWrapper>
    );
};

export default WorkerDossier;
