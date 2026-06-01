import React from 'react';
import StatusTag from '@components/atoms/status-tag';
import { getRoleAwareStatusMeta, getReportStatusMeta } from '@constants/report-status';
import type { LogicalRole } from '@constants/report-actions';

interface ReportStatusPillProps {
    status: string;
    size?: 'sm' | 'md';
    /** When provided, labels and colour tone are contextualised for this role. */
    role?: LogicalRole | null;
}

const ReportStatusPill: React.FC<ReportStatusPillProps> = ({ status, size = 'sm', role }) => {
    const meta = role ? getRoleAwareStatusMeta(status, role) : getReportStatusMeta(status);

    return (

        <StatusTag size={size} label={meta.label}>
            {status}
        </StatusTag>
    );
};

export default ReportStatusPill;
