import { HStack, Text, Center } from 'native-base';
import React from 'react';
interface IPermissionsStats {
    total: number;
    pending: number;
    declined: number;
    approved: number;
}

const PermissionStats: React.FC<IPermissionsStats> = props => {
    const { total, pending, declined, approved } = props;

    const TEST_DATA = [1, 2, 1, 1, 1];
    const TOTAL_PERMITS_ALLOWED = 10;

    const data = React.useMemo(
        () => [
            ...TEST_DATA,
            TOTAL_PERMITS_ALLOWED - TEST_DATA.reduce((a, b) => a + b),
        ],
        [TEST_DATA]
    );

    return (
        <>
            <HStack
                py={2}
                borderTopWidth={0.2}
                borderColor="gray.300"
                borderBottomWidth={0.2}
                _light={{ bg: 'gray.50' }}
                _dark={{ bg: 'gray.950' }}
                justifyContent="space-evenly"
            >
                <Center>
                    <Text color="primary.600" fontSize="sm">
                        Total
                    </Text>
                    <Text bold color="primary.600" fontSize="3xl">
                        {total}
                    </Text>
                </Center>
                <Center>
                    <Text color="green.500" fontSize="sm">
                        Approved
                    </Text>
                    <Text bold color="green.500" fontSize="3xl">
                        {approved}
                    </Text>
                </Center>
                <Center>
                    <Text color="red.600" fontSize="sm">
                        Declined
                    </Text>
                    <Text bold color="red.600" fontSize="3xl">
                        {declined}
                    </Text>
                </Center>
                <Center>
                    <Text color="gray.500" fontSize="sm">
                        Pending
                    </Text>
                    <Text bold color="gray.500" fontSize="3xl">
                        {pending}
                    </Text>
                </Center>
            </HStack>
        </>
    );
};

export default PermissionStats;
