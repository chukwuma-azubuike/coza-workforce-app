import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createLogger } from 'redux-logger';
import rootReducer from './root-reducer';
import { ENV } from '@env';
import middlewaresSlices from './services/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import hardSet from 'redux-persist/es/stateReconciler/hardSet';

const middlewares: Middleware[] = [];

if (ENV === 'development') {
    const logger: Middleware = createLogger({
        collapsed: true,
        duration: true,
    });
    middlewares.push(logger);
}

const persistConfig: PersistConfig<any> = {
    key: 'root',
    storage: AsyncStorage,
    stateReconciler: hardSet,
    blacklist: ['service'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    devTools: __DEV__,
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat([...middlewares, ...middlewaresSlices]),
});

export type IStore = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
setupListeners(store.dispatch);

export default store;
