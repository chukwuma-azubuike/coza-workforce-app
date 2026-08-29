import dayjs from 'dayjs';

/**
 * The one-tap times.
 *
 * Almost every reminder a worker sets is one of these four, and the difference between a
 * feature people use and one they mean to use is whether setting a reminder costs one tap
 * or six. The date picker stays for everything else.
 *
 * Every option is computed at render, never at module load — a chip labelled "this
 * evening" on a screen left open past 18:00 would otherwise offer a time in the past.
 */
export interface IQuickTime {
    key: string;
    label: string;
    /** `null` when the option has slipped into the past and should not be offered. */
    at: () => Date | null;
}

const atHour = (base: dayjs.Dayjs, hour: number) => base.hour(hour).minute(0).second(0).millisecond(0);

const futureOrNull = (candidate: dayjs.Dayjs): Date | null =>
    candidate.valueOf() > Date.now() ? candidate.toDate() : null;

export const QUICK_TIMES: IQuickTime[] = [
    {
        key: 'in-1h',
        label: 'In an hour',
        at: () => dayjs().add(1, 'hour').second(0).millisecond(0).toDate(),
    },
    {
        key: 'this-evening',
        label: 'This evening',
        at: () => futureOrNull(atHour(dayjs(), 18)),
    },
    {
        key: 'tomorrow',
        label: 'Tomorrow 9am',
        at: () => atHour(dayjs().add(1, 'day'), 9).toDate(),
    },
    {
        key: 'saturday',
        label: 'Saturday 10am',
        at: () => {
            // `day(6)` resolves within the *current* week, which is already past by
            // Sunday — so a week is added whenever the result is not still ahead.
            const saturday = atHour(dayjs().day(6), 10);

            return (saturday.valueOf() > Date.now() ? saturday : saturday.add(1, 'week')).toDate();
        },
    },
];

/** The chips worth showing right now. */
export const availableQuickTimes = (): Array<IQuickTime & { date: Date }> =>
    QUICK_TIMES.map(option => ({ ...option, date: option.at() as Date })).filter(option => !!option.date);

/** Matches a chosen instant back to a chip, so the selected one stays highlighted. */
export const quickTimeKeyFor = (dueAt?: string): string | null => {
    if (!dueAt) {
        return null;
    }

    const chosen = new Date(dueAt).getTime();

    return availableQuickTimes().find(option => Math.abs(option.date.getTime() - chosen) < 60_000)?.key ?? null;
};
