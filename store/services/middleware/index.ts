import { scoreServiceSlice } from '../score';
import { accountServiceSlice } from '../account';
import { attendanceServiceSlice } from '../attendance';
import { complianceServiceSlice } from '../compliance';
import { reportsServiceSlice } from '../reports';
import { servicesServiceSlice } from '../services';
import { permissionsServiceSlice } from '../permissions';
import { departmentServiceSlice } from '../department';
import { ticketServiceSlice } from '../tickets';
import { campusServiceSlice } from '../campus';
import { roleServiceSlice } from '../role';
import { congressServiceSlice } from '../congress';
import { scoreMappingServiceSlice } from '../score-mapping';
import { groupHeadServiceSlice } from '../grouphead';
import { groupServiceSlice } from '../group';
import { uploadServiceSlice } from '../upload';
import { modalListenerMiddleware } from '~/store/listener-middleware/modal';
import { Middleware } from '@reduxjs/toolkit';
import { roastCrmApi } from '../roast-crm';
import { roastEngagementApi } from '../roast-engagement';
import { gspDashboardServiceSlice } from '../gsp-dashboard';
import { notificationServiceSlice } from '../notification';

const middlewaresSlices: Array<Middleware> = [
    accountServiceSlice.middleware,
    attendanceServiceSlice.middleware,
    complianceServiceSlice.middleware,
    permissionsServiceSlice.middleware,
    servicesServiceSlice.middleware,
    reportsServiceSlice.middleware,
    departmentServiceSlice.middleware,
    ticketServiceSlice.middleware,
    campusServiceSlice.middleware,
    scoreServiceSlice.middleware,
    roleServiceSlice.middleware,
    congressServiceSlice.middleware,
    scoreMappingServiceSlice.middleware,
    groupHeadServiceSlice.middleware,
    groupServiceSlice.middleware,
    uploadServiceSlice.middleware,
    modalListenerMiddleware.middleware,
    roastCrmApi.middleware,
    roastEngagementApi.middleware,
    gspDashboardServiceSlice.middleware,
    notificationServiceSlice.middleware,
];

export default middlewaresSlices;
