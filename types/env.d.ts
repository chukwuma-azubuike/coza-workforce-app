declare module '@env' {
    export const ENV: 'development' | 'staging' | 'production';
    export const API_BASE_URL: string;
    export const API_KEY: string;
    export const APP_NAME: string;
    export const APP_SLOGAN: string;
    export const CLOCK_IN_MIN_DISTANCE: number;
}
