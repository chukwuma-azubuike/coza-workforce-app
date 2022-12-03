import { useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, {
    IFlatListColumn,
} from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IPermission } from '../../../store/types';
import Utils from '../../../utils';
import PermissionStats from './permission-stats';

interface IPermissionListRowProps extends IPermission {
    type: 'own' | 'team' | 'campus';
}

const PermissionListRow: React.FC<IPermissionListRowProps> = props => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Permission Details', props);
    };

    const {
        type,
        status,
        comment,
        endDate,
        category,
        requestor,
        startDate,
        dateCreated,
        description,
    } = props;

    const {
        lastName,
        firstName,
        pictureUrl,
        department: { name: departmentName },
    } = requestor;

    return (
        <TouchableNativeFeedback
            disabled={false}
            delayPressIn={0}
            style={{ flex: 1 }}
            onPress={handlePress}
            accessibilityRole="button"
            background={TouchableNativeFeedback.Ripple(
                THEME_CONFIG.veryLightGray,
                true,
                220
            )}
        >
            <VStack w="full" flex={1}>
                <Text borderBottomWidth={0.2} borderBottomColor="gray.300">
                    {dateCreated}
                </Text>
                <HStack w="full" flex={1} mt={3} alignItems="center" space={2}>
                    <AvatarComponent imageUrl={pictureUrl} />
                    <VStack w="full" flex={1}>
                        <Text bold>
                            {Utils.capitalizeFirstChar(
                                type === 'own'
                                    ? category
                                    : type === 'team'
                                    ? `${firstName} ${lastName}`
                                    : `${firstName} ${lastName} (${departmentName})`
                            )}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                            {description}
                        </Text>
                    </VStack>
                    <StatusTag>{status}</StatusTag>
                </HStack>
            </VStack>
        </TouchableNativeFeedback>
    );
};

const TEST_DATA = [
    {
        status: 'APPROVED',
        comment: 'Feel free to take as long as you need ma. Congrats again',
        category: 'maternity',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '12-10-2022',
        description: 'Going to the US for my PHD defence.',
        requestor: {
            lastName: 'Qudus',
            firstName: 'Abayomi',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Sparkles' },
        },
    },
    {
        status: 'PENDING',
        category: 'education',
        requestor: {
            lastName: 'Qudus',
            firstName: 'Johnson',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Sound' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '02-09-2022',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'vacation',
        requestor: {
            lastName: 'Tife',
            firstName: 'Okeke',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Security' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '15-07-2022',
        description: 'Going to the US for my PHD defence.',
        comment:
            'Stay connected via all out social media platforms. Blessings.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        requestor: {
            lastName: 'Kolawole',
            firstName: 'Yemi',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Media' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '17-06-2022',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'work',
        requestor: {
            lastName: 'Chinedu',
            firstName: 'Ephraim',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Avalanche' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '24-04-2022',
        description: 'Going to the US for my PHD defence.',
        comment: 'I do not think it should be for this long.',
    },
    {
        status: 'DECLINED',
        category: 'medical',
        requestor: {
            lastName: 'Smith',
            firstName: 'Jafar',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Hosts and Hostesses' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '30-03-2022',
        description: 'Going to the US for my PHD defence.',
        comment: 'You call in sick too often.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        requestor: {
            lastName: 'Oyeleye',
            firstName: 'Biola',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Child Care' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '09-03-2022',
        description: 'Going to the US for my PHD defence.',
        comment: '',
    },
    {
        status: 'PENDING',
        category: 'education',
        requestor: {
            lastName: 'Okigwe',
            firstName: 'Samuel',
            pictureUrl: 'https://bit.ly/3AdGvvM',
            department: { name: 'Avalanche' },
        },
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '19-02-2022',
        description: 'Going to the US for my PHD defence.',
    },
];

const MyPermissionsList: React.FC = () => {
    const myPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => (
                <PermissionListRow type="own" {..._} key={key} />
            ),
        },
    ];

    return (
        <>
            <PermissionStats total={5} pending={1} declined={0} approved={4} />
            <FlatListComponent
                columns={myPermissionsColumns}
                data={TEST_DATA}
            />
        </>
    );
};

const MyTeamPermissionsList: React.FC = () => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => (
                <PermissionListRow type="team" {..._} key={key} />
            ),
        },
    ];

    return (
        <>
            <PermissionStats
                total={21}
                pending={2}
                declined={4}
                approved={15}
            />
            <FlatListComponent
                columns={teamPermissionsColumns}
                data={TEST_DATA}
            />
        </>
    );
};

const CampusPermissions: React.FC = () => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => (
                <PermissionListRow type="campus" {..._} key={key} />
            ),
        },
    ];

    return (
        <>
            <PermissionStats
                total={67}
                pending={17}
                declined={15}
                approved={35}
            />
            <FlatListComponent
                columns={teamPermissionsColumns}
                data={TEST_DATA}
            />
        </>
    );
};

export { MyPermissionsList, MyTeamPermissionsList, CampusPermissions };
