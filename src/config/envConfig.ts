import React from 'react';
import { API_KEY, PROD_API_BASE_URL, STAGING_API_BASE_URL, ENV } from '@env';

const APP_ENV = () => {
    console.log('Environment -->', ENV);
    switch (ENV) {
        case 'development':
            console.log('Running on', ENV, 'server...');
            return {
                API_BASE_URL: STAGING_API_BASE_URL,
                API_KEY,
            };
            break;

        case 'production':
            console.log('Running on', ENV, 'server...');
            return {
                API_BASE_URL: STAGING_API_BASE_URL,
                API_KEY,
            };
            break;
    }
};

export default APP_ENV;
