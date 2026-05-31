import React from 'react';
import { StyleSheet } from 'react-native';
import { IReportStatus, IStatus, ITicketStatus, IUserStatus } from '@store/types';
import Utils from '@utils/index';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { View } from 'react-native';
import { Skeleton } from '~/components/ui/skeleton';

interface IStatusTag {
    capitalise?: boolean;
    children?: IStatus | ITicketStatus | IUserStatus | IReportStatus | string;
    isLoading?: boolean;
    className?: string;
    size?: 'sm' | 'md';
    /** Overrides the displayed text while still resolving colour from `children`. */
    label?: string;
}

type StatusColor = 'green' | 'yellow' | 'blue' | 'gray' | 'red';

const STATUS_COLOR_MAP: Record<StatusColor, { container: string; text: string }> = {
    green: { container: 'bg-green-500/20 border-green-500/40', text: 'text-green-500' },
    yellow: { container: 'bg-yellow-500/20 border-yellow-500/40', text: 'text-yellow-500' },
    blue: { container: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-500' },
    gray: { container: 'bg-gray-500/20 border-gray-500/40', text: 'text-gray-400' },
    red: { container: 'bg-red-500/20 border-red-500/40', text: 'text-red-500' },
};

const resolveColor = (status: string | undefined): StatusColor => {
    switch (status) {
        case 'ACTIVE':
        case 'APPROVED':
        case 'ACKNOWLEDGED':
        case 'ACKNOWLEGDED':
        case IReportStatus.GH_APPROVED:
        case IReportStatus.CP_APPROVED:
        case IReportStatus.GSP_APPROVED:
        case IReportStatus.GSP_SUBMITTED:
        case "Attended":
            return 'green';

        case 'INACTIVE':
        case 'RETRACTED':
        case 'REVIEW_REQUESTED':
        case IReportStatus.GH_CHANGE_REQUESTED:
        case IReportStatus.CP_CHANGE_REQUESTED:
        case IReportStatus.GSP_CHANGE_REQUESTED:
        case 'LATE':
            return 'yellow';

        case 'SUBMITTED':
        case 'ISSUED':
        case 'HOD':
        case 'AHOD':
        case IReportStatus.HOD_SUBMITTED:
        case 'ABSENT_WITH_PERMISSION':
            return 'blue';

        case 'DECLINED':
        case 'REJECTED':
        case 'CONTESTED':
        case 'UNAPPROVED':
        case 'BLACKLISTED':
        case 'Absent':
            return 'red';

        case 'PENDING':
        case 'DORMANT':
        case 'DRAFT':
        default:
            return 'gray';
    }
};

const StatusTag: React.FC<IStatusTag> = ({
    children: status,
    capitalise = true,
    className,
    isLoading,
    size = 'md',
    label,
}) => {
    const isSm = size === 'sm';

    if (isLoading) {
        return <Skeleton className={isSm ? 'w-16 h-5' : 'w-20 h-6'} />;
    }

    const color = resolveColor(status as string | undefined);
    const { container, text } = STATUS_COLOR_MAP[color];

    return (
        <View style={[styles.badge, isSm && styles.badgeSm]} className={cn('border', container, className)}>
            <Text style={[styles.label, isSm && styles.labelSm]} className={cn(text)}>
                {label ??
                    (status
                        ? capitalise
                            ? Utils.capitalizeFirstChar(String(status).replace('Gsp ', ''), '_')
                            : String(status)
                        : 'Unknown')}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 10,
    },
    badgeSm: {
        paddingHorizontal: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    labelSm: {
        fontSize: 10,
    },
});

export default React.memo(StatusTag);
