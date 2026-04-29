import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CountUp } from 'use-count-up';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';

// Mirrors the prototype's PILL_TONES, adapted for dark mode
type AccentTone = 'good' | 'warn' | 'bad' | 'primary';

const accentStyles: Record<AccentTone, { container: string; text: string; dot: string }> = {
    good: {
        container: 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-700 dark:bg-green-400',
    },
    warn: {
        container: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-700 dark:bg-amber-400',
    },
    bad: {
        container: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-700 dark:bg-red-400',
    },
    primary: {
        container: 'bg-secondary border border-border',
        text: 'text-primary',
        dot: 'bg-primary',
    },
};

interface AccentPillProps {
    label: string;
    tone: AccentTone;
}

const AccentPill: React.FC<AccentPillProps> = ({ label, tone }) => {
    const { container, text, dot } = accentStyles[tone];
    return (
        <View className={cn('self-start flex-row items-center gap-1.5 rounded-full h-6 px-2.5', container)}>
            <View className={cn('w-1.5 h-1.5 rounded-full opacity-70', dot)} />
            <Text className={cn('!text-[11px] font-semibold leading-none', text)}>{label}</Text>
        </View>
    );
};

interface GHKpiTileProps {
    value?: number;
    total?: number;
    label: string;
    accent?: string;
    accentTone?: AccentTone;
    isLoading?: boolean;
    onPress?: () => void;
}

const GHKpiTile: React.FC<GHKpiTileProps> = ({
    value,
    total,
    label,
    accent,
    accentTone = 'primary',
    isLoading,
    onPress,
}) => {
    if (isLoading) {
        return <Skeleton className="flex-1 h-28 rounded-2xl" />;
    }

    return (
        <Card className="flex-1 p-1">
            <TouchableOpacity activeOpacity={0.6} onPress={onPress} className="p-3.5 gap-2">
                {/* Label at top — uppercase, small, muted */}
                <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {label}
                </Text>

                {/* Value + optional denominator */}
                <View className="flex-row items-baseline gap-1.5">
                    <Text className="!text-[26px] font-bold text-foreground leading-none">
                        <CountUp isCounting duration={2} end={value ?? 0} />
                    </Text>
                    {total !== undefined && (
                        <Text className="text-muted-foreground font-medium">/{total}</Text>
                    )}
                </View>

                {/* Accent pill with dot */}
                {accent && <AccentPill label={accent} tone={accentTone} />}
            </TouchableOpacity>
        </Card>
    );
};

interface GHKpiGridProps {
    leadersAttendance?: number;
    leaderUsers?: number;
    workersAttendance?: number;
    workerUsers?: number;
    pendingReports?: number;
    totalReports?: number;
    tickets?: number;
    isLoading?: boolean;
}

const GHKpiGrid: React.FC<GHKpiGridProps> = ({
    leadersAttendance,
    leaderUsers,
    workersAttendance,
    workerUsers,
    pendingReports = 0,
    totalReports,
    tickets = 0,
    isLoading,
}) => {
    const leadPct = useMemo(() => leaderUsers ? Math.round(((leadersAttendance ?? 0) / leaderUsers) * 100) : 0, [leaderUsers, leadersAttendance]);
    const wrkPct = useMemo(() => workerUsers ? Math.round(((workersAttendance ?? 0) / workerUsers) * 100) : 0, [workerUsers, workersAttendance]);

    return (
        <View className="gap-4">
            <View className="flex-row gap-4">
                <GHKpiTile
                    value={leadersAttendance}
                    total={leaderUsers}
                    label="Leaders present"
                    accent={leaderUsers ? (leadPct >= 80 ? 'On track' : 'Low') : undefined}
                    accentTone={leadPct >= 80 ? 'good' : 'warn'}
                    isLoading={isLoading}
                    onPress={() => router.push({ pathname: '/attendance', params: { route: 'leadersAttendance' } } as any)}
                />
                <GHKpiTile
                    value={workersAttendance}
                    total={workerUsers}
                    label="Workforce present"
                    isLoading={isLoading}
                    accentTone={wrkPct >= 80 ? 'good' : 'warn'}
                    accent={leaderUsers ? (wrkPct >= 80 ? 'On track' : 'Low') : undefined}
                    onPress={() => router.push({ pathname: '/attendance', params: { route: 'groupAttendance' } } as any)}
                />
            </View>
            <View className="flex-row gap-4">
                <GHKpiTile
                    value={pendingReports}
                    total={totalReports}
                    label="Pending reports"
                    accent={pendingReports > 0 ? 'Awaiting' : pendingReports == 0 ? "No reports" : 'All reviewed'}
                    accentTone={pendingReports > 0 ? 'warn' : 'good'}
                    isLoading={isLoading}
                    onPress={() => router.push('/gh-approvals' as any)}
                />
                <GHKpiTile
                    value={tickets}
                    label="Tickets"
                    isLoading={isLoading}
                    accentTone={tickets > 0 ? 'bad' : 'good'}
                    accent={tickets > 0 ? 'Action needed' : 'All clear'}
                    onPress={() => router.push({ pathname: '/tickets', params: { tab: 'campus' } } as any)}
                />
            </View>
        </View>
    );
};

export { GHKpiTile, GHKpiGrid };
