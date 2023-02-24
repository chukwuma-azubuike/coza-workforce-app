import { ITagProps, Tag } from 'native-base';
import React from 'react';
import { IStatus, ITicketStatus } from '../../../store/types';
import Utils from '../../../utils';

interface IStatusTag extends ITagProps {
    children: IStatus | ITicketStatus;
}

const StatusTag: React.FC<IStatusTag> = props => {
    const { children: status } = props;

    return (
        <Tag
            {...props}
            size="sm"
            px={2}
            bgColor={
                status === 'APPROVED'
                    ? 'success.100'
                    : status === 'PENDING'
                    ? 'gray.200'
                    : status === 'DECLINED'
                    ? 'error.100'
                    : 'gray.200'
            }
            _text={{
                _light: {
                    color:
                        status === 'APPROVED'
                            ? 'success.600'
                            : status === 'PENDING'
                            ? 'gray.600'
                            : status === 'DECLINED'
                            ? 'error.600'
                            : 'gray.600',
                    fontSize: 'xs',
                },
                _dark: {
                    color:
                        status === 'APPROVED'
                            ? 'success.600'
                            : status === 'PENDING'
                            ? 'gray.600'
                            : status === 'DECLINED'
                            ? 'error.600'
                            : 'gray.600',
                    fontSize: 'xs',
                },
            }}
        >
            {Utils.capitalizeFirstChar(status)}
        </Tag>
    );
};

export default StatusTag;
