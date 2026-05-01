import React, { Suspense } from 'react';
import Loading from '~/components/atoms/loading';
const Home = React.lazy(() => import('~/views/app/home'));

const HomeScreen: React.FC = () => {
    return (
        <Suspense fallback={<Loading cover />}>
            <Home />
        </Suspense>
    );
};

export default HomeScreen;
