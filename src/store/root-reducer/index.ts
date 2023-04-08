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
import versionReducer, { IVersionState } from '../services/version';
import { IUser } from '../types';
import { departmentServiceSlice } from '../services/department';
import { ticketServiceSlice } from '../services/tickets';
import { campusServiceSlice } from './../services/campus';
import { scoreServiceSlice } from '../services/score';

const userPersistConfig: PersistConfig<IUser> = {
    key: 'users',
    storage: AsyncStorage,
    stateReconciler: hardSet,
};

const versionPersistConfig: PersistConfig<IVersionState> = {
    key: 'version',
    storage: AsyncStorage,
    stateReconciler: hardSet,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

const persistedVersionReducer = persistReducer(versionPersistConfig, versionReducer);

const rootReducer = combineReducers({
    account: accountServiceSlice.reducer,
    attendance: attendanceServiceSlice.reducer,
    compliance: complianceServiceSlice.reducer,
    permissions: permissionsServiceSlice.reducer,
    service: servicesServiceSlice.reducer,
    report: reportsServiceSlice.reducer,
    department: departmentServiceSlice.reducer,
    campus: campusServiceSlice.reducer,
    ticket: ticketServiceSlice.reducer,
    users: persistedUserReducer,
    version: persistedVersionReducer,
    score: scoreServiceSlice.reducer,
});

export default rootReducer;
