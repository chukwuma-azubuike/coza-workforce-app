import React, { useMemo } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import KpiTile from '../../components/kpi-tile';

interface CPKpiGridProps {
    leadersAttendance?: number;
    leaderUsers?: number;
    workersAttendance?: number;
    workerUsers?: number;
    pendingReports?: number;
    totalReports?: number;
    tickets?: number;
    isLoading?: boolean;
    approvedCount?: number;
}

const CPKpiGrid: React.FC<CPKpiGridProps> = ({
    leadersAttendance, leaderUsers, workersAttendance, workerUsers,
    pendingReports = 0, totalReports = 0, tickets = 0, isLoading, approvedCount = 0
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
                    onPress={() => router.push({ pathname: '/attendance', params: { route: 'campusAttendance' } } as any)} />
            </View>
            <View className="flex-row gap-4">
                <KpiTile value={pendingReports} total={totalReports} label="Dept. reports"
                    accent={pendingReports > 0 ? 'Need review' : totalReports === 0 ? 'No reports' : totalReports === approvedCount ? 'All reviewed' : 'Ready for review'}
                    accentTone={totalReports !== approvedCount ? 'warn' : 'good'} isLoading={isLoading}
                    onPress={() => router.push('/reports' as any)} />
                <KpiTile value={tickets} label="Tickets" isLoading={isLoading}
                    accentTone={tickets > 0 ? 'bad' : 'good'}
                    accent={tickets > 0 ? 'Some issues' : 'All clear'}
                    onPress={() => router.push({ pathname: '/tickets', params: { tab: 'campus' } } as any)} />
            </View>
        </View>
    );
};

export default React.memo(CPKpiGrid);
