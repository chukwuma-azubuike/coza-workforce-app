import React, { Suspense, memo } from 'react';
import Loading from './atoms/loading';

interface LazyTabContentProps {
    component: React.ComponentType<any>;
    fallback?: React.ReactNode;
    [key: string]: any;
}

const LazyTabContent: React.FC<LazyTabContentProps> = memo(
    ({ component: Component, fallback = <Loading />, ...props }) => {
        return (
            <Suspense fallback={fallback}>
                <Component {...props} />
            </Suspense>
        );
    }
);

LazyTabContent.displayName = 'LazyTabContent';

export { LazyTabContent };
