import React from 'react';
import { APP_NAME, API_KEY, PROD_API_BASE_URL, STAGING_API_BASE_URL, ENV } from '@env';

const APP_ENV = () => {
    switch (ENV) {
        case 'development':
            return {
                API_BASE_URL: STAGING_API_BASE_URL,
                API_KEY,
            };
            break;

        case 'production':
            return {
                API_BASE_URL: PROD_API_BASE_URL,
                API_KEY,
            };
            break;

        default:
            return {
                API_BASE_URL: STAGING_API_BASE_URL,
                API_KEY,
            };
            break;
    }
};

export default APP_ENV;
