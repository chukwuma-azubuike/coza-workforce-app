import { extendTheme } from 'native-base';

const THEME_CONFIG = {
    borderRadius: 'lg',
    primary: '#6B079C',
    primaryLight: '#A855F7',
    primaryVeryLight: '#FAE8FF',
    success: '#16A34A',
    gray: '#71717A',
    lightGray: '#A1A1AA',
    veryLightGray: '#D4D4D8',
    info: '#0284C7',
    warning: '#EA580C',
    error: '#DC2626',
    rose: '#F87171',
    lightRose: '#FECDD3',
};

const extendedTheme = extendTheme({
    colors: {
        // COZA brand colour
        primary: {
            50: '#FAF5FF',
            100: '#FAE8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#6B079C',
            700: '#520578',
            800: '#520578',
            900: '#520578',
        },
    },
});

export { THEME_CONFIG, extendedTheme };
