import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';

const GlobalDashboard = React.lazy(() => import('~/views/roast-crm/global-dashboard/GlobalDashboard'));

const GlobalDashboardScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <GlobalDashboard />
        </Suspense>
    );
};

export default GlobalDashboardScreen;
