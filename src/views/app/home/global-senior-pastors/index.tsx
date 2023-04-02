import { VStack } from 'native-base';
import React from 'react';
import { IService } from '../../../../store/types';
import WorkForceSummary from './workforce-summary';

interface GSPViewProps {
    servicesIsSuccess: boolean;
    services: IService[];
}

const GSPView: React.FC<GSPViewProps> = ({ services, servicesIsSuccess }) => {
    return (
        <VStack pb={10}>
            <WorkForceSummary servicesIsSuccess={servicesIsSuccess} services={services} />
        </VStack>
    );
};

export default GSPView;
