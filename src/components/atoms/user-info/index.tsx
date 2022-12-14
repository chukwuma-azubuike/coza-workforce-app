import React from 'react';
import { Heading, Stack, Text } from 'native-base';

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
            <Heading size="xs">{heading}:</Heading>
            <Text fontSize="xs" color="gray.500" fontWeight="500" ml="2">
                {detail}
            </Text>
        </Stack>
    );
};

export default UserInfo;
