import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import Empty from '@components/atoms/empty';

const Settings: React.FC = () => {
    return (
        <ViewWrapper className="flex-1">
            <Empty />
        </ViewWrapper>
    );
};

export default React.memo(Settings);
