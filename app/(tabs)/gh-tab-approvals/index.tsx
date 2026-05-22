import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const GHApprovals = React.lazy(() => import('~/views/app/gh-approvals'));

const GHApprovalsTab: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <GHApprovals />
        </Suspense>
    );
};

export default GHApprovalsTab;
