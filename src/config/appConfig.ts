import { extendTheme } from 'native-base';

const THEME_CONFIG = {
    black: '#000',
    white: '#FFF',
    borderRadius: 'lg',
    primary: '#6B079C',
    primaryLight: '#A855F7',
    primaryVeryLight: '#FAE8FF',
    primaryTransparent: '#8712c00d',
    success: '#22c55E',
    lightSuccess: '#73dc77',
    gray: '#71717A',
    darkGray: '#18181B',
    lightGray: '#A1A1AA',
    veryLightGray: '#D4D4D8',
    veryVeryLightGray: '#f4f4f5',
    info: '#0284C7',
    warning: '#EA580C',
    error: '#DC2626',
    rose: '#F87171',
    lightRose: '#FECDD3',
    transparentGray: '#8484881A',
    transparent: 'rgba(52, 52, 52, 0)',
};

export enum SIZE {
    xs = 32,
    sm = 44,
    md = 64,
    lg = 96,
    xl = 112,
    '2xl' = 144,
}

export const BORDER_THEME = {
    dark: THEME_CONFIG.gray,
    light: THEME_CONFIG.lightGray,
};

export const BACKGROUND_THEME = {
    light: THEME_CONFIG.veryVeryLightGray,
    dark: THEME_CONFIG.darkGray,
};

export const TEXT_THEME = {
    light: THEME_CONFIG.gray,
    dark: THEME_CONFIG.lightGray,
};

export const TEXT_THEME_MAIN = {
    light: THEME_CONFIG.black,
    dark: THEME_CONFIG.white,
};

const extendedTheme = extendTheme({
    useSystemColorMode: true,
    // initialColorMode: 'dark',
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
