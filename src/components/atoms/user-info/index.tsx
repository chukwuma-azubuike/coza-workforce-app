import React from 'react';
import { Heading, Stack, Text } from 'native-base';
import Utils from '../../../utils';

interface IUserInfo {
    heading?: string;
    detail?: string;
}
const UserInfo = ({ heading, detail }: IUserInfo) => {
    return (
        <Stack
            ml={4}
            flexDirection="row"
            alignItems="center"
            justifyItems="center"
            my={2}
        >
            <Heading size="sm">{heading}:</Heading>
            <Text ml="2" flexWrap="wrap" fontWeight="400" color="gray.400">
                {detail && Utils.truncateString(detail, 40)}
            </Text>
        </Stack>
    );
};

export default UserInfo;
