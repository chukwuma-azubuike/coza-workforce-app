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

interface INotificationRoute {
    data: any;
    tabKey: string;
    routeName: string;
}

interface INotificationTypesRoute {
    [key: string]: INotificationRoute;
}

export const NOTIFICATION_TYPES_ROUTING: INotificationTypesRoute = {
    CLOCK_IN: { routeName: 'Home', tabKey: '', data: {} },
    CLOCK_OUT: { routeName: 'Home', tabKey: '', data: {} },
    SERVICE_REPORT: { routeName: 'Reports', tabKey: '', data: {} },
    CLOCK_IN_SUMMARY: { routeName: 'Attendance', tabKey: '', data: {} },
    CLOCK_OUT_SUMMARY: { routeName: 'Attendance', tabKey: '', data: {} },
    PERMISSION_STATUS: { routeName: 'Permissions', tabKey: '', data: {} },
    PERMISSION_CREATED: { routeName: 'Permissions', tabKey: 'teamPermissions', data: {} },
    PERMISSION_SUBMITTED: { routeName: 'Permissions', tabKey: '', data: {} },
    RETRACT_TICKET_ISSUED: { routeName: 'Tickets', tabKey: '', data: {} },
    NOTIFY_QC_TICKET_ISSUED: { routeName: 'Tickets', tabKey: '', data: {} },
    INDIVIDUAL_TICKET_ISSUED: { routeName: 'Tickets', tabKey: '', data: {} },
    DEPARTMENT_TICKET_ISSUED: { routeName: 'Tickets', tabKey: 'teamTickets', data: {} },
    NOTIFY_PASTOR_TICKET_ISSUED: { routeName: 'Tickets', tabKey: 'campusTickets', data: {} },
    NOTIFY_QC_RETRACTED_TICKET_ISSUED: { routeName: 'Tickets', tabKey: 'campusTickets', data: {} },
};

export interface INotificationPayload {
    ttl: string;
    from: string;
    messageId: string;
    collapseKey: string;
    sentTime: number | string;
    data: { type: NOTIFICATION_TYPES };
    notification: { android: {}; body: string; title: string };
}
