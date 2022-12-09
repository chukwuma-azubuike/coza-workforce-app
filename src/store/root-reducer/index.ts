import { combineReducers } from '@reduxjs/toolkit';
import { attendanceServiceSlice } from '../services/attendance';
import { authServiceSlice } from '../services/auth';
import { complianceServiceSlice } from '../services/compliance';
import { permissionsServiceSlice } from '../services/permissions';
import { servicesServiceSlice } from '../services/services';

const rootReducer = combineReducers({
    auth: authServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    permissions: permissionsServiceSlice.reducer,
    services: servicesServiceSlice.reducer,
    // reports: '',
    // users: '',
});

export default rootReducer;
