import React from 'react';
import { IReportStatus, IStatus, ITicketStatus, IUserStatus } from '@store/types';
import Utils from '@utils/index';
import { Badge } from '~/components/ui/badge';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface IStatusTag {
    capitalise?: boolean;
    children?: IStatus | ITicketStatus | IUserStatus | IReportStatus;
}

const StatusTag: React.FC<IStatusTag> = props => {
    const { children: status, capitalise = true } = props;

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

    return (
        <Badge
            className={cn(
                green && 'bg-green-200',
                gray && 'bg-gray-200',
                amber && 'bg-amber-200',
                red && 'bg-red-200',
                blue && 'bg-blue-200'
            )}
        >
            <Text
                className={cn(
                    green && 'bg-green-700',
                    gray && 'bg-gray-700',
                    amber && 'bg-amber-700',
                    red && 'bg-red-700',
                    blue && 'bg-blue-700'
                )}
            >
                {status
                    ? capitalise
                        ? Utils.capitalizeFirstChar(status.replace('Gsp ', ''), '_')
                        : status
                    : 'Unknown'}
            </Text>
        </Badge>
    );
};

export default React.memo(StatusTag);
