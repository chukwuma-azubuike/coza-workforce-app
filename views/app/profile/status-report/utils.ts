import dayjs from 'dayjs';

// Get start and end Unix timestamps for a specific month
export function getMonthDateRange(year: number, month: number) {
    // month is 1-indexed in Day.js (1 = January, 12 = December)
    const startDate = dayjs(`${year}-${month}-01`).startOf('month');
    const endDate = dayjs(`${year}-${month}-01`).endOf('month');

    return {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        startUnix: startDate.unix(), // Unix timestamp in seconds
        endUnix: endDate.unix(), // Unix timestamp in seconds
    };
}
