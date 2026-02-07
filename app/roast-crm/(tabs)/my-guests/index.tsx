import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';

const MyGuestsDashboard = React.lazy(() => import('~/views/roast-crm/my-guests/MyGuestsDashboard'));

const MyGuestsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <MyGuestsDashboard />
        </Suspense>
    );
};

export default MyGuestsScreen;
