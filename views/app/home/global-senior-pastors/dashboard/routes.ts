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
}

export const gspRoutes = {
    campus: (campusId: string, win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/campus',
            params: { campusId, startDate: win.startDate, endDate: win.endDate } as any,
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
            } as any,
        }),

    services: (win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/services',
            params: { startDate: win.startDate, endDate: win.endDate, campusId: win.campusId } as any,
        }),

    completeness: (win: DrilldownWindow) =>
        router.push({
            pathname: '/gsp/completeness',
            params: { startDate: win.startDate, endDate: win.endDate, campusId: win.campusId } as any,
        }),

    serviceReport: () => router.push('/gsp/service-report' as any),
};
