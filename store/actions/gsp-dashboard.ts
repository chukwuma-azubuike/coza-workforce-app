import { PayloadAction, asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';
import { IGspGroupBy } from '../services/gsp-dashboard';

/** Window presets resolved to epoch-second ranges at read time (see dashboard/lib). */
export type IGspWindowPreset = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear';

export interface IGspDashboardState {
    /** Selected reporting window preset. */
    windowPreset: IGspWindowPreset;
    /** Selected campus id, or `global` for the accumulated all-campuses view. */
    campusId: string;
    /** Breakdown dimension for trend charts. */
    trendGroupBy: Extract<IGspGroupBy, 'month' | 'service'>;
}

const initialState: IGspDashboardState = {
    windowPreset: 'thisMonth',
    campusId: 'global',
    trendGroupBy: 'month',
};

export const createGspDashboardSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

const gspDashboardStateSlice = createGspDashboardSlice({
    name: 'gsp_dashboard_state',

    initialState,

    reducers: {
        setWindowPreset: (state, { payload }: PayloadAction<IGspWindowPreset>) => {
            state.windowPreset = payload;
        },
        setCampus: (state, { payload }: PayloadAction<string>) => {
            state.campusId = payload;
        },
        setTrendGroupBy: (state, { payload }: PayloadAction<IGspDashboardState['trendGroupBy']>) => {
            state.trendGroupBy = payload;
        },
        resetFilters: () => initialState,
    },

    selectors: {
        selectWindowPreset: store => store.windowPreset,
        selectCampusId: store => store.campusId,
        selectTrendGroupBy: store => store.trendGroupBy,
    },
});

const { actions, selectors } = gspDashboardStateSlice;

export const gspDashboardActions = actions;
export const gspDashboardSelectors = selectors;

export default gspDashboardStateSlice;
