import React from 'react';
import { IReportStatus, IStatus, ITicketStatus, IUserStatus } from '@store/types';
import Utils from '@utils/index';
import { Badge, BadgeProps } from '~/components/ui/badge';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { View } from 'react-native';
import { Skeleton } from '~/components/ui/skeleton';

interface IStatusTag extends BadgeProps {
    capitalise?: boolean;
    children?: IStatus | ITicketStatus | IUserStatus | IReportStatus;
    colorScheme?: 'default' | 'dark';
    isLoading?: boolean;
}

const StatusTag: React.FC<IStatusTag> = props => {
    const { children: status, capitalise = true, colorScheme = 'default', className, isLoading } = props;

    const green =
        status === 'ACKNOWLEGDED' ||
        status === 'ACTIVE' ||
        status === 'APPROVED' ||
        status === IReportStatus.GSP_SUBMITTED;
    const gray = status === 'PENDING' || status === 'ISSUED' || status === 'DORMANT';
    const amber = status === 'REVIEW_REQUESTED' || status === 'RETRACTED';
    const red =
        status === 'DECLINED' ||
        status === 'INACTIVE' ||
        status === 'REJECTED' ||
        status === 'CONTESTED' ||
        status === 'UNAPPROVED';
    const blue = status === 'SUBMITTED' || 'HOD' || 'AHOD';

    const darkColorScheme = {
        green: { bg: 'bg-green-700', text: 'text-white font-medium' },
        gray: { bg: 'bg-gray-700', text: 'text-white font-medium' },
        amber: { bg: 'bg-amber-700', text: 'text-white font-medium' },
        red: { bg: 'bg-red-700', text: 'text-white font-medium' },
        blue: { bg: 'bg-blue-700', text: 'text-white font-medium' },
    };

    const lightColorScheme = {
        green: { bg: 'bg-green-100', text: 'text-green-700' },
        gray: { bg: 'bg-gray-300', text: 'text-gray-900' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
        red: { bg: 'bg-red-100', text: 'text-red-700' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
    };

    const getColors = (color: 'green' | 'gray' | 'amber' | 'red' | 'blue') => {
        if (colorScheme === 'dark') {
            return darkColorScheme[color];
        }
        return lightColorScheme[color];
    };

    if (isLoading) {
        return <Skeleton className="w-24 h-8" />;
    }

    return (
        <View>
            <Badge
                className={cn(
                    blue && getColors('blue').bg,
                    green && getColors('green').bg,
                    gray && getColors('gray').bg,
                    amber && getColors('amber').bg,
                    red && getColors('red').bg,
                    className
                )}
            >
                <Text
                    className={cn(
                        'text-sm font-normal',
                        blue && getColors('blue').text,
                        green && getColors('green').text,
                        gray && getColors('gray').text,
                        amber && getColors('amber').text,
                        red && getColors('red').text,
                        className
                    )}
                >
                    {status
                        ? capitalise
                            ? Utils.capitalizeFirstChar(status.replace('Gsp ', ''), '_')
                            : status
                        : 'Unknown'}
                </Text>
            </Badge>
        </View>
    );
};

export default React.memo(StatusTag);
