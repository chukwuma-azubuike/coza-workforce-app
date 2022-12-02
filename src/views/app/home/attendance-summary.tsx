import React from 'react';
import { Icon } from '@rneui/base';
import { Center, Flex, HStack, Text } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';

const AttendanceSummary: React.FC = () => {
    return (
        <Center>
            <HStack alignItems="baseline">
                <Flex alignItems="center" flexDirection="row">
                    <Icon
                        color={THEME_CONFIG.primary}
                        name="people-outline"
                        type="ionicon"
                        size={18}
                    />
                    <Text color="gray.400" fontSize="md" ml={2}>
                        Members clocked in:
                    </Text>
                </Flex>
                <Flex alignItems='baseline' flexDirection="row">
                    <Text
                        fontWeight="semibold"
                        color="primary.600"
                        fontSize="4xl"
                        ml={1}
                    >{`${9}`}</Text>
                    <Text
                        fontWeight="semibold"
                        color="gray.600"
                        fontSize="md"
                    >{`/${15}`}</Text>
                </Flex>
            </HStack>
        </Center>
    );
};

export default AttendanceSummary;
