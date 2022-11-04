import { configureStore, Middleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import rootReducer from './root-reducer';
import { ENV } from '@env';

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
    middleware: middlewares,
});

export type IStore = ReturnType<typeof store.getState>;

export default store;
