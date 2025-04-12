import { Text } from "~/components/ui/text";
import { View } from "react-native";
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
        () => [...TEST_DATA, TOTAL_PERMITS_ALLOWED - TEST_DATA.reduce((a, b) => a + b)],
        [TEST_DATA]
    );

    return (
        <>
            <View
                borderTopWidth={0.2}
                borderColor="gray.300"
                borderBottomWidth={0.2}
                _light={{ bg: 'gray.50' }}
                _dark={{ bg: 'gray.950' }}
                justifyContent="space-evenly"
                className="py-2"
            >
                <View>
                    <Text color="primary.600" fontSize="sm">
                        Total
                    </Text>
                    <Text color="primary.600" fontSize="3xl" className="font-bold">
                        {total}
                    </Text>
                </View>
                <View>
                    <Text color="green.500" fontSize="sm">
                        Approved
                    </Text>
                    <Text color="green.500" fontSize="3xl" className="font-bold">
                        {approved}
                    </Text>
                </View>
                <View>
                    <Text color="red.600" fontSize="sm">
                        Declined
                    </Text>
                    <Text color="red.600" fontSize="3xl" className="font-bold">
                        {declined}
                    </Text>
                </View>
                <View>
                    <Text color="gray.500" fontSize="sm">
                        Pending
                    </Text>
                    <Text color="gray.500" fontSize="3xl" className="font-bold">
                        {pending}
                    </Text>
                </View>
            </View>
        </>
    );
};

export default React.memo(PermissionStats);
