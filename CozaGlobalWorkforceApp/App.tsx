import React from 'react';
import { extendTheme, NativeBaseProvider } from 'native-base';
import Views from './src/views';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { extendedTheme, THEME_CONFIG } from './src/config/appConfig';

const theme = extendTheme(extendedTheme);

const App = () => {
    return (
        <NativeBaseProvider theme={theme}>
            <SafeAreaProvider>
                <Views />
            </SafeAreaProvider>
        </NativeBaseProvider>
    );
};
export default App;
