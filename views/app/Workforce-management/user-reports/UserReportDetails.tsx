import React, { useEffect } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';

import TabComponent from '@components/composite/tabs';
import { IAttendance, ITicket, IUser } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent from '@components/composite/flat-list';
import { TicketListRow } from '../../tickets/ticket-list';
import { useGetTicketsQuery } from '@store/services/tickets';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { MyAttendanceRow } from '../../attendance/row-components';
import { UserReportContext } from './context';
import UserProfileBrief from './UserProfile';
import Loading from '@components/atoms/loading';
import { Platform, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
const isAndroid = Platform.OS === 'android';

const UserTicketsList: React.FC<{ userId: IUser['_id'] }> = React.memo(({ userId }) => {
    const renderOwnTicketItem = React.useCallback(
        ({ item }: { item: ITicket; index: number }) => <TicketListRow type="own" {...item} />,
        []
    );

    const { data, isLoading, isFetching } = useGetTicketsQuery(
        { userId, limit: 20 },
        {
            skip: !userId,
            refetchOnMountOrArgChange: true,
        }
    );

    return (
        <ErrorBoundary>
            <FlatListComponent
                data={data || []}
                refreshing={isFetching}
                renderItemComponent={renderOwnTicketItem}
                isLoading={isLoading || isFetching}
            />
        </ErrorBoundary>
    );
});

const UserAttendanceList: React.FC<{ userId: IUser['_id'] }> = React.memo(({ userId }) => {
    const { data, isLoading, isFetching } = useGetAttendanceQuery(
        {
            limit: 20,
            userId,
        },
        { skip: !userId, refetchOnMountOrArgChange: true }
    );

    return (
        <ErrorBoundary>
            <FlatListComponent
                padding={isAndroid ? 3 : true}
                renderItemComponent={({ item }: { item: IAttendance; index: number }) => (
                    <MyAttendanceRow item={item} index={0} />
                )}
                data={data as IAttendance[]}
                isLoading={isLoading || isFetching}
                refreshing={isLoading || isFetching}
                ListFooterComponentStyle={{ marginVertical: 20 }}
            />
        </ErrorBoundary>
    );
});

const ROUTES = [
    { key: 'userAttendance', title: 'Attendance' },
    { key: 'userTickets', title: 'Tickets' },
];

const UserReportDetails: React.FC<{ userId?: string; defaultUserId?: string } | undefined> = props => {
    const { userId: contextUserId, setUserId } = React.useContext(UserReportContext);
    const params = useLocalSearchParams<{ userId: string }>();
    const userId = params?.userId ?? contextUserId ?? (props?.userId as string);

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'userTickets':
                return <UserTicketsList userId={userId} />;
            case 'userAttendance':
                return <UserAttendanceList userId={userId} />;
            default:
                return null;
        }
    };

    const [index, setIndex] = React.useState(0);

    useEffect(() => {
        if (!userId && !!setUserId) {
            setUserId(props?.defaultUserId);
        }
    }, [userId, props?.defaultUserId]);

    return (
        <ViewWrapper className="flex-1">
            {!userId ? (
                <Loading className="flex-1" cover />
            ) : (
                <View className="flex-1">
                    <UserProfileBrief userId={userId} />
                    <TabComponent
                        onIndexChange={setIndex}
                        renderScene={renderScene}
                        navigationState={{ index, routes: ROUTES }}
                    />
                </View>
            )}
        </ViewWrapper>
    );
};

export default UserReportDetails;
