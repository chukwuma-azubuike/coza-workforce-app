import React, { useMemo } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import KpiTile from '../components/kpi-tile';
export { default as GHKpiTile } from '../components/kpi-tile';

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
    leadersAttendance, leaderUsers, workersAttendance, workerUsers,
    pendingReports = 0, totalReports, tickets = 0, isLoading,
}) => {
    const leadPct = useMemo(() => leaderUsers ? Math.round(((leadersAttendance ?? 0) / leaderUsers) * 100) : 0, [leaderUsers, leadersAttendance]);
    const wrkPct = useMemo(() => workerUsers ? Math.round(((workersAttendance ?? 0) / workerUsers) * 100) : 0, [workerUsers, workersAttendance]);

    return (
        <View className="gap-4">
            <View className="flex-row gap-4">
                <KpiTile value={leadersAttendance} total={leaderUsers} label="Leaders present"
                    accent={leaderUsers ? (leadPct >= 80 ? 'On track' : 'Low') : undefined}
                    accentTone={leadPct >= 80 ? 'good' : 'warn'} isLoading={isLoading}
                    onPress={() => router.push({ pathname: '/attendance', params: { route: 'leadersAttendance' } } as any)} />
                <KpiTile value={workersAttendance} total={workerUsers} label="Workforce present"
                    isLoading={isLoading} accentTone={wrkPct >= 80 ? 'good' : 'warn'}
                    accent={leaderUsers ? (wrkPct >= 80 ? 'On track' : 'Low') : undefined}
                    onPress={() => router.push({ pathname: '/attendance', params: { route: 'groupAttendance' } } as any)} />
            </View>
            <View className="flex-row gap-4">
                <KpiTile value={pendingReports} total={totalReports} label="Pending reports"
                    accent={pendingReports > 0 ? 'Awaiting' : totalReports === 0 ? 'No reports' : 'All reviewed'}
                    accentTone={pendingReports > 0 ? 'warn' : 'good'} isLoading={isLoading}
                    onPress={() => router.push('/gh-approvals' as any)} />
                <KpiTile value={tickets} label="Tickets" isLoading={isLoading}
                    accentTone={tickets > 0 ? 'bad' : 'good'}
                    accent={tickets > 0 ? 'Action needed' : 'All clear'}
                    onPress={() => router.push({ pathname: '/tickets', params: { tab: 'campus' } } as any)} />
            </View>
        </View>
    );
};

export { GHKpiGrid };
