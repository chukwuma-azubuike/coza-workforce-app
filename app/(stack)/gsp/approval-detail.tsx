import React from 'react';
import ApprovalsReportDetail from '~/views/app/gh-approvals/approvals-report-detail';

/**
 * GSP report review/approval detail. Reuses the shared, role-aware approvals
 * detail view — for a GSP it renders the "Approve (final) / Request changes"
 * actions for CP_APPROVED reports and posts the appropriate transition.
 */
const GSPApprovalDetailScreen: React.FC = () => <ApprovalsReportDetail />;

export default GSPApprovalDetailScreen;
