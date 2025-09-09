import React, { useEffect } from 'react';
import ViewWrapper from '@components/layout/viewWrapper';

import TabComponent from '@components/composite/tabs';
import { IAttendance, ITicket, IUser } from '@store/types';
import ErrorBoundary from '@components/composite/error-boundary';
import FlatListComponent, { IFlatListColumn } from '@components/composite/flat-list';
import { TicketListRow } from '../../tickets/ticket-list';
import { useGetTicketsQuery } from '@store/services/tickets';
import { useGetAttendanceQuery } from '@store/services/attendance';
import { myAttendanceColumns } from '../../attendance/flatListConfig';
import { UserReportContext } from './context';
import UserProfileBrief from './UserProfile';
import Loading from '@components/atoms/loading';
import useScreenFocus from '@hooks/focus';
import { Platform, View } from 'react-native';
const isAndroid = Platform.OS === 'android';

const UserTicketsList: React.FC<{ userId: IUser['_id'] }> = React.memo(({ userId }) => {
    const ticketColumns: IFlatListColumn[] = [
        {
            dataIndex: '_id',
            render: (_: ITicket, key) => <TicketListRow type="own" {..._} key={key} />,
        },
    ];

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
                columns={ticketColumns}
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
                columns={myAttendanceColumns}
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
    const { userId: contextUserId } = React.useContext(UserReportContext);
    const userId = contextUserId || (props?.userId as string);

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

    const { setUserId } = React.useContext(UserReportContext);

    useScreenFocus({
        onFocus: () => {
            !props?.userId && setUserId(undefined);
        },
    });

    useEffect(() => {
        if (!userId && !!setUserId) {
            setUserId(props?.defaultUserId);
        }
    }, [userId, props?.defaultUserId]);

    return (
        <ViewWrapper className="flex-auto">
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
