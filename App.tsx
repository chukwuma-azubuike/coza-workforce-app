import 'react-native-gesture-handler';
import React from 'react';
import { extendTheme, NativeBaseProvider } from 'native-base';
import Views from './src/views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { extendedTheme } from './src/config/appConfig';
import { Provider } from 'react-redux';
import store from './src/store';
import { SafeAreaView } from 'react-native';
import { IModalProps } from './types/app';
import useRootModal from './src/hooks/modal/useRootModal';
import ModalProvider from './src/providers/modal-provider';

const theme = extendTheme(extendedTheme);

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Provider store={store}>
                <ModalProvider
                    initialModalState={{
                        // Initialised and also hydrated
                        ...modalInitialState.modalState,
                        ...setModalState,
                    }}
                >
                    <NativeBaseProvider theme={theme}>
                        <SafeAreaProvider>
                            <Views isLoggedIn={true} />
                        </SafeAreaProvider>
                    </NativeBaseProvider>
                </ModalProvider>
            </Provider>
        </SafeAreaView>
    );
};
export default App;
