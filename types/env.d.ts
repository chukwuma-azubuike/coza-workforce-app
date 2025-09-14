declare module '@env' {
    export const ENV: 'development' | 'staging' | 'production';
    export const PROD_API_BASE_URL: string;
    export const STAGING_API_BASE_URL: string;
    export const API_KEY: string;
    export const APP_NAME: string;
    export const APP_SLOGAN: string;
    export const SUPPORT_EMAIL: string;
    export const CLOCK_IN_MIN_DISTANCE: number;
    export const SENTRY_DNS: string;
    export const UPLOAD_URL: string;
    export const UPLOAD_API_KEY: string;
    export const AWS_REGION: string;
    export const AWS_S3_BUCKET_NAME: string;
    export const AWS_ACCESS_KEY: string;
    export const AWS_SECRET_KEY: string;
}
