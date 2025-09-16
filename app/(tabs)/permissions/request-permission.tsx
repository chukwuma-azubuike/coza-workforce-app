import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const RequestPermission = React.lazy(() => import('~/views/app/permissions/request-permission'));

const RequestPermissionScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <RequestPermission />;
        </Suspense>
    );
};

export default RequestPermissionScreen;
