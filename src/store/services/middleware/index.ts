import { accountServiceSlice } from '../account';
import { attendanceServiceSlice } from '../attendance';
import { complianceServiceSlice } from '../compliance';
import { permissionsServiceSlice } from './../permissions';

const middlewaresSlices = [
    accountServiceSlice.middleware,
    attendanceServiceSlice.middleware,
    complianceServiceSlice.middleware,
    permissionsServiceSlice.middleware,
];

export default middlewaresSlices;
