import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';

const Tickets: React.FC = () => {
    return (
        <ViewWrapper>
            <Empty message="Nothing here. Let's keep it that way! 😇" />
        </ViewWrapper>
    );
};

export default Tickets;
