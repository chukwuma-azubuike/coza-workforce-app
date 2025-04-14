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
import { cgwcServiceSlice } from '../cgwc';
import { scoreMappingServiceSlice } from '../score-mapping';
import { groupHeadServiceSlice } from '../grouphead';
import { uploadServiceSlice } from '../upload';
import { dismissModalListenerMiddleware } from '~/store/listener-middleware/app';
import { Middleware } from '@reduxjs/toolkit';

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
    cgwcServiceSlice.middleware,
    scoreMappingServiceSlice.middleware,
    groupHeadServiceSlice.middleware,
    uploadServiceSlice.middleware,
    dismissModalListenerMiddleware.middleware,
];

export default middlewaresSlices;
