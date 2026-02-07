import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const Tickets = React.lazy(() => import('~/views/app/tickets'));

const TicketsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <Tickets />
        </Suspense>
    );
};

export default TicketsScreen;
