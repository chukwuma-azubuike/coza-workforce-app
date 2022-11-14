import 'react-native-gesture-handler';
import React from 'react';
import { extendTheme, NativeBaseProvider } from 'native-base';
import Views from './src/views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { extendedTheme } from './src/config/appConfig';
import { Provider } from 'react-redux';
import store from './src/store';

const theme = extendTheme(extendedTheme);

const App: React.FC<JSX.Element> = () => {
    return (
        <Provider store={store}>
            <NativeBaseProvider theme={theme}>
                <SafeAreaProvider>
                    <Views isLoggedIn={true} />
                </SafeAreaProvider>
            </NativeBaseProvider>
        </Provider>
    );
};
export default App;
