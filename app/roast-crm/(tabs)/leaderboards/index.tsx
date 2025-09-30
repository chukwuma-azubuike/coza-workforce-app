import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const Leaderboards = React.lazy(() => import('~/views/roast-crm/leaderboards/Leaderboards'));

const LeaderboardsScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <Leaderboards />
        </Suspense>
    );
};

export default LeaderboardsScreen;
