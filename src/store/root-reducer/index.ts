import { attendanceServiceSlice } from '../services/attendance';
import { authServiceSlice } from '../services/auth';
import { complianceServiceSlice } from '../services/compliance';
import { permissionsServiceSlice } from '../services/permissions';

const rootReducer = {
    auth: authServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    permissions: permissionsServiceSlice.reducer,
    // reports: '',
    // users: '',
};

export default rootReducer;
