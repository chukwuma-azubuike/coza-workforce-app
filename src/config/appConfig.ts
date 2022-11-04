import { extendTheme } from 'native-base';

const THEME_CONFIG = {
    brand: {
        primary: '#6B079C',
        900: '#8287af',
        800: '#7c83db',
        700: '#b3bef6',
    },
};

const extendedTheme = extendTheme({
    colors: {
        // COZA brand colour
        primary: {
            50: '#6B079C',
            100: '#6B079C',
            200: '#6B079C',
            300: '#6B079C',
            400: '#6B079C',
            500: '#6B079C',
            600: '#6B079C',
            700: '#6B079C',
            800: '#6B079C',
            900: '#6B079C',
        },
    },
});

export { THEME_CONFIG, extendedTheme };
