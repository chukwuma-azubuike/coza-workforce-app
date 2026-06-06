import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import {
    AlertTriangle,
    Award,
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    User,
    XCircle,
} from 'lucide-react-native';
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
import { formatCompactNumber, formatPercent } from '../lib';
import { cn } from '~/lib/utils';

const AVATAR_FALLBACK = 'https://ui-avatars.com/api/?background=random&size=256';

type DossierTab = 'attendance' | 'history' | 'permissions' | 'tickets';

const TABS: { value: DossierTab; label: string }[] = [
    { value: 'attendance', label: 'Attendance' },
    { value: 'history', label: 'History' },
    { value: 'permissions', label: 'Permissions' },
    { value: 'tickets', label: 'Tickets' },
];

/* ── Status config ─────────────────────────────────────────────────────────── */
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

/* ── Sub-components ────────────────────────────────────────────────────────── */
const HistoryEntry: React.FC<{ entry: IGspWorkerHistoryEntry; isLast: boolean }> = React.memo(({ entry, isLast }) => {
    const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.absent;
    return (
        <View className="flex-row gap-3">
            <View className="items-center" style={{ width: 24 }}>
                <View className={`w-6 h-6 rounded-full ${cfg.bg} items-center justify-center`}>{cfg.icon}</View>
                {!isLast && <View className="flex-1 w-px bg-border mt-1" />}
            </View>
            <View className="flex-1 pb-4 gap-0.5">
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
});
HistoryEntry.displayName = 'HistoryEntry';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toLowerCase();
    const isGood = s === 'approved' || s === 'resolved' || s === 'closed';
    const isPending = s === 'pending';
    const isBad = s === 'rejected' || s === 'denied';
    return (
        <View
            className={cn(
                'px-2 py-0.5 rounded-full',
                isGood && 'bg-green-100 dark:bg-green-900/40',
                isPending && 'bg-amber-100 dark:bg-amber-900/40',
                isBad && 'bg-red-100 dark:bg-red-900/40',
                !isGood && !isPending && !isBad && 'bg-secondary'
            )}
        >
            <Text
                className={cn(
                    '!text-[10px] font-bold capitalize',
                    isGood && 'text-green-700 dark:text-green-400',
                    isPending && 'text-amber-700 dark:text-amber-400',
                    isBad && 'text-red-700 dark:text-red-400',
                    !isGood && !isPending && !isBad && 'text-muted-foreground'
                )}
            >
                {status}
            </Text>
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

    const [activeTab, setActiveTab] = React.useState<DossierTab>('attendance');

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

    const isAtRisk = (att?.summary?.rate ?? 1) < 0.5;

    const attendanceSegments = att?.summary
        ? [
              { label: 'Present', value: att.summary.present ?? 0, color: THEME_CONFIG.success },
              { label: 'Late', value: att.summary.late ?? 0, color: THEME_CONFIG.warning },
              { label: 'Absent', value: att.summary.absent ?? 0, color: THEME_CONFIG.error },
          ]
        : [];

    const pendingPermissions = (data?.permissions ?? []).filter(p => p.status.toLowerCase() === 'pending').length;
    const openTickets = (data?.tickets ?? []).filter(t => t.status.toLowerCase() === 'open').length;

    const tabBadge: Partial<Record<DossierTab, number>> = {
        permissions: pendingPermissions || undefined,
        tickets: openTickets || undefined,
    };

    return (
        <ViewWrapper scroll noPadding refreshing={false} onRefresh={refetch} className="flex-1">
            <View className="pb-10">
                {isLoading ? (
                    <View className="px-4 pt-4">
                        <SectionSkeleton rows={12} />
                    </View>
                ) : isError ? (
                    <View className="px-4 pt-4">
                        <SectionCard>
                            <SectionError onRetry={refetch} />
                        </SectionCard>
                    </View>
                ) : !w ? (
                    <View className="px-4 pt-4">
                        <SectionCard>
                            <SectionEmpty message="Worker not found." />
                        </SectionCard>
                    </View>
                ) : (
                    <ErrorBoundary>
                        {/* ── Sticky header region (profile + contact + info) ──── */}
                        <View className="px-4 pt-4 gap-4">
                            {/* Profile */}
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
                                            {w.departments.primary.departmentName}
                                            {w.departments.secondary?.departmentName
                                                ? ` · ${w.departments.secondary.departmentName}`
                                                : ''}
                                        </Text>
                                    )}
                                    <RatePill rate={att?.summary?.rate} />
                                </View>
                            </View>

                            {/* At-Risk banner */}
                            {isAtRisk && (
                                <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30">
                                    <AlertTriangle size={20} color={THEME_CONFIG.error} />
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-red-700 dark:text-red-400">At Risk</Text>
                                        <Text className="!text-[12px] text-red-600 dark:text-red-500">
                                            Attendance rate below 50% — pastoral follow-up recommended.
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Contact row */}
                            {contact && <ContactRow contact={contact} />}

                            {/* Profile info */}
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
                        </View>

                        {/* ── Pill tab bar ─────────────────────────────────────── */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 8 }}
                        >
                            {TABS.map(tab => {
                                const active = tab.value === activeTab;
                                const badge = tabBadge[tab.value];
                                return (
                                    <TouchableOpacity
                                        key={tab.value}
                                        activeOpacity={0.7}
                                        onPress={() => setActiveTab(tab.value)}
                                        className={cn(
                                            'flex-row items-center gap-1.5 h-9 px-4 rounded-full border',
                                            active
                                                ? 'bg-primary border-primary'
                                                : 'bg-background border-border'
                                        )}
                                    >
                                        <Text
                                            className={cn(
                                                '!text-[13px] font-semibold',
                                                active ? 'text-white' : 'text-foreground'
                                            )}
                                        >
                                            {tab.label}
                                        </Text>
                                        {!!badge && (
                                            <View
                                                className={cn(
                                                    'w-5 h-5 rounded-full items-center justify-center',
                                                    active ? 'bg-white/25' : 'bg-primary/10'
                                                )}
                                            >
                                                <Text
                                                    className={cn(
                                                        '!text-[10px] font-bold',
                                                        active ? 'text-white' : 'text-primary'
                                                    )}
                                                >
                                                    {badge}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* ── Tab content ──────────────────────────────────────── */}
                        <View className="px-4 gap-4">
                            {/* ATTENDANCE */}
                            {activeTab === 'attendance' && att?.summary && (
                                <SectionCard className="gap-4">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-md font-bold text-foreground">Attendance summary</Text>
                                        {score && (
                                            <View className="flex-row items-center gap-1.5">
                                                <Award size={14} color={THEME_CONFIG.warning} />
                                                <Text className="!text-[12px] text-muted-foreground">
                                                    Score{' '}
                                                    <Text className="font-bold text-foreground">
                                                        {score.average.toFixed(1)}
                                                    </Text>
                                                    {' avg'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <SegmentedBar
                                        segments={attendanceSegments}
                                        headline={formatPercent(att.summary.rate, 1)}
                                        headlineCaption={`${formatCompactNumber((att.summary.present ?? 0) + (att.summary.late ?? 0))} of ${formatCompactNumber(att.summary.expected ?? 0)} expected`}
                                        footnote={
                                            att.summary.permitted
                                                ? `${formatCompactNumber(att.summary.permitted)} on approved permission`
                                                : undefined
                                        }
                                    />
                                    {score && (
                                        <View className="flex-row items-center gap-4 pt-1">
                                            <View className="flex-1 items-center gap-0.5 p-3 rounded-xl bg-secondary">
                                                <Text className="text-lg font-bold text-foreground">
                                                    {score.total}
                                                </Text>
                                                <Text className="!text-[11px] text-muted-foreground">Total score</Text>
                                            </View>
                                            <View className="flex-1 items-center gap-0.5 p-3 rounded-xl bg-secondary">
                                                <Text className="text-lg font-bold text-foreground">
                                                    {score.average.toFixed(1)}
                                                </Text>
                                                <Text className="!text-[11px] text-muted-foreground">Avg / service</Text>
                                            </View>
                                            <View className="flex-1 items-center gap-0.5 p-3 rounded-xl bg-secondary">
                                                <Text className="text-lg font-bold text-foreground">
                                                    {score.servicesScored}
                                                </Text>
                                                <Text className="!text-[11px] text-muted-foreground">Services</Text>
                                            </View>
                                        </View>
                                    )}
                                </SectionCard>
                            )}

                            {activeTab === 'attendance' && !att?.summary && (
                                <SectionCard>
                                    <SectionEmpty message="No attendance data for this period." />
                                </SectionCard>
                            )}

                            {/* HISTORY */}
                            {activeTab === 'history' && (
                                <SectionCard className="gap-4">
                                    <Text className="text-md font-bold text-foreground">Service history</Text>
                                    {att?.history?.length ? (
                                        <View>
                                            {att.history.map((entry, i) => (
                                                <HistoryEntry
                                                    key={entry.serviceId}
                                                    entry={entry}
                                                    isLast={i === att.history.length - 1}
                                                />
                                            ))}
                                        </View>
                                    ) : (
                                        <SectionEmpty message="No service history for this period." />
                                    )}
                                </SectionCard>
                            )}

                            {/* PERMISSIONS */}
                            {activeTab === 'permissions' && (
                                <SectionCard>
                                    {data.permissions.length ? (
                                        <View className="gap-0">
                                            {data.permissions.map((p, i) => (
                                                <React.Fragment key={p.permissionId}>
                                                    {i > 0 && <Separator />}
                                                    <View className="py-3 gap-1.5">
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
                                    ) : (
                                        <SectionEmpty message="No permissions in this window." />
                                    )}
                                </SectionCard>
                            )}

                            {/* TICKETS */}
                            {activeTab === 'tickets' && (
                                <SectionCard>
                                    {data.tickets.length ? (
                                        <View className="gap-0">
                                            {data.tickets.map((t, i) => (
                                                <React.Fragment key={t.ticketId}>
                                                    {i > 0 && <Separator />}
                                                    <View className="py-3 gap-1.5">
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
                                    ) : (
                                        <SectionEmpty message="No tickets on record." />
                                    )}
                                </SectionCard>
                            )}
                        </View>
                    </ErrorBoundary>
                )}
            </View>
        </ViewWrapper>
    );
};

export default WorkerDossier;
