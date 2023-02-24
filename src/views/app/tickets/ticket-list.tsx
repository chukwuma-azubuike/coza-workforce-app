import { useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo, useMemo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import useRole from '../../../hooks/role';
import { useGetDepartmentTicketsQuery, useGetUserTicketsQuery } from '../../../store/services/tickets';
import { ITicket } from '../../../store/types';
import Utils from '../../../utils';

interface TicketListRowProps extends ITicket {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: ITicket[];
}

const TicketListRow: React.FC<TicketListRowProps> = props => {
    const navigation = useNavigation();

    const { type } = props;

    return (
        <>
            {props[1]?.map((elm, idx) => {
                const handlePress = () => {
                    navigation.navigate('Ticket Details' as never, elm as never);
                };

                const {
                    status,
                    remarks,
                    ticketSummary,
                    contestComment,
                    contestReplyComment,
                    category: { categoryName },
                    department: { departmentName },
                    user: { firstName, lastName, pictureUrl },
                } = elm;

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(THEME_CONFIG.veryLightGray, false, 220)}
                    >
                        <HStack py={2} flex={1} key={idx} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={pictureUrl} />
                                <VStack justifyContent="space-between">
                                    <Text bold>
                                        {type === 'own'
                                            ? Utils.capitalizeFirstChar(categoryName)
                                            : type === 'team'
                                            ? `${Utils.capitalizeFirstChar(firstName)} ${Utils.capitalizeFirstChar(
                                                  lastName
                                              )}`
                                            : `${Utils.capitalizeFirstChar(firstName)} ${Utils.capitalizeFirstChar(
                                                  lastName
                                              )} (${Utils.capitalizeFirstChar(departmentName)})`}
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {Utils.truncateString(ticketSummary)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <StatusTag>{status}</StatusTag>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </>
    );
};

export const TEST_DATA = [
    {
        dateUpdated: '16-10-2022',
        createdAt: '12-10-2022',
        _id: 'jsdbisd899823910ua',
        user: { firstName: 'Ajnlekoko', lastName: 'Gbeinomi' } as any,
        remarks: '',
        isRetracted: false,
        ticketSummary: 'Oga.. you did something really bad.',
        status: 'ISSUED',
        contestComment: '',
        department: { departmentName: 'Protocol' } as any, // department object
        category: { categoryName: 'Loitering' } as any, // ticket category object
        contestReplyComment: 'How far now!',
        ticketType: 'INDIVIDUAL',
    },
    {
        dateUpdated: '16-10-2022',
        createdAt: '12-10-2022',
        _id: 'jsdbisd899823910ua',
        user: { firstName: 'Ajnlekoko', lastName: 'Gbeinomi' } as any,
        remarks: '',
        isRetracted: false,
        ticketSummary: 'Oga.. you did something really bad.',
        status: 'ISSUED',
        contestComment: '',
        department: { departmentName: 'Protocol' } as any, // department object
        category: { categoryName: 'Loitering' } as any, // ticket category object
        contestReplyComment: 'How far now!',
        ticketType: 'INDIVIDUAL',
    },
    {
        dateUpdated: '16-10-2022',
        createdAt: '12-10-2022',
        _id: 'jsdbisd899823910ua',
        user: { firstName: 'Ajnlekoko', lastName: 'Gbeinomi' } as any,
        remarks: '',
        isRetracted: false,
        ticketSummary: 'Oga.. you did something really bad.',
        status: 'ISSUED',
        contestComment: '',
        department: { departmentName: 'Protocol' } as any, // department object
        category: { categoryName: 'Loitering' } as any, // ticket category object
        contestReplyComment: 'How far now!',
        ticketType: 'INDIVIDUAL',
    },
    {
        dateUpdated: '16-10-2022',
        createdAt: '12-10-2022',
        _id: 'jsdbisd899823910ua',
        user: { firstName: 'Ajnlekoko', lastName: 'Gbeinomi' } as any,
        remarks: '',
        isRetracted: false,
        ticketSummary: 'Oga.. you did something really bad.',
        status: 'ISSUED',
        contestComment: '',
        department: { departmentName: 'Protocol' } as any, // department object
        category: { categoryName: 'Loitering' } as any, // ticket category object
        contestReplyComment: 'How far now!',
        ticketType: 'INDIVIDUAL',
    },
    {
        dateUpdated: '16-10-2022',
        createdAt: '12-10-2022',
        _id: 'jsdbisd899823910ua',
        user: { firstName: 'Ajnlekoko', lastName: 'Gbeinomi' } as any,
        remarks: '',
        isRetracted: false,
        ticketSummary: 'Oga.. you did something really bad.',
        status: 'ISSUED',
        contestComment: '',
        department: { departmentName: 'Protocol' } as any, // department object
        category: { categoryName: 'Loitering' } as any, // ticket category object
        contestReplyComment: 'How far now!',
        ticketType: 'INDIVIDUAL',
    },
];

const MyTicketsList: React.FC = memo(() => {
    const myTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: ITicket, key) => <TicketListRow type="own" {..._} key={key} />,
        },
    ];

    const { user } = useRole();

    const { data, isLoading, error, refetch } = useGetUserTicketsQuery(user.userId);

    const memoizedData = useMemo(() => Utils.groupListByKey(TEST_DATA, 'dateCreated'), [TEST_DATA]);

    return (
        <FlatListComponent refreshing={isLoading} onRefresh={refetch} columns={myTicketsColumns} data={memoizedData} />
    );
});

const MyTeamTicketsList: React.FC = memo(() => {
    const teamTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: ITicket, key) => <TicketListRow type="team" {..._} key={key} />,
        },
    ];

    const {
        user: { department },
    } = useRole();

    const { data, isLoading, error, refetch } = useGetDepartmentTicketsQuery(department._id);

    const memoizedData = useMemo(() => Utils.groupListByKey(TEST_DATA, 'category'), [TEST_DATA]);

    return (
        <FlatListComponent
            data={memoizedData}
            onRefresh={refetch}
            refreshing={isLoading}
            columns={teamTicketsColumns}
        />
    );
});

const CampusTickets: React.FC = memo(() => {
    const teamTicketsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: ITicket, key) => <TicketListRow type="campus" {..._} key={key} />,
        },
    ];

    const memoizedData = useMemo(() => Utils.groupListByKey(TEST_DATA, 'status'), [TEST_DATA]);

    return <FlatListComponent columns={teamTicketsColumns} data={memoizedData} />;
});

export { MyTicketsList, MyTeamTicketsList, CampusTickets };
