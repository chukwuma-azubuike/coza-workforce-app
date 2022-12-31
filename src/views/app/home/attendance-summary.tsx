import React from 'react';
import { Icon } from '@rneui/base';
import { Center, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';

const TeamAttendanceSummary: React.FC = () => {
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
                <Flex alignItems="baseline" flexDirection="row">
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

const CampusAttendanceSummary: React.FC = () => {
    return (
        <Center>
            <HStack alignItems="center" space={10}>
                <VStack alignItems="center">
                    <Flex alignItems="baseline" flexDirection="row">
                        <Text
                            fontWeight="semibold"
                            color="primary.600"
                            fontSize="4xl"
                            ml={1}
                        >{`${18}`}</Text>
                        <Text
                            fontWeight="semibold"
                            color="gray.600"
                            fontSize="md"
                        >{`/${26}`}</Text>
                    </Flex>
                    <Flex alignItems="center" flexDirection="row">
                        <Icon
                            color={THEME_CONFIG.primary}
                            name="people-outline"
                            type="ionicon"
                            size={18}
                        />
                        <Text color="gray.400" fontSize="md" ml={2}>
                            Leaders present
                        </Text>
                    </Flex>
                </VStack>
                <VStack alignItems="center">
                    <Flex alignItems="baseline" flexDirection="row">
                        <Text
                            fontWeight="semibold"
                            color="primary.600"
                            fontSize="4xl"
                            ml={1}
                        >{`${110}`}</Text>
                        <Text
                            fontWeight="semibold"
                            color="gray.600"
                            fontSize="md"
                        >{`/${165}`}</Text>
                    </Flex>
                    <Flex alignItems="center" flexDirection="row">
                        <Icon
                            color={THEME_CONFIG.primary}
                            type="material-community"
                            name="crowd"
                            size={18}
                        />
                        <Text color="gray.400" fontSize="md" ml={2}>
                            Workers present
                        </Text>
                    </Flex>
                </VStack>
            </HStack>
        </Center>
    );
};

export { TeamAttendanceSummary, CampusAttendanceSummary };
