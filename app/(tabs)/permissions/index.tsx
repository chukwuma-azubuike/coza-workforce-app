import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const Permissions = React.lazy(() => import('~/views/app/permissions'));

const PermissionsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <Permissions />
        </Suspense>
    );
};

export default PermissionsScreen;
