import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { gspDashboardActions, IGspWindowPreset } from '@store/actions/gsp-dashboard';
import { IGspBaseParams } from '@store/services/gsp-dashboard';
import { resolveWindow, IResolvedWindow } from './lib';

const GLOBAL = 'global';

/** The window/scope carried into every drill-down so it opens in the same context. */
export interface IGspWin {
    startDate?: number;
    endDate?: number;
    campusId?: string;
    serviceId?: string;
}

export interface IUseGspFilters {
    windowPreset: IGspWindowPreset;
    campusId: string;
    /** True when viewing the accumulated all-campuses (global) figures. */
    isGlobal: boolean;
    /** Selected service id, or `undefined` to aggregate across all services in the window. */
    serviceId?: string;
    /** True when scoped to a single service. */
    hasService: boolean;
    trendGroupBy: 'month' | 'service';
    window: IResolvedWindow;
    /** Base params for any window-scoped endpoint (campusId/serviceId omitted when not set). */
    params: IGspBaseParams;
    /** Base params including period-over-period comparison (skipped when a service is scoped). */
    paramsWithCompare: IGspBaseParams;
    /** Shared drill-down scope (window + campus + service). */
    win: IGspWin;
    setWindowPreset: (preset: IGspWindowPreset) => void;
    setCampus: (campusId: string) => void;
    setService: (serviceId: string | undefined) => void;
    setTrendGroupBy: (groupBy: 'month' | 'service') => void;
}

/**
 * Single source of truth for the dashboard filter bar. Reads the persisted slice,
 * resolves the window preset into epoch-second ranges, and shapes the common
 * query params every section reuses. Changing a filter refreshes all visible data
 * because every section keys its RTK Query off these params.
 */
const useGspFilters = (): IUseGspFilters => {
    const dispatch = useAppDispatch();

    const windowPreset = useAppSelector(s => s.gsp_dashboard_state.windowPreset);
    const campusId = useAppSelector(s => s.gsp_dashboard_state.campusId);
    const serviceId = useAppSelector(s => s.gsp_dashboard_state.serviceId);
    const trendGroupBy = useAppSelector(s => s.gsp_dashboard_state.trendGroupBy);

    const window = useMemo(() => resolveWindow(windowPreset), [windowPreset]);

    const isGlobal = campusId === GLOBAL;
    const hasService = !!serviceId;

    const params = useMemo<IGspBaseParams>(
        () => ({
            startDate: window.start,
            endDate: window.end,
            ...(isGlobal ? {} : { campusId }),
            ...(serviceId ? { serviceId } : {}),
        }),
        [window.start, window.end, isGlobal, campusId, serviceId]
    );

    // A service is a one-time event, so period-over-period deltas are always null
    // when scoped to one — only request compareTo for the aggregated (all-services) view.
    const paramsWithCompare = useMemo<IGspBaseParams>(
        () => (serviceId ? params : { ...params, compareTo: 'previous' }),
        [params, serviceId]
    );

    const win = useMemo<IGspWin>(
        () => ({
            startDate: window.start,
            endDate: window.end,
            campusId: isGlobal ? undefined : campusId,
            serviceId,
        }),
        [window.start, window.end, isGlobal, campusId, serviceId]
    );

    // Stable identities so sections (React.memo) only re-render when a filter value
    // actually changes — not on every unrelated parent re-render (refresh/export state).
    const setWindowPreset = useCallback(
        (preset: IGspWindowPreset) => dispatch(gspDashboardActions.setWindowPreset(preset)),
        [dispatch]
    );
    const setCampus = useCallback((id: string) => dispatch(gspDashboardActions.setCampus(id)), [dispatch]);
    const setService = useCallback(
        (id: string | undefined) => dispatch(gspDashboardActions.setService(id)),
        [dispatch]
    );
    const setTrendGroupBy = useCallback(
        (groupBy: 'month' | 'service') => dispatch(gspDashboardActions.setTrendGroupBy(groupBy)),
        [dispatch]
    );

    return useMemo<IUseGspFilters>(
        () => ({
            windowPreset,
            campusId,
            isGlobal,
            serviceId,
            hasService,
            trendGroupBy,
            window,
            params,
            paramsWithCompare,
            win,
            setWindowPreset,
            setCampus,
            setService,
            setTrendGroupBy,
        }),
        [
            windowPreset,
            campusId,
            isGlobal,
            serviceId,
            hasService,
            trendGroupBy,
            window,
            params,
            paramsWithCompare,
            win,
            setWindowPreset,
            setCampus,
            setService,
            setTrendGroupBy,
        ]
    );
};

export default useGspFilters;
