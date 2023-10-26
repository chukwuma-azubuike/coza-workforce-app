import { API_KEY, PROD_API_BASE_URL, STAGING_API_BASE_URL, ENV } from '@env';

const APP_ENV = () => {
    switch (ENV) {
        case 'development':
            console.log('Running on', ENV, 'server...');
            return {
                API_BASE_URL: STAGING_API_BASE_URL,
                API_KEY,
            };

        case 'production':
            console.log('Running on', ENV, 'server...');
            return {
                API_BASE_URL: PROD_API_BASE_URL,
                API_KEY,
            };
        default:
            console.log('Running on', ENV, 'server...');
            return {
                API_BASE_URL: STAGING_API_BASE_URL,
                API_KEY,
            };
    }
};

export default APP_ENV;
