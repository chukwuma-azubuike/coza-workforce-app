import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const TicketDetails = React.lazy(() => import('~/views/app/tickets/ticket-details'));

const TicketsDetailsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <TicketDetails />
        </Suspense>
    );
};

export default TicketsDetailsScreen;
