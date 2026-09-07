import React from 'react';
import CampusReport from '~/views/app/reports/campus-report/reportDetails';

/**
 * GSP review of a single campus's full report for a service. Reuses the elevated,
 * role-aware campus report screen (the same one Campus Pastors use): per-department
 * report cards via ReportDataView + the CP's "For the GSP's attention" note.
 * It reads serviceId/campusId/campusName from the route params the inbox passes.
 */
const GSPCampusReviewScreen: React.FC = () => <CampusReport />;

export default GSPCampusReviewScreen;
