import React from 'react';
import { IService } from '@store/types';
import { SafeAreaView, View } from 'react-native';
import ErrorBoundary from '~/components/composite/error-boundary';
import GSPDashboard from './dashboard';

interface GSPViewProps {
    servicesIsSuccess: boolean;
    services: IService[];
}

/**
 * GSP home — the new Global Dashboard is the primary view. The legacy
 * single-service WorkForceSummary remains reachable as a drill-down
 * (`/gsp/service-report`) from inside the dashboard.
 */
const GSPView: React.FC<GSPViewProps> = () => {
    return (
        <ErrorBoundary>
            <SafeAreaView className="flex-1">
                <View className="flex-1">
                    <GSPDashboard />
                </View>
            </SafeAreaView>
        </ErrorBoundary>
    );
};

export default React.memo(GSPView);
