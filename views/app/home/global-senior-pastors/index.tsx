// import { VStack } from 'native-base';
import React from 'react';
import { IService } from '@store/types';
// import TabComponent from '@components/composite/tabs';
// import { SceneMap } from 'react-native-tab-view';
// import ChurchGrowth from './church-growth';
// import WorkforceAnalytics from './workforce-analytics';
import WorkForceSummary from './workforce-summary';
import { SafeAreaView, View } from 'react-native';

interface GSPViewProps {
    servicesIsSuccess: boolean;
    services: IService[];
}

const GSPView: React.FC<GSPViewProps> = ({ services, servicesIsSuccess }) => {
    // TODO: Return if analytics is needed
    // const ROUTES = [
    //     { key: 'churchGrowth', title: 'Church Growth' },
    //     { key: 'workforce', title: 'Workforce' },
    // ];

    // const renderScene = SceneMap({
    //     churchGrowth: ChurchGrowth,
    //     workforce: WorkforceAnalytics,
    // });

    // const [index, setIndex] = React.useState(0);

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1">
                {/* <TabComponent
                tabBarScroll={false}
                onIndexChange={setIndex}
                renderScene={renderScene}
                navigationState={{ index, routes: ROUTES }}
            /> */}
                <WorkForceSummary servicesIsSuccess={servicesIsSuccess} services={services} />
            </View>
        </SafeAreaView>
    );
};

export default React.memo(GSPView);
