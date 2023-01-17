import 'react-native-gesture-handler';
import React from 'react';
import { NativeBaseProvider } from 'native-base';
import Views from './src/views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { extendedTheme } from './src/config/appConfig';
import { Provider } from 'react-redux';
import store, { persistor } from './src/store';
import { SafeAreaView } from 'react-native';
import { IModalProps } from './types/app';
import useRootModal from './src/hooks/modal/useRootModal';
import ModalProvider from './src/providers/modal-provider';
import useUserSession from './src/hooks/user-session';
import Loading from './src/components/atoms/loading';
import { PersistGate } from 'redux-persist/integration/react';

export interface IAppStateContext {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppStateContext = React.createContext<Partial<IAppStateContext>>(
    {}
);

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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Provider store={store}>
                <NativeBaseProvider theme={extendedTheme}>
                    <PersistGate
                        loading={<Loading bootUp />}
                        persistor={persistor}
                    >
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
                                <SafeAreaProvider>
                                    {isLoggedIn !== undefined ? (
                                        <Views isLoggedIn={isLoggedIn} />
                                    ) : (
                                        <Loading bootUp />
                                    )}
                                </SafeAreaProvider>
                            </ModalProvider>
                        </AppStateContext.Provider>
                    </PersistGate>
                </NativeBaseProvider>
            </Provider>
        </SafeAreaView>
    );
};
export default App;
