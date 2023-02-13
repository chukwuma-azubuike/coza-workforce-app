import { accountServiceSlice } from '../account';
import { attendanceServiceSlice } from '../attendance';
import { complianceServiceSlice } from '../compliance';
import { reportsServiceSlice } from '../reports';
import { servicesServiceSlice } from '../services';
import { permissionsServiceSlice } from './../permissions';
import { departmentServiceSlice } from '../department';
import { ticketServiceSlice } from '../tickets';

const middlewaresSlices = [
    accountServiceSlice.middleware,
    attendanceServiceSlice.middleware,
    complianceServiceSlice.middleware,
    permissionsServiceSlice.middleware,
    servicesServiceSlice.middleware,
    reportsServiceSlice.middleware,
    departmentServiceSlice.middleware,
    ticketServiceSlice.middleware,
];

export default middlewaresSlices;
