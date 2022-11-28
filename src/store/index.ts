import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createLogger } from 'redux-logger';
import rootReducer from './root-reducer';
import { ENV } from '@env';
import middlewaresSlices from './services/middleware';

const middlewares: Middleware[] = [];

if (ENV === 'development') {
    const logger: Middleware = createLogger({
        collapsed: true,
        duration: true,
    });
    middlewares.push(logger);
}

const store = configureStore({
    reducer: rootReducer,
    // middleware: middlewares,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat([...middlewares, ...middlewaresSlices]),
});

export type IStore = ReturnType<typeof store.getState>;

export default store;

setupListeners(store.dispatch);
