import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createLogger } from 'redux-logger';
import rootReducer from './root-reducer';
import { ENV } from '@env';
import middlewaresSlices from './services/middleware';
import { persistStore } from 'redux-persist';

const middlewares: Middleware[] = [];

if (ENV === 'development') {
    const logger: Middleware = createLogger({
        collapsed: true,
        duration: true,
    });
    middlewares.push(logger);
}

const store = configureStore({
    devTools: __DEV__,
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat([...middlewares, ...middlewaresSlices]),
});

export type IStore = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
setupListeners(store.dispatch);

export default store;
