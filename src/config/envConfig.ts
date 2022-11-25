import React from 'react';
import { APP_NAME, API_KEY, API_BASE_URL, ENV } from '@env';

const APP_ENV = () => {
    switch (ENV) {
        case 'development':
            return {
                API_BASE_URL,
                API_KEY,
            };
            break;

        default:
            break;
    }
};

export default APP_ENV;
