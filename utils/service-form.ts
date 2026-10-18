import dayjs, { Dayjs } from 'dayjs';
import {
    Congress_SESSION_TAGS,
    CREATE_SERVICE_ENUM,
    DEFAULT_RANGES_TO_CLOCKIN,
    ICreateService,
    IService,
    IServiceFormValues,
    IServiceFormVariant,
    SERVICE_TAGS,
} from '~/store/types';

type IServicePreset = Pick<
    IServiceFormValues,
    | 'name'
    | 'serviceType'
    | 'serviceTime'
    | 'clockInStartTime'
    | 'leadersLateStartTime'
    | 'workersLateStartTime'
    | 'serviceEndTime'
>;

/** Local wall-clock times ("HH:mm") for the recurring services, applied when a tag is picked. */
const SERVICE_PRESETS: Record<string, IServicePreset> = {
    COZA_SUNDAYS: {
        name: 'COZA Sunday',
        serviceType: 'local',
        clockInStartTime: '02:00',
        leadersLateStartTime: '07:30',
        workersLateStartTime: '08:00',
        serviceTime: '09:00',
        serviceEndTime: '23:59',
    },
    COZA_TUESDAYS: {
        name: 'COZA Tuesday',
        serviceType: 'global',
        clockInStartTime: '15:00',
        leadersLateStartTime: '17:30',
        workersLateStartTime: '18:00',
        serviceTime: '18:00',
        serviceEndTime: '23:59',
    },
    COZA_WEDNESDAYS: {
        name: 'COZA Wednesday',
        serviceType: 'local',
        clockInStartTime: '15:00',
        leadersLateStartTime: '17:30',
        workersLateStartTime: '18:00',
        serviceTime: '18:00',
        serviceEndTime: '23:59',
    },
    DPE: {
        name: 'DPE',
        serviceType: 'global',
        clockInStartTime: '03:00',
        leadersLateStartTime: '06:00',
        workersLateStartTime: '06:00',
        serviceTime: '06:00',
        serviceEndTime: '11:50',
    },
    DOMINION_HOUR: {
        name: 'Dominion Hour',
        serviceType: 'global',
        clockInStartTime: '03:00',
        leadersLateStartTime: '06:00',
        workersLateStartTime: '06:00',
        serviceTime: '06:00',
        serviceEndTime: '11:50',
    },
    HOME_TRAINING: {
        name: 'Home Training',
        serviceType: 'global',
        clockInStartTime: '13:00',
        leadersLateStartTime: '18:30',
        workersLateStartTime: '18:30',
        serviceTime: '18:00',
        serviceEndTime: '23:59',
    },
    LEADERS_MEETING: {
        name: 'Leaders Meeting',
        serviceType: 'global',
        clockInStartTime: '16:00',
        leadersLateStartTime: '18:00',
        workersLateStartTime: '16:00',
        serviceTime: '18:00',
        serviceEndTime: '23:00',
    },
    '12DG': {
        name: '12DG',
        serviceType: 'local',
        clockInStartTime: '15:00',
        leadersLateStartTime: '17:30',
        workersLateStartTime: '18:00',
        serviceTime: '18:00',
        serviceEndTime: '23:59',
    },
    '7DG': {
        name: '7DG',
        serviceType: 'local',
        clockInStartTime: '15:00',
        leadersLateStartTime: '17:30',
        workersLateStartTime: '18:00',
        serviceTime: '18:00',
        serviceEndTime: '23:59',
    },
};

export interface IServiceFormConfig {
    /** "Service" or "Session" — used in labels, buttons and alerts. */
    noun: string;
    tags: { id: string; value: string }[];
    presets: Record<string, IServicePreset>;
    defaultServiceType: IServiceFormValues['serviceType'];
}

export const SERVICE_FORM_CONFIG: Record<IServiceFormVariant, IServiceFormConfig> = {
    service: {
        noun: 'Service',
        tags: SERVICE_TAGS,
        presets: SERVICE_PRESETS,
        defaultServiceType: '',
    },
    'congress-session': {
        noun: 'Session',
        tags: Congress_SESSION_TAGS,
        presets: {},
        defaultServiceType: 'global',
    },
};

export const SERVICE_TYPE_OPTIONS = [
    { id: 'local', label: 'Local' },
    { id: 'global', label: 'Global' },
];

export const TIME_FIELDS = [
    'clockInStartTime',
    'leadersLateStartTime',
    'workersLateStartTime',
    'serviceTime',
    'serviceEndTime',
] as const;

/** The congress a service belongs to, whichever key the record carries it under. */
export const getServiceCongressId = (service?: Partial<IService>) => service?.CGWCId || service?.CongressId;

export const getServiceVariant = (service?: Partial<IService>, congressId?: string): IServiceFormVariant =>
    congressId || getServiceCongressId(service) || service?.isCGWC || service?.isCongress
        ? 'congress-session'
        : 'service';

/** API dates arrive as ISO strings, but older records hold epoch seconds. */
export const parseApiDate = (value?: string | number | null): Dayjs | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    const numeric = typeof value === 'number' ? value : /^\d+$/.test(value) ? Number(value) : NaN;
    const parsed = Number.isNaN(numeric) ? dayjs(value) : numeric < 1e12 ? dayjs.unix(numeric) : dayjs(numeric);
    return parsed.isValid() ? parsed : undefined;
};

/** "HH:mm" on today's date as an ISO string, which is what the time pickers hold. */
const fromClockTime = (clockTime: string) => {
    const [hour = 0, minute = 0] = clockTime.split(':').map(Number);
    return dayjs().hour(hour).minute(minute).second(0).millisecond(0).toISOString();
};

/** Minutes past midnight, local time. Lets the schema compare times regardless of the date they sit on. */
export const minutesOfDay = (value?: string) => {
    const parsed = parseApiDate(value);
    return parsed ? parsed.hour() * 60 + parsed.minute() : undefined;
};

export const getEmptyServiceFormValues = (variant: IServiceFormVariant): IServiceFormValues => ({
    name: '',
    tag: '',
    serviceType: SERVICE_FORM_CONFIG[variant].defaultServiceType,
    rangeToClockIn: DEFAULT_RANGES_TO_CLOCKIN,
    serviceDate: '',
    serviceTime: '',
    clockInStartTime: '',
    leadersLateStartTime: '',
    workersLateStartTime: '',
    serviceEndTime: '',
});

/**
 * Map a stored service onto form values. `shiftDays` moves the date, for duplicating a session onto
 * the next day of a congress.
 */
export const toServiceFormValues = (service: IService, shiftDays = 0): IServiceFormValues => {
    const toIso = (value?: string) => parseApiDate(value)?.add(shiftDays, 'day').toISOString() ?? '';

    return {
        name: service.name ?? '',
        tag: service.tag?.[0] ?? '',
        serviceType: service.isGlobalService ? 'global' : 'local',
        rangeToClockIn: `${service.rangeToClockIn ?? DEFAULT_RANGES_TO_CLOCKIN}`,
        serviceDate: toIso(service.serviceTime),
        serviceTime: toIso(service.serviceTime),
        clockInStartTime: toIso(service.clockInStartTime),
        leadersLateStartTime: toIso(service.leadersLateStartTime),
        workersLateStartTime: toIso(service.workersLateStartTime),
        serviceEndTime: toIso(service.serviceEndTime),
    };
};

/** Apply a tag's preset times without discarding the date (or anything else) already entered. */
export const applyServicePreset = (
    variant: IServiceFormVariant,
    tag: string,
    values: IServiceFormValues
): IServiceFormValues => {
    const preset = SERVICE_FORM_CONFIG[variant].presets[tag];
    if (!preset) return { ...values, tag };

    return {
        ...values,
        tag,
        name: preset.name,
        serviceType: preset.serviceType,
        serviceTime: fromClockTime(preset.serviceTime),
        clockInStartTime: fromClockTime(preset.clockInStartTime),
        leadersLateStartTime: fromClockTime(preset.leadersLateStartTime),
        workersLateStartTime: fromClockTime(preset.workersLateStartTime),
        serviceEndTime: fromClockTime(preset.serviceEndTime),
    };
};

/** The service date with a picker's time of day, in the device's local time, as epoch seconds. */
const combineDateTime = (date: string, time: string) => {
    const day = dayjs(date);
    const clock = dayjs(time);
    return day.hour(clock.hour()).minute(clock.minute()).second(0).millisecond(0).unix();
};

export const toServicePayload = (values: IServiceFormValues, congressId?: string): ICreateService => ({
    name: values.name.trim(),
    tag: [values.tag],
    coordinates: {
        long: CREATE_SERVICE_ENUM.LONG,
        lat: CREATE_SERVICE_ENUM.LAT,
    },
    isGlobalService: values.serviceType === 'global',
    rangeToClockIn: Number(values.rangeToClockIn),
    serviceTime: combineDateTime(values.serviceDate, values.serviceTime),
    clockInStartTime: combineDateTime(values.serviceDate, values.clockInStartTime),
    leadersLateStartTime: combineDateTime(values.serviceDate, values.leadersLateStartTime),
    workersLateStartTime: combineDateTime(values.serviceDate, values.workersLateStartTime),
    serviceEndTime: combineDateTime(values.serviceDate, values.serviceEndTime),
    ...(congressId ? { CGWCId: congressId, isCGWC: true, CongressId: congressId, isCongress: true } : {}),
});
