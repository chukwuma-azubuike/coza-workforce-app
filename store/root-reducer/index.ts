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
import { cgwcServiceSlice } from '../services/cgwc';
import { groupHeadServiceSlice } from '@store/services/grouphead';
import { uploadServiceSlice } from '@store/services/upload';
import userStateSlice from '../actions/users';

const rootReducer = combineReducers({
    account: accountServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    permissions: permissionsServiceSlice.reducer,
    service: servicesServiceSlice.reducer,
    report: reportsServiceSlice.reducer,
    department: departmentServiceSlice.reducer,
    campus: campusServiceSlice.reducer,
    ticket: ticketServiceSlice.reducer,
    score: scoreServiceSlice.reducer,
    role: roleServiceSlice.reducer,
    cgwc: cgwcServiceSlice.reducer,
    scoreMapping: scoreMappingServiceSlice.reducer,
    [groupHeadServiceSlice.reducerPath]: groupHeadServiceSlice.reducer,
    [uploadServiceSlice.reducerPath]: uploadServiceSlice.reducer,
    [userStateSlice.reducerPath]: userStateSlice.reducer,
});

export default rootReducer;
