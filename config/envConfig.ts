export const ENV = process.env.APP_VARIANT;

const APP_VARIANT = {
    ENV,
    isProd: ENV === 'production',
    API_KEY: process.env.API_KEY || '',
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || '',
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || '',
    APP_SLOGAN: process.env.EXPO_PUBLIC_APP_SLOGAN || '',
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || '',
    AWS_REGION: process.env.AWS_REGION || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
};

export default APP_VARIANT;
