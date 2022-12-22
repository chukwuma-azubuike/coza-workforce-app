import { combineReducers } from '@reduxjs/toolkit';
import { attendanceServiceSlice } from '../services/attendance';
import { accountServiceSlice } from '../services/account';
import { complianceServiceSlice } from '../services/compliance';
import { permissionsServiceSlice } from '../services/permissions';
import { servicesServiceSlice } from '../services/services';
import { reportsServiceSlice } from '../services/reports';

const rootReducer = combineReducers({
    account: accountServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    permissions: permissionsServiceSlice.reducer,
    service: servicesServiceSlice.reducer,
    report: reportsServiceSlice.reducer,
    // users: '',
});

export default rootReducer;
