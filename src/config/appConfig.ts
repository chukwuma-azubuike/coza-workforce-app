import { extendTheme } from 'native-base';

const THEME_CONFIG = {
    borderRadius: 'lg',
    primary: '#6B079C',
    success: '#16A34A',
    gray: 'gray',
    info: '#0284C7',
    warning: '#EA580C',
    error: '#DC2626',
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
