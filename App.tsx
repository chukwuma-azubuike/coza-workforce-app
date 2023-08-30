import 'react-native-gesture-handler';
import React from 'react';
import * as Sentry from '@sentry/react-native';
import { SENTRY_DNS } from '@env';

import { NativeBaseProvider } from 'native-base';
import Views from './src/views';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { extendedTheme } from './src/config/appConfig';
import { Provider } from 'react-redux';
import store, { persistor } from './src/store';
import { IModalProps } from './types/app';
import useRootModal from './src/hooks/modal/useRootModal';
import ModalProvider from './src/providers/modal-provider';
import useUserSession from './src/hooks/user-session';
import Loading from './src/components/atoms/loading';

import { PersistGate } from 'redux-persist/integration/react';

Sentry.init({
    dsn: SENTRY_DNS,
    enableNative: false,
    tracesSampleRate: 0.1,
    attachScreenshot: true,
    enableNativeCrashHandling: true,
});

export interface IAppStateContext {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppStateContext = React.createContext<Partial<IAppStateContext>>({});

const App: React.FC<JSX.Element> = () => {
    const modalInitialState: Pick<IModalProps, 'modalState'> = {
        modalState: {
            open: false,
            render: null,
            button: true,
            message: null,
        },
    };

    const { setModalState } = useRootModal(modalInitialState.modalState);
    const { isLoggedIn, setIsLoggedIn } = useUserSession();

    return (
        <Sentry.TouchEventBoundary>
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
                    <Provider store={store}>
                        <NativeBaseProvider theme={extendedTheme}>
                            <PersistGate loading={<Loading bootUp />} persistor={persistor}>
                                <AppStateContext.Provider
                                    value={
                                        {
                                            isLoggedIn,
                                            setIsLoggedIn,
                                        } as IAppStateContext
                                    }
                                >
                                    <ModalProvider
                                        initialModalState={{
                                            ...modalInitialState.modalState,
                                            ...setModalState,
                                        }}
                                    >
                                        {isLoggedIn !== undefined ? (
                                            <Views isLoggedIn={isLoggedIn} />
                                        ) : (
                                            <Loading bootUp />
                                        )}
                                    </ModalProvider>
                                </AppStateContext.Provider>
                            </PersistGate>
                        </NativeBaseProvider>
                    </Provider>
                </SafeAreaView>
            </SafeAreaProvider>
        </Sentry.TouchEventBoundary>
    );
};

export default Sentry.wrap(App);
