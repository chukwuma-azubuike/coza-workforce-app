import { Text } from '~/components/ui/text';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SceneMap } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabComponent from '@components/composite/tabs';
import ErrorBoundary from '@components/composite/error-boundary';
import useRole from '@hooks/role';
import { THEME_CONFIG } from '@config/appConfig';
import { GroupPermissionsList } from '~/views/app/permissions/permissions-list';
import { GroupHeadReportSummary } from '~/views/app/home/campus-pastors/report-summary';
import { useGetLatestServiceQuery } from '@store/services/services';
import useScreenFocus from '@hooks/focus';

const C = {
    primary: THEME_CONFIG.primary,
    ink: '#18181B',
    muted: '#71717A',
    line: '#EBEBEF',
    warn: '#8A5200',
    warnBg: '#FBF1E0',
    bad: '#8A0019',
    badBg: '#FBE5E9',
    primaryLight: '#EFE6F7',
};

// ─── Permissions tab ──────────────────────────────────────────────────────────
const PermissionsTab: React.FC = memo(() => (
    <ErrorBoundary>
        <GroupPermissionsList />
    </ErrorBoundary>
));

// ─── Reports tab ──────────────────────────────────────────────────────────────
const ReportsTab: React.FC = memo(() => {
    const { user } = useRole();
    const { data: latestService, refetch } = useGetLatestServiceQuery(user?.campus?._id as string, {
        skip: !user?.campus?._id,
    });

    useScreenFocus({ onFocus: refetch });

    return (
        <ErrorBoundary>
            <GroupHeadReportSummary
                serviceId={latestService?._id}
                refetchService={refetch}
            />
        </ErrorBoundary>
    );
});

// ─── Reviews tab (placeholder) ────────────────────────────────────────────────
const ReviewsTab: React.FC = memo(() => (
    <View className="flex-1 items-center justify-center px-8 py-12">
        <View
            style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: C.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
            }}
        >
            <Ionicons name="book-outline" size={28} color={C.primary} />
        </View>
        <Text
            style={{
                fontSize: 16,
                fontWeight: '700',
                color: C.ink,
                textAlign: 'center',
                marginBottom: 8,
            }}
        >
            Word Reviews
        </Text>
        <Text
            style={{
                fontSize: 13,
                color: C.muted,
                textAlign: 'center',
                lineHeight: 20,
            }}
        >
            HOD weekly word submissions will appear here for review and acknowledgement.
        </Text>
    </View>
));

// ─── Main screen ──────────────────────────────────────────────────────────────
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
        <SafeAreaView className="flex-1" edges={['right', 'left']}>
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
