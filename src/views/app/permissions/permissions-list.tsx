import { HStack, Tag, Text, VStack } from 'native-base';
import React from 'react';
import AvatarComponent from '../../../components/atoms/avatar';
import FlatListComponent, {
    IFlatListColumn,
} from '../../../components/composite/flat-list';
import { IStatus } from '../../../store/types';
import Utils from '../../../utils';
import PermissionStats from './permission-stats';

interface IPermissionListRow {
    dateCreated: string;
    startDate: string;
    endDate: string;
    description: string;
    category: string;
    status: IStatus;
    name?: string;
    imageUrl: string;
    department?: string;
}
const PermissionListRow: React.FC<IPermissionListRow> = ({
    name,
    status,
    endDate,
    category,
    startDate,
    imageUrl,
    department,
    dateCreated,
    description,
}) => {
    return (
        <VStack w="full" flex={1}>
            <Text borderBottomWidth={0.2} borderBottomColor="gray.300">
                {dateCreated}
            </Text>
            <HStack w="full" flex={1} mt={3} alignItems="center" space={2}>
                <AvatarComponent imageUrl={imageUrl} />
                <VStack w="full" flex={1}>
                    <Text bold>
                        {Utils.capitalizeFirstChar(name ? name : category)}
                        {department && ` (${department})`}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        {description}
                    </Text>
                </VStack>
                <Tag
                    size="sm"
                    bgColor={
                        status === 'APPROVED'
                            ? 'success.100'
                            : status === 'PENDING'
                            ? 'gray.100'
                            : 'error.100'
                    }
                    _text={{
                        _light: {
                            color:
                                status === 'APPROVED'
                                    ? 'success.600'
                                    : status === 'PENDING'
                                    ? 'gray.600'
                                    : 'error.600',
                            fontSize: 'xs',
                        },
                        _dark: {
                            color:
                                status === 'APPROVED'
                                    ? 'success.600'
                                    : status === 'PENDING'
                                    ? 'gray.600'
                                    : 'error.600',
                            fontSize: 'xs',
                        },
                    }}
                >
                    {Utils.capitalizeFirstChar(status.toLowerCase())}
                </Tag>
            </HStack>
        </VStack>
    );
};

const TEST_DATA = [
    {
        status: 'APPROVED',
        category: 'maternity',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '12-10-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'PENDING',
        category: 'education',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '02-09-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'vacation',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '15-07-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '17-06-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'work',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '24-04-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'medical',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '30-03-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '09-03-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'PENDING',
        category: 'education',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '19-02-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
];

const MyPermissionsList: React.FC = () => {
    const myPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermissionListRow, key) => (
                <PermissionListRow {..._} key={key} />
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

const TEAM_TEST_DATA = [
    {
        status: 'APPROVED',
        category: 'maternity',
        name: 'Qudus Abayomi',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '12-10-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'PENDING',
        category: 'education',
        name: 'Tope Johnson',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '02-09-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'vacation',
        name: 'Tife Okeke',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '15-07-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        name: 'Yemi Kolawole',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '17-06-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'work',
        name: 'Ephraim Chinedu',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '24-04-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'medical',
        name: 'Jafar Smith',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '30-03-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        name: 'Biola Oyeleye',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '09-03-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'PENDING',
        category: 'education',
        name: 'Samuel Okigwe',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '19-02-2022',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
];

const MyTeamPermissionsList: React.FC = () => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermissionListRow, key) => (
                <PermissionListRow {..._} key={key} />
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
                data={TEAM_TEST_DATA}
            />
        </>
    );
};

const CAMPUS_TEST_DATA = [
    {
        status: 'APPROVED',
        category: 'maternity',
        name: 'Qudus Abayomi',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '12-10-2022',
        department: 'Ushery',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'PENDING',
        category: 'education',
        name: 'Tope Johnson',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '02-09-2022',
        department: 'Avalanche',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'vacation',
        name: 'Tife Okeke',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '15-07-2022',
        department: 'Protocol',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        name: 'Yemi Kolawole',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '17-06-2022',
        department: 'Avalanche',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'work',
        name: 'Ephraim Chinedu',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '24-04-2022',
        department: 'Witty Inventions',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'DECLINED',
        category: 'medical',
        name: 'Jafar Smith',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '30-03-2022',
        department: 'Host and Hostesses',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'APPROVED',
        category: 'education',
        name: 'Biola Oyeleye',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '09-03-2022',
        department: 'Sparkles',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
    {
        status: 'PENDING',
        category: 'education',
        name: 'Samuel Okigwe',
        endDate: '19-11-2022',
        startDate: '04-11-2022',
        dateUpdated: '16-10-2022',
        dateCreated: '19-02-2022',
        department: 'Sound',
        imageUrl: 'https://bit.ly/3AdGvvM',
        description: 'Going to the US for my PHD defence.',
    },
];

const CampusPermissions: React.FC = () => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermissionListRow, key) => (
                <PermissionListRow {..._} key={key} />
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
                data={CAMPUS_TEST_DATA}
            />
        </>
    );
};

export { MyPermissionsList, MyTeamPermissionsList, CampusPermissions };
