import { ITagProps, Tag } from 'native-base';
import React from 'react';
import { IStatus, ITicketStatus, IUserStatus } from '../../../store/types';
import Utils from '../../../utils';

interface IStatusTag extends ITagProps {
    children: IStatus | ITicketStatus | IUserStatus;
}

const StatusTag: React.FC<IStatusTag> = props => {
    const { children: status } = props;

    const green = status === 'ACKNOWLEGDED' || status === 'ACTIVE' || status === 'APPROVED';
    const gray = status === 'PENDING' || status === 'ISSUED' || status === 'DORMANT';
    const red = status === 'DECLINED' || status === 'INACTIVE' || status === 'RETRACTED' || 'REJECTED';

    return (
        <Tag
            {...props}
            size="sm"
            px={2}
            _dark={{
                bgColor: green ? 'success.200' : gray ? 'gray.300' : red ? 'error.200' : 'gray.300',
            }}
            _light={{
                bgColor: green ? 'success.100' : gray ? 'gray.200' : red ? 'error.100' : 'gray.200',
            }}
            _text={{
                _light: {
                    color: green ? 'success.700' : gray ? 'gray.700' : red ? 'error.700' : 'gray.700',
                    fontSize: 'xs',
                },
                _dark: {
                    color: green ? 'success.700' : gray ? 'gray.700' : red ? 'error.700' : 'gray.700',
                    fontSize: 'xs',
                },
            }}
        >
            {Utils.capitalizeFirstChar(status)}
        </Tag>
    );
};

export default StatusTag;
