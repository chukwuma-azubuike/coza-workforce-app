import React, { memo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap } from 'react-native-tab-view';

import TabComponent from '@components/composite/tabs';
import ErrorBoundary from '@components/composite/error-boundary';
import ApprovalsPermissions from './approvals-permissions';
import ApprovalsReports from './approvals-reports';
import ApprovalsReviews from './approvals-reviews';

const PermissionsTab: React.FC = memo(() => (
    <ErrorBoundary>
        <ApprovalsPermissions />
    </ErrorBoundary>
));

const ReportsTab: React.FC = memo(() => (
    <ErrorBoundary>
        <ApprovalsReports />
    </ErrorBoundary>
));

const ReviewsTab: React.FC = memo(() => (
    <ErrorBoundary>
        <ApprovalsReviews />
    </ErrorBoundary>
));

const ROUTES = [
    { key: 'permissions', title: 'Permissions' },
    { key: 'reports', title: 'Reports' },
    { key: 'reviews', title: 'Reviews' },
];

const renderScene = SceneMap({
    permissions: PermissionsTab,
    reports: ReportsTab,
    reviews: ReviewsTab,
});

const GHApprovals: React.FC = () => {
    const [index, setIndex] = useState(0);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['right', 'left']}>
            <View className="flex-1 pt-2">
                <TabComponent
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                    navigationState={{ index, routes: ROUTES }}
                    tabBarScroll={false}
                />
            </View>
        </SafeAreaView>
    );
};

export default GHApprovals;
