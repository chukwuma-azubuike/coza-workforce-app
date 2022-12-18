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
            <Heading size="sm">{heading}:</Heading>
            <Text ml="2" fontWeight="400" color="gray.400">
                {detail}
            </Text>
        </Stack>
    );
};

export default UserInfo;
