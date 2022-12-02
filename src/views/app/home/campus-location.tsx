import { Icon } from '@rneui/base';
import { Center, Flex, Text } from 'native-base';
import React from 'react';
import { THEME_CONFIG } from '../../../config/appConfig';

const CampusLocation = () => {
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
                    Lagos Campus
                </Text>
            </Flex>
        </Center>
    );
};

export default CampusLocation;
