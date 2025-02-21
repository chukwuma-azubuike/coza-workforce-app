import { ICGWC } from '@store/types';
import moment from 'moment';

const assertCGWCActive = (cgwc: ICGWC) => {
    return moment(moment(cgwc?.endDate)).diff(moment()) > 0;
};

export default assertCGWCActive;
