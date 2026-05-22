import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { getReportStatusMeta } from '@constants/report-status';

interface ReportStatusPillProps {
    status: string;
    size?: 'sm' | 'md';
}

const ReportStatusPill: React.FC<ReportStatusPillProps> = ({ status, size = 'sm' }) => {
    const meta = getReportStatusMeta(status);
    const isSm = size === 'sm';

    return (
        <View
            className={cn(
                'flex-row items-center gap-1.5 rounded-full px-2',
                isSm ? 'h-5' : 'h-6 px-2.5',
                meta.containerClass
            )}
        >
            <View className={cn('rounded-full', isSm ? 'w-1.5 h-1.5' : 'w-2 h-2', meta.dotClass)} />
            <Text className={cn('font-semibold', isSm ? '!text-[10px]' : '!text-xs', meta.textClass)}>
                {meta.label}
            </Text>
        </View>
    );
};

export default ReportStatusPill;
