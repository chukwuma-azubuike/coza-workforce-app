import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';

const Settings = React.lazy(() => import('~/views/roast-crm/settings'));

const MyGuestsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <Settings />
        </Suspense>
    );
};

export default MyGuestsScreen;
