import { combineReducers } from '@reduxjs/toolkit';
import { attendanceServiceSlice } from '../services/attendance';
import { accountServiceSlice } from '../services/account';
import { complianceServiceSlice } from '../services/compliance';
import { permissionsServiceSlice } from '../services/permissions';
import { servicesServiceSlice } from '../services/services';
import { reportsServiceSlice } from '../services/reports';
import userReducer from '../services/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig, persistReducer } from 'redux-persist';
import hardSet from 'redux-persist/es/stateReconciler/hardSet';
import versionReducer from '../services/version';

const userPersistConfig: PersistConfig<any> = {
    key: 'users',
    storage: AsyncStorage,
    stateReconciler: hardSet,
};

const versionPersistConfig: PersistConfig<any> = {
    key: 'version',
    storage: AsyncStorage,
    stateReconciler: hardSet,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

const persistedVersionReducer = persistReducer(
    versionPersistConfig,
    versionReducer
);

const rootReducer = combineReducers({
    account: accountServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    permissions: permissionsServiceSlice.reducer,
    service: servicesServiceSlice.reducer,
    report: reportsServiceSlice.reducer,
    users: persistedUserReducer,
    version: persistedVersionReducer,
});

export default rootReducer;
