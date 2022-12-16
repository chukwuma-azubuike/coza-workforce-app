import { VStack } from 'native-base';
import React from 'react';
import WorkForceSummary from './workforce-summary';

const GSPView: React.FC = () => {
    return (
        <VStack pb={10} >
            <WorkForceSummary />
        </VStack>
    );
};

export default GSPView;
