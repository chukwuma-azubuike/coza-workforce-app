import { ITagProps, Tag } from 'native-base';
import React from 'react';
import { IReportStatus, IStatus, ITicketStatus, IUserStatus } from '@store/types';
import Utils from '@utils/index';

interface IStatusTag extends ITagProps {
    children?: IStatus | ITicketStatus | IUserStatus | IReportStatus;
}

const StatusTag: React.FC<IStatusTag> = props => {
    const { children: status } = props;

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
        <Tag
            {...props}
            size="sm"
            px={2}
            borderRadius="lg"
            _dark={{
                bgColor: green
                    ? 'success.200'
                    : gray
                    ? 'gray.300'
                    : red
                    ? 'error.200'
                    : amber
                    ? 'amber.100'
                    : blue
                    ? 'blue.100'
                    : 'gray.300',
            }}
            _light={{
                bgColor: green
                    ? 'success.100'
                    : gray
                    ? 'gray.200'
                    : red
                    ? 'error.100'
                    : amber
                    ? 'amber.100'
                    : blue
                    ? 'blue.100'
                    : 'gray.200',
            }}
            _text={{
                _light: {
                    color: green
                        ? 'success.700'
                        : gray
                        ? 'gray.700'
                        : red
                        ? 'error.700'
                        : amber
                        ? 'amber.700'
                        : blue
                        ? 'blue.700'
                        : 'gray.700',
                    fontSize: 'xs',
                },
                _dark: {
                    color: green
                        ? 'success.700'
                        : gray
                        ? 'gray.700'
                        : red
                        ? 'error.700'
                        : amber
                        ? 'amber.700'
                        : blue
                        ? 'blue.700'
                        : 'gray.700',
                    fontSize: 'xs',
                },
            }}
        >
            {status ? Utils.capitalizeFirstChar(status.replace('Gsp ', ''), '_') : 'Unknown'}
        </Tag>
    );
};

export default React.memo(StatusTag);
