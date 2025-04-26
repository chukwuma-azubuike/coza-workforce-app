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
import { uploadServiceSlice } from '@store/services/upload';
import userStateSlice from '../actions/users';
import appStateSlice from '../actions/app';

const rootReducer = combineReducers({
    [appStateSlice.reducerPath]: appStateSlice.reducer,
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
    [uploadServiceSlice.reducerPath]: uploadServiceSlice.reducer,
    [userStateSlice.reducerPath]: userStateSlice.reducer,
});

export default rootReducer;
