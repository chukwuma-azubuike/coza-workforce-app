// import { VStack } from 'native-base';
import React from 'react';
import { IService } from '@store/types';
import TabComponent from '@components/composite/tabs';
import { SceneMap } from 'react-native-tab-view';
import ChurchGrowth from './church-growth';
import ViewWrapper from '@components/layout/viewWrapper';
import WorkforceAnalytics from './workforce-analytics';
// import WorkForceSummary from './workforce-summary';

interface GSPViewProps {
    servicesIsSuccess: boolean;
    services: IService[];
}

const GSPView: React.FC<GSPViewProps> = ({ services, servicesIsSuccess }) => {
    const ROUTES = [
        { key: 'churchGrowth', title: 'Church Growth' },
        { key: 'workforce', title: 'Workforce' },
    ];

    const renderScene = SceneMap({
        churchGrowth: ChurchGrowth,
        workforce: WorkforceAnalytics,
    });

    const [index, setIndex] = React.useState(0);

    return (
        <ViewWrapper>
            <TabComponent
                tabBarScroll={false}
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: ROUTES }}
            />
            {/* <WorkForceSummary servicesIsSuccess={servicesIsSuccess} services={services} /> */}
        </ViewWrapper>
    );
};

export default React.memo(GSPView);
