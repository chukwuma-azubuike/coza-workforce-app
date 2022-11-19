import { HStack, Text, Center } from 'native-base';
import React from 'react';
import { VictoryPie } from 'victory-native';

const PermissionStats: React.FC = () => {
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
            <VictoryPie
                radius={80}
                data={data}
                innerRadius={70}
                colorScale="qualitative"
                labels={[
                    'Medical',
                    'Work',
                    'Education',
                    'Maternity',
                    'Vacation',
                    'Unused',
                ]}
            />
            <HStack justifyContent="space-evenly">
                <Center>
                    <Text color="gray.400" fontSize="xs">
                        Total permissions
                    </Text>
                    <Text bold color="primary.600" fontSize="2xl">
                        10
                    </Text>
                </Center>
                <Center>
                    <Text color="red.500" fontSize="xs">
                        Permissions used
                    </Text>
                    <Text bold color="red.500" fontSize="2xl">
                        4
                    </Text>
                </Center>
            </HStack>
        </>
    );
};

export default PermissionStats;
