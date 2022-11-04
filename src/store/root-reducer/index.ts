import { attendanceServiceSlice } from '../services/attendance';
import { authServiceSlice } from '../services/auth';
import { complianceServiceSlice } from '../services/compliance';

const rootReducer = {
    auth: authServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    // permissions: '',
    // reports: '',
    // users: '',
};

export default rootReducer;
