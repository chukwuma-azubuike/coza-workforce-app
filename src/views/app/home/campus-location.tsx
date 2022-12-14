import { Icon } from '@rneui/base';
import { Center, Flex, Text } from 'native-base';
import React from 'react';
import { HomeContext } from '.';
import { THEME_CONFIG } from '../../../config/appConfig';

const CampusLocation = () => {
    const {
        latestService: { data },
    } = React.useContext(HomeContext);

    return (
        <Center>
            <Flex alignItems="center" flexDirection="row">
                <Icon
                    color={THEME_CONFIG.gray}
                    name="location-sharp"
                    type="ionicon"
                    size={15}
                />
                <Text
                    fontWeight="semibold"
                    color="gray.600"
                    fontSize="md"
                    ml={1}
                >
                    COZA Global
                </Text>
            </Flex>
        </Center>
    );
};

export default CampusLocation;
