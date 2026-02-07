import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const PermissionDetails = React.lazy(() => import('~/views/app/permissions/permission-details'));

const PermissionsDetailsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <PermissionDetails />
        </Suspense>
    );
};

export default PermissionsDetailsScreen;
