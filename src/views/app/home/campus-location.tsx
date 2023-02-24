import { Icon } from '@rneui/base';
import { Center, Flex, Text } from 'native-base';
import React from 'react';
import { HomeContext } from '.';
import { THEME_CONFIG } from '../../../config/appConfig';

const CampusLocation = () => {
    const {
        latestService: { data, isError, isLoading },
    } = React.useContext(HomeContext);

    return (
        <Center>
            <Flex alignItems="center" flexDirection="row">
                <Icon
                    color={!isError && !isLoading ? THEME_CONFIG.gray : 'transparent'}
                    name="location-sharp"
                    type="ionicon"
                    size={15}
                />
                <Text fontWeight="semibold" color="gray.600" fontSize="md" ml={1}>
                    {!isError ? data?.campus.campusName : ''}
                </Text>
            </Flex>
        </Center>
    );
};

export default CampusLocation;
