import { configureStore, Middleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import rootReducer from './root-reducer';
import { setupReactNativeListeners } from './rn-listeners';
import middlewaresSlices from './services/middleware';
import {
    PersistConfig,
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import userStateSlice from './actions/users';
import appStateSlice from './actions/app';
import roastCRMState from './actions/roast-crm';
import roastEngagementState from './actions/roast-engagement';
import notificationsSlice from './actions/notifications';
import gspDashboardStateSlice from './actions/gsp-dashboard';
import { accountServiceSlice } from './services/account';
import { attendanceServiceSlice } from './services/attendance';
import { complianceServiceSlice } from './services/compliance';
import { permissionsServiceSlice } from './services/permissions';
import { servicesServiceSlice } from './services/services';
import { reportsServiceSlice } from './services/reports';
import { departmentServiceSlice } from './services/department';
import { campusServiceSlice } from './services/campus';
import { ticketServiceSlice } from './services/tickets';
import { scoreServiceSlice } from './services/score';
import { roleServiceSlice } from './services/role';
import { congressServiceSlice } from './services/congress';
import { scoreMappingServiceSlice } from './services/score-mapping';
import { groupHeadServiceSlice } from './services/grouphead';
import { groupServiceSlice } from './services/group';
import { uploadServiceSlice } from './services/upload';
import { roastCrmApi } from './services/roast-crm';
import { roastEngagementApi } from './services/roast-engagement';
import { gspDashboardServiceSlice } from './services/gsp-dashboard';
import { notificationServiceSlice } from './services/notification';

const middlewares: Middleware[] = [];

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
    key: 'root',
    storage: AsyncStorage,
    stateReconciler: autoMergeLevel2,
    whitelist: [
        userStateSlice.reducerPath,
        appStateSlice.reducerPath,
        roastCRMState.reducerPath,
        roastEngagementState.reducerPath,
        notificationsSlice.reducerPath,
        gspDashboardStateSlice.reducerPath,
    ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Off by default, and deliberately.
 *
 * `redux-logger` stringifies the action *and* diffs the whole state tree on every
 * dispatch. With 21 RTK Query caches in this store that is tens of milliseconds of
 * main-thread work per action, and a screen transition dispatches dozens — which is
 * felt as a navigation stall, not as slow logging. Flip this to debug a reducer, and
 * flip it back.
 */
const ENABLE_REDUX_LOGGER = false;

if (__DEV__ && ENABLE_REDUX_LOGGER) {
    const logger: Middleware = createLogger({
        collapsed: true,
        duration: true,
    });
    middlewares.push(logger);
}

const store = configureStore({
    devTools: __DEV__,
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            /**
             * Both of these are development-only by design — RTK strips them from a
             * release build — so what follows changes nothing a user ever runs. It
             * changes what *we* run, and that is the point.
             *
             * `immutableCheck` deep-walks the entire state tree twice per dispatch, and
             * `serializableCheck` walks it a third time. This store holds 21 RTK Query
             * caches: a populated guest list, a leaderboard and a few dashboards put
             * tens of thousands of nodes in that walk. The cost lands on the JS thread
             * in the middle of a transition, so a dev client feels like a slow app
             * rather than an instrumented one, and every perf judgement made on it is
             * wrong.
             *
             * The persisted slices are the part where a non-serialisable value would
             * actually hurt — it would break rehydration — so `serializableCheck` keeps
             * watching those and stops walking the caches.
             */
            immutableCheck: false,
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                ignoredPaths: [
                    accountServiceSlice.reducerPath,
                    attendanceServiceSlice.reducerPath,
                    complianceServiceSlice.reducerPath,
                    permissionsServiceSlice.reducerPath,
                    servicesServiceSlice.reducerPath,
                    reportsServiceSlice.reducerPath,
                    departmentServiceSlice.reducerPath,
                    campusServiceSlice.reducerPath,
                    ticketServiceSlice.reducerPath,
                    scoreServiceSlice.reducerPath,
                    roleServiceSlice.reducerPath,
                    congressServiceSlice.reducerPath,
                    scoreMappingServiceSlice.reducerPath,
                    groupHeadServiceSlice.reducerPath,
                    groupServiceSlice.reducerPath,
                    uploadServiceSlice.reducerPath,
                    roastCrmApi.reducerPath,
                    roastEngagementApi.reducerPath,
                    gspDashboardServiceSlice.reducerPath,
                    notificationServiceSlice.reducerPath,
                ],
            },
        }).concat([...middlewares, ...(middlewaresSlices as Array<Middleware>)]),
});

export type IStore = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
setupReactNativeListeners(store.dispatch);

export type IAppDispatch = typeof store.dispatch;

export default store;
