import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';

const ZoneDashboard = React.lazy(() => import('~/views/roast-crm/zone-dashboard/ZoneDashboard'));

const ZoneDashboardScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <ZoneDashboard />
        </Suspense>
    );
};

export default ZoneDashboardScreen;
