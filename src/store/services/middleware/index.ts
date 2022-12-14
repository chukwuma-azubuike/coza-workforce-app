import { accountServiceSlice } from '../account';
import { attendanceServiceSlice } from '../attendance';
import { complianceServiceSlice } from '../compliance';
import { servicesServiceSlice } from '../services';
import { permissionsServiceSlice } from './../permissions';

const middlewaresSlices = [
    accountServiceSlice.middleware,
    attendanceServiceSlice.middleware,
    complianceServiceSlice.middleware,
    permissionsServiceSlice.middleware,
    servicesServiceSlice.middleware,
];

export default middlewaresSlices;
