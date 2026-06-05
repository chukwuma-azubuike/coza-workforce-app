import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { gspDashboardActions, IGspWindowPreset } from '@store/actions/gsp-dashboard';
import { IGspBaseParams } from '@store/services/gsp-dashboard';
import { resolveWindow, IResolvedWindow } from './lib';

const GLOBAL = 'global';

export interface IUseGspFilters {
    windowPreset: IGspWindowPreset;
    campusId: string;
    /** True when viewing the accumulated all-campuses (global) figures. */
    isGlobal: boolean;
    trendGroupBy: 'month' | 'service';
    window: IResolvedWindow;
    /** Base params for any window-scoped endpoint (campusId omitted when global). */
    params: IGspBaseParams;
    /** Base params including period-over-period comparison. */
    paramsWithCompare: IGspBaseParams;
    setWindowPreset: (preset: IGspWindowPreset) => void;
    setCampus: (campusId: string) => void;
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
    const trendGroupBy = useAppSelector(s => s.gsp_dashboard_state.trendGroupBy);

    const window = useMemo(() => resolveWindow(windowPreset), [windowPreset]);

    const isGlobal = campusId === GLOBAL;

    const params = useMemo<IGspBaseParams>(
        () => ({
            startDate: window.start,
            endDate: window.end,
            ...(isGlobal ? {} : { campusId }),
        }),
        [window.start, window.end, isGlobal, campusId]
    );

    const paramsWithCompare = useMemo<IGspBaseParams>(() => ({ ...params, compareTo: 'previous' }), [params]);

    // Stable identities so sections (React.memo) only re-render when a filter value
    // actually changes — not on every unrelated parent re-render (refresh/export state).
    const setWindowPreset = useCallback(
        (preset: IGspWindowPreset) => dispatch(gspDashboardActions.setWindowPreset(preset)),
        [dispatch]
    );
    const setCampus = useCallback((id: string) => dispatch(gspDashboardActions.setCampus(id)), [dispatch]);
    const setTrendGroupBy = useCallback(
        (groupBy: 'month' | 'service') => dispatch(gspDashboardActions.setTrendGroupBy(groupBy)),
        [dispatch]
    );

    return useMemo<IUseGspFilters>(
        () => ({
            windowPreset,
            campusId,
            isGlobal,
            trendGroupBy,
            window,
            params,
            paramsWithCompare,
            setWindowPreset,
            setCampus,
            setTrendGroupBy,
        }),
        [
            windowPreset,
            campusId,
            isGlobal,
            trendGroupBy,
            window,
            params,
            paramsWithCompare,
            setWindowPreset,
            setCampus,
            setTrendGroupBy,
        ]
    );
};

export default useGspFilters;
