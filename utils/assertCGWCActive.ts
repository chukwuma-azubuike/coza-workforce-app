import { ICGWC } from '~/store/types';
import dayjs from 'dayjs';

const assertCGWCActive = (cgwc: ICGWC) => {
    return dayjs(dayjs(cgwc?.endDate)).diff(dayjs()) > 0;
};

export default assertCGWCActive;
