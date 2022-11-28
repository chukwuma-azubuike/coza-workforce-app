import { authServiceSlice } from '../auth';
import { attendanceServiceSlice } from '../attendance';
import { complianceServiceSlice } from '../compliance';
import { permissionsServiceSlice } from './../permissions';

const middlewaresSlices = [
    authServiceSlice.middleware,
    attendanceServiceSlice.middleware,
    complianceServiceSlice.middleware,
    permissionsServiceSlice.middleware,
];

export default middlewaresSlices;
