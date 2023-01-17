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
                        color={THEME_CONFIG.primaryLight}
                        name="people-outline"
                        type="ionicon"
                        size={18}
                    />
                    <Text
                        ml={2}
                        fontSize="md"
                        _dark={{ color: 'gray.400' }}
                        _light={{ color: 'gray.600' }}
                    >
                        Members clocked in:
                    </Text>
                </Flex>
                <Flex alignItems="baseline" flexDirection="row">
                    <Text
                        fontWeight="semibold"
                        color="primary.500"
                        fontSize="4xl"
                        ml={1}
                    >{`${0}`}</Text>
                    <Text
                        fontSize="md"
                        fontWeight="semibold"
                        _dark={{ color: 'gray.400' }}
                        _light={{ color: 'gray.600' }}
                    >{`/${0}`}</Text>
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
                        >{`${0}`}</Text>
                        <Text
                            fontWeight="semibold"
                            color="gray.600"
                            fontSize="md"
                        >{`/${0}`}</Text>
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
                        >{`${0}`}</Text>
                        <Text
                            fontWeight="semibold"
                            color="gray.600"
                            fontSize="md"
                        >{`/${0}`}</Text>
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
