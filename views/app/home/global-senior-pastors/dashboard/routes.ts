import { router } from 'expo-router';

/**
 * Centralised drill-down navigation for the GSP dashboard. Every "tappable total"
 * funnels through here so route names/params stay consistent. Window bounds are
 * passed along so drill-downs open in the same reporting period.
 */
export interface DrilldownWindow {
    startDate?: number;
    endDate?: number;
    campusId?: string;
    serviceId?: string;
}

export const gspRoutes = {
    campus: (campusId: string, win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/campus',
            params: { campusId, startDate: win.startDate, endDate: win.endDate, serviceId: win.serviceId } as any,
        }),

    metric: (metricKey: string, groupBy: 'campus' | 'service' | 'month', win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/metric',
            params: {
                metricKey,
                groupBy,
                startDate: win.startDate,
                endDate: win.endDate,
                campusId: win.campusId,
                serviceId: win.serviceId,
            } as any,
        }),

    services: (win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/services',
            params: {
                startDate: win.startDate,
                endDate: win.endDate,
                campusId: win.campusId,
                serviceId: win.serviceId,
            } as any,
        }),

    completeness: (win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/completeness',
            params: {
                startDate: win.startDate,
                endDate: win.endDate,
                campusId: win.campusId,
                serviceId: win.serviceId,
            } as any,
        }),

    serviceReport: () => router.push('/gsp/service-report' as any),

    /** GSP approvals inbox — per-campus reports awaiting the GSP's review for a service. */
    approvals: () => router.push('/gsp/approvals' as any),

    /** A single campus's full report for the selected service (GSP review). */
    campusReview: (params: { serviceId: string; campusId: string; campusName?: string; status?: string }) =>
        router.push({ pathname: '/gsp/campus-review', params: params as any }),

    /** Departments breakdown for a campus (workforce drill-down level 2). */
    workforceDepartments: (campusId: string, win: DrilldownWindow, campusName?: string) =>
        router.push({
            pathname: '/gsp/workforce-departments',
            params: { campusId, campusName, startDate: win.startDate, endDate: win.endDate } as any,
        }),

    /** Workers list for a department (workforce drill-down level 3). */
    workforceWorkers: (departmentId: string, win: DrilldownWindow, departmentName?: string) =>
        router.push({
            pathname: '/gsp/workforce-workers',
            params: { departmentId, departmentName, startDate: win.startDate, endDate: win.endDate } as any,
        }),

    /** Individual worker dossier (workforce drill-down level 4). */
    worker: (userId: string, win: DrilldownWindow, workerName?: string) =>
        router.push({
            pathname: '/gsp/worker',
            params: { userId, workerName, startDate: win.startDate, endDate: win.endDate } as any,
        }),
};
