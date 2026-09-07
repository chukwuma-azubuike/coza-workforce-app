import { scoreMappingServiceSlice } from '../services/score-mapping';
import { combineReducers } from '@reduxjs/toolkit';
import { attendanceServiceSlice } from '../services/attendance';
import { accountServiceSlice } from '../services/account';
import { complianceServiceSlice } from '../services/compliance';
import { permissionsServiceSlice } from '../services/permissions';
import { servicesServiceSlice } from '../services/services';
import { reportsServiceSlice } from '../services/reports';
import { departmentServiceSlice } from '../services/department';
import { ticketServiceSlice } from '../services/tickets';
import { campusServiceSlice } from '../services/campus';
import { scoreServiceSlice } from '../services/score';
import { roleServiceSlice } from '../services/role';
import { congressServiceSlice } from '../services/congress';
import { groupHeadServiceSlice } from '@store/services/grouphead';
import { groupServiceSlice } from '@store/services/group';
import { uploadServiceSlice } from '@store/services/upload';
import userStateSlice from '../actions/users';
import appStateSlice from '../actions/app';
import notificationsSlice from '../actions/notifications';
import modalSlice from '../actions/modal';
import { roastCrmApi } from '../services/roast-crm';
import { roastEngagementApi } from '../services/roast-engagement';
import roastCRMState from '../actions/roast-crm';
import roastEngagementState from '../actions/roast-engagement';
import { gspDashboardServiceSlice } from '../services/gsp-dashboard';
import { notificationServiceSlice } from '../services/notification';
import gspDashboardStateSlice from '../actions/gsp-dashboard';

const rootReducer = combineReducers({
    [appStateSlice.reducerPath]: appStateSlice.reducer,
    [modalSlice.reducerPath]: modalSlice.reducer,
    [accountServiceSlice.reducerPath]: accountServiceSlice.reducer,
    [attendanceServiceSlice.reducerPath]: attendanceServiceSlice.reducer,
    [complianceServiceSlice.reducerPath]: complianceServiceSlice.reducer,
    [permissionsServiceSlice.reducerPath]: permissionsServiceSlice.reducer,
    [servicesServiceSlice.reducerPath]: servicesServiceSlice.reducer,
    [reportsServiceSlice.reducerPath]: reportsServiceSlice.reducer,
    [departmentServiceSlice.reducerPath]: departmentServiceSlice.reducer,
    [campusServiceSlice.reducerPath]: campusServiceSlice.reducer,
    [ticketServiceSlice.reducerPath]: ticketServiceSlice.reducer,
    [scoreServiceSlice.reducerPath]: scoreServiceSlice.reducer,
    [roleServiceSlice.reducerPath]: roleServiceSlice.reducer,
    [congressServiceSlice.reducerPath]: congressServiceSlice.reducer,
    [scoreMappingServiceSlice.reducerPath]: scoreMappingServiceSlice.reducer,
    [groupHeadServiceSlice.reducerPath]: groupHeadServiceSlice.reducer,
    [groupServiceSlice.reducerPath]: groupServiceSlice.reducer,
    [uploadServiceSlice.reducerPath]: uploadServiceSlice.reducer,
    [userStateSlice.reducerPath]: userStateSlice.reducer,
    [notificationsSlice.reducerPath]: notificationsSlice.reducer,
    [notificationServiceSlice.reducerPath]: notificationServiceSlice.reducer,
    [roastCrmApi.reducerPath]: roastCrmApi.reducer,
    [roastCRMState.reducerPath]: roastCRMState.reducer,
    [roastEngagementApi.reducerPath]: roastEngagementApi.reducer,
    [roastEngagementState.reducerPath]: roastEngagementState.reducer,
    [gspDashboardServiceSlice.reducerPath]: gspDashboardServiceSlice.reducer,
    [gspDashboardStateSlice.reducerPath]: gspDashboardStateSlice.reducer,
});

export default rootReducer;
