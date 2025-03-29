export const ENV = process.env.ENV;

const APP_ENV = {
    ENV,
    API_KEY: process.env.API_KEY,
    API_BASE_URL: process.env.STAGING_API_BASE_URL,
};

export default APP_ENV;
