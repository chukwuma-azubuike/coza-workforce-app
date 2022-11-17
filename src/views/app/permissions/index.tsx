import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';

const Permissions: React.FC = () => {
    return (
        <ViewWrapper>
            <Empty message="You haven't requested any permissions." />
        </ViewWrapper>
    );
};

export default Permissions;
