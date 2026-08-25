import { IUserStatus } from '~/store/types';
import { IStatusColors } from '~/types/app';

export enum NOTIFICATION_TYPES {
    CLOCK_IN = 'CLOCK_IN',
    CLOCK_OUT = 'CLOCK_OUT',
    SERVICE_REPORT = 'SERVICE_REPORT',
    CLOCK_IN_SUMMARY = 'CLOCK_IN_SUMMARY',
    CLOCK_OUT_SUMMARY = 'CLOCK_OUT_SUMMARY',
    PERMISSION_STATUS = 'PERMISSION_STATUS',
    PERMISSION_CREATED = 'PERMISSION_CREATED',
    PERMISSION_SUBMITTED = 'PERMISSION_SUBMITTED',
    RETRACT_TICKET_ISSUED = 'RETRACT_TICKET_ISSUED',
    NOTIFY_QC_TICKET_ISSUED = 'NOTIFY_QC_TICKET_ISSUED',
    INDIVIDUAL_TICKET_ISSUED = 'INDIVIDUAL_TICKET_ISSUED',
    DEPARTMENT_TICKET_ISSUED = 'DEPARTMENT_TICKET_ISSUED',
    NOTIFY_PASTOR_TICKET_ISSUED = 'NOTIFY_PASTOR_TICKET_ISSUED',
    NOTIFY_QC_RETRACTED_TICKET_ISSUED = 'NOTIFY_QC_RETRACTED_TICKET_ISSUED',
}

export const STATUS_COLORS: Record<IUserStatus, IStatusColors> = {
    ACTIVE: 'green.500',
    DORMANT: 'red.500',
    INACTIVE: 'yellow.500',
    BLACKLISTED: 'gray.400',
} as Record<IUserStatus, IStatusColors>;

export interface INotificationPayload {
    ttl: string;
    from: string;
    messageId: string;
    collapseKey: string;
    sentTime: number | string;
    data: { type: NOTIFICATION_TYPES };
    notification: { android: {}; body: string; title: string };
}
