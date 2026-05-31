import React from 'react';
import StatusTag from '@components/atoms/status-tag';
import { getReportStatusMeta } from '@constants/report-status';

interface ReportStatusPillProps {
    status: string;
    size?: 'sm' | 'md';
}

const ReportStatusPill: React.FC<ReportStatusPillProps> = ({ status, size = 'sm' }) => {
    const meta = getReportStatusMeta(status);

    return (
        <StatusTag size={size} label={meta.label}>
            {status}
        </StatusTag>
    );
};

export default ReportStatusPill;
