import React from 'react';
import { Icon } from '@rneui/base';
import { Flex, HStack, Text } from 'native-base';
import { THEME_CONFIG } from '../../../../config/appConfig';
import useRole from '../../../../hooks/role';
import { useGetLatestServiceQuery } from '../../../../store/services/services';
import useScreenFocus from '../../../../hooks/focus';
import { useGetCampusTicketReportQuery } from '../../../../store/services/tickets';

const CampusTicketSummary: React.FC = () => {
    const {
        user: { campus },
    } = useRole();

    const { data: latestService } = useGetLatestServiceQuery(campus?._id as string);

    const { data: tickets, refetch } = useGetCampusTicketReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus._id,
    });

    useScreenFocus({
        onFocus: refetch,
    });

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
                    Ticket(s) issued:
                </Text>
            </Flex>
            <Flex alignItems="baseline" flexDirection="row">
                <Text fontWeight="semibold" color="rose.400" fontSize="5xl" ml={1}>{`${tickets || 0}`}</Text>
            </Flex>
        </HStack>
    );
};

export { CampusTicketSummary };
