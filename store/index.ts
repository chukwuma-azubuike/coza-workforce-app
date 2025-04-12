import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createLogger } from 'redux-logger';
import rootReducer from './root-reducer';
import middlewaresSlices from './services/middleware';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hardSet from 'redux-persist/es/stateReconciler/hardSet';
import userStateSlice from './actions/users';
import appStateSlice from './actions/app';

const middlewares: Middleware[] = [];

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
    key: 'root',
    storage: AsyncStorage,
    stateReconciler: hardSet,
    whitelist: [userStateSlice.reducerPath, appStateSlice.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

if (__DEV__) {
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
            serializableCheck: false,
        }).concat([...middlewares, ...(middlewaresSlices as Array<Middleware>)]),
});

export type IStore = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
setupListeners(store.dispatch);

export type IAppDispatch = typeof store.dispatch;

export default store;
