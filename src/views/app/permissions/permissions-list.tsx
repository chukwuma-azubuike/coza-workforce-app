import { HStack, Tag, Text, VStack } from 'native-base';
import React from 'react';
import FlatListComponent, {
    IFlatListColumn,
} from '../../../components/composite/flat-list';
import Utils from '../../../utils';

interface IPermissionListRow {
    dateCreated: string;
    startDate: string;
    endDate: string;
    description: string;
    category: string;
    status: 'APPROVED' | 'UNAPPROVED' | 'PENDING';
}
const PermissionListRow: React.FC<IPermissionListRow> = ({
    status,
    endDate,
    category,
    startDate,
    dateCreated,
    description,
}) => {
    return (
        <VStack w="full" flex={1}>
            <Text bold borderBottomWidth={0.2} borderBottomColor="gray.300">
                {dateCreated}
            </Text>
            <HStack w="full" flex={1} mt={3} alignItems="center">
                <VStack w="full" flex={1}>
                    <Text bold>{Utils.capitalizeFirstChar(category)}</Text>
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
                            ? 'primary.100'
                            : 'error.100'
                    }
                    _text={{
                        _light: {
                            color:
                                status === 'APPROVED'
                                    ? 'success.600'
                                    : status === 'PENDING'
                                    ? 'primary.600'
                                    : 'error.600',
                            fontSize: 'xs',
                        },
                        _dark: {
                            color:
                                status === 'APPROVED'
                                    ? 'success.600'
                                    : status === 'PENDING'
                                    ? 'primary.600'
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

const PermissionsList: React.FC = () => {
    const TEST_DATA = [
        {
            status: 'APPROVED',
            category: 'maternity',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '12-10-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'PENDING',
            category: 'education',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '02-09-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'UNAPPROVED',
            category: 'vacation',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '15-07-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'APPROVED',
            category: 'education',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '17-06-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'APPROVED',
            category: 'work',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '24-04-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'UNAPPROVED',
            category: 'medical',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '30-03-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'APPROVED',
            category: 'education',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '09-03-2022',
            description: 'Going to the US for my PHD defence.',
        },
        {
            status: 'PENDING',
            category: 'education',
            endDate: '19-11-2022',
            startDate: '04-11-2022',
            dateUpdated: '16-10-2022',
            dateCreated: '19-02-2022',
            description: 'Going to the US for my PHD defence.',
        },
    ];

    const columns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermissionListRow, key) => (
                <PermissionListRow {..._} key={key} />
            ),
        },
    ];
    return <FlatListComponent columns={columns} data={TEST_DATA} />;
};

export default PermissionsList;
