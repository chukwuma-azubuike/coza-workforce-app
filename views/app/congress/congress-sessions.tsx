import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ViewWrapper from '@components/layout/viewWrapper';
import ErrorBoundary from '~/components/composite/error-boundary';
import SectionListComponent from '~/components/composite/section-list';
import { AddButtonComponent } from '@components/atoms/button';
import { Text } from '~/components/ui/text';
import { useGetServicesQuery } from '@store/services/services';
import { IService } from '@store/types';
import { parseApiDate } from '@utils/service-form';
import ServiceCard from '../service-management/components/service-card';
import CongressBanner, { useCongressWindow } from '../service-management/components/congress-banner';
import useServiceActions from '../service-management/use-service-actions';

/** Every session of one congress, by day, with create / edit / duplicate / delete. */
const CongressSessions: React.FC = () => {
    const { CGWCId } = useLocalSearchParams<{ CGWCId: string }>();
    const { congress, dayCount } = useCongressWindow(CGWCId);
    const { edit, showActions } = useServiceActions();

    const {
        data: sessions = [],
        isLoading,
        isFetching,
        refetch,
    } = useGetServicesQuery({ CGWCId, page: 1, limit: 100 }, { skip: !CGWCId });

    const orderedSessions = React.useMemo(
        () =>
            [...sessions].sort(
                (a, b) => (parseApiDate(a.serviceTime)?.valueOf() ?? 0) - (parseApiDate(b.serviceTime)?.valueOf() ?? 0)
            ),
        [sessions]
    );

    const daysCovered = React.useMemo(
        () => new Set(orderedSessions.map(session => parseApiDate(session.serviceTime)?.format('YYYY-MM-DD'))).size,
        [orderedSessions]
    );

    const cardProps = React.useMemo(
        () => ({
            hideDate: true,
            onEdit: (service: IService) => edit(service, CGWCId),
            onActions: (service: IService) => showActions(service, CGWCId),
        }),
        [edit, showActions, CGWCId]
    );

    const gotoCreateSession = () => {
        router.push({ pathname: '/service-management/create-service', params: { CongressId: CGWCId } });
    };

    const summary = !orderedSessions.length
        ? 'No sessions yet'
        : `${orderedSessions.length} session${orderedSessions.length === 1 ? '' : 's'} across ${daysCovered}${
              dayCount ? ` of ${dayCount}` : ''
          } day${(dayCount ?? daysCovered) === 1 ? '' : 's'}`;

    return (
        <ErrorBoundary>
            <ViewWrapper noPadding className="flex-1">
                <View className="gap-2 px-4 pt-4 pb-2">
                    <CongressBanner congress={congress} caption={summary} />
                    {!!orderedSessions.length && (
                        <Text className="text-xs text-muted-foreground">
                            Tap a session to edit it, or use ⋯ to duplicate it onto the next day or delete it.
                        </Text>
                    )}
                </View>
                <View className="flex-1">
                    <SectionListComponent
                        data={orderedSessions}
                        field="serviceTime"
                        headerDateFormat="dddd, DD MMM"
                        refetch={refetch}
                        itemHeight={92}
                        isLoading={isLoading || (isFetching && !sessions.length)}
                        column={ServiceCard as unknown as React.FC<IService>}
                        extraProps={cardProps}
                        emptyMessage={`No sessions yet. Tap + to add the first one${
                            congress?.startDate ? ` for ${parseApiDate(congress.startDate)?.format('DD MMM')}` : ''
                        }.`}
                    />
                </View>
                <AddButtonComponent className="!bottom-24 !right-8" onPress={gotoCreateSession} />
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(CongressSessions);
