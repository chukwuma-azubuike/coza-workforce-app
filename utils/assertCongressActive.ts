import { ICongress } from '~/store/types';
import dayjs from 'dayjs';

const assertCongressActive = (congress: ICongress) => {
    return dayjs(dayjs(congress?.endDate)).diff(dayjs()) > 0;
};

export default assertCongressActive;
