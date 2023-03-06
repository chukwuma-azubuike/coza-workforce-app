import React from 'react';
import { Icon } from '@rneui/base';
import { Flex, HStack, Text } from 'native-base';
import { THEME_CONFIG } from '../../../../config/appConfig';

const CampusTicketSummary: React.FC<{ tickets?: number }> = ({ tickets }) => {
    return (
        <HStack alignItems="baseline" mt={4}>
            <Flex alignItems="center" flexDirection="row">
                <Icon
                    name="ticket-confirmation-outline"
                    color={THEME_CONFIG.rose}
                    type="material-community"
                    size={18}
                />
                <Text color="gray.400" fontSize="md" ml={2}>
                    Tickets issued:
                </Text>
            </Flex>
            <Flex alignItems="baseline" flexDirection="row">
                <Text fontWeight="semibold" color="rose.400" fontSize="5xl" ml={1}>{`${tickets || 0}`}</Text>
            </Flex>
        </HStack>
    );
};

export { CampusTicketSummary };
