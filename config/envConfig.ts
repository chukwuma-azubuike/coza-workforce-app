export const ENV = process.env.ENV;

const APP_ENV = {
    ENV,
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    API_BASE_URL: process.env.EXPO_PUBLIC_STAGING_API_BASE_URL,
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
    APP_SLOGAN: process.env.EXPO_PUBLIC_APP_SLOGAN,
};

export default APP_ENV;
