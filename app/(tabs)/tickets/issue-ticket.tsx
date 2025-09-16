import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const IssueTicket = React.lazy(() => import('~/views/app/tickets/issue-ticket'));
const IssueTicketsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <IssueTicket />
        </Suspense>
    );
};

export default IssueTicketsScreen;
