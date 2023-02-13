import React from 'react';
import { Heading, Stack, Text } from 'native-base';
import Utils from '../../../utils';

interface IUserInfo {
    heading?: string;
    detail?: string;
}
const UserInfo = ({ heading, detail }: IUserInfo) => {
    return (
        <Stack ml={4} flexDirection="row" alignItems="center" justifyItems="center" my={2}>
            <Heading size="sm" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                {heading}:
            </Heading>
            <Text ml="2" flexWrap="wrap" fontWeight="400" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                {detail && Utils.truncateString(detail, 40)}
            </Text>
        </Stack>
    );
};

export default UserInfo;
