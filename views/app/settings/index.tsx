import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import Empty from '@components/atoms/empty';
import ErrorBoundary from '~/components/composite/error-boundary';

const Settings: React.FC = () => {
    return (
        <ErrorBoundary>
            <ViewWrapper className="flex-1">
                <Empty />
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(Settings);
