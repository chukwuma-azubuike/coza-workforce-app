import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { IReportStatus } from '@store/types';
import { THEME_CONFIG } from '@config/appConfig';

interface CompletenessFunnelProps {
    byStatus?: Partial<Record<IReportStatus, number>>;
}

/** Report status pipeline in approval order, with a human label + stage colour. */
const PIPELINE: { status: IReportStatus; label: string; color: string }[] = [
    { status: IReportStatus.HOD_SUBMITTED, label: 'HOD submitted', color: THEME_CONFIG.lightGray },
    { status: IReportStatus.GH_APPROVED, label: 'Group Head approved', color: THEME_CONFIG.info },
    { status: IReportStatus.CP_APPROVED, label: 'Campus Pastor approved', color: THEME_CONFIG.primaryLight },
    { status: IReportStatus.GSP_APPROVED, label: 'GSP approved (final)', color: THEME_CONFIG.success },
];

/**
 * Approval funnel across the report pipeline
 * (HOD → Group Head → Campus Pastor → GSP). Bars are scaled to the widest stage
 * so the drop-off at each gate is visible at a glance.
 */
const CompletenessFunnel: React.FC<CompletenessFunnelProps> = ({ byStatus }) => {
    const rows = PIPELINE.map(p => ({ ...p, count: byStatus?.[p.status] ?? 0 }));
    const max = Math.max(1, ...rows.map(r => r.count));

    return (
        <View className="gap-3">
            {rows.map(r => {
                const pct = Math.max(0.03, r.count / max);
                return (
                    <View key={r.status} className="gap-1.5">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-medium text-foreground">{r.label}</Text>
                            <Text className="text-md font-bold text-foreground">{r.count.toLocaleString()}</Text>
                        </View>
                        <View className="h-2.5 rounded-full bg-secondary overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{ width: `${pct * 100}%`, backgroundColor: r.color }}
                            />
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export default React.memo(CompletenessFunnel);
