import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const WorkforceSummary = React.lazy(() => import('~/views/app/group-head-summary'));

const GHWorkforceTab: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <WorkforceSummary />
        </Suspense>
    );
};

export default GHWorkforceTab;
