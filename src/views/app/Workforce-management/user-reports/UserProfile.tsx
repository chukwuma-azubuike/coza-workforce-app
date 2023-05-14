import { Heading, HStack, VStack } from 'native-base';
import React from 'react';
import AvatarComponent from '../../../../components/atoms/avatar';
import If from '../../../../components/composite/if-container';
import { ProfileSkeletonMini } from '../../../../components/layout/skeleton';
import { AVATAR_FALLBACK_URL } from '../../../../constants';
import { useGetUserByIdQuery } from '../../../../store/services/account';
import { IUser } from '../../../../store/types';

const UserProfileBrief: React.FC<{ userId: IUser['_id'] }> = ({ userId }) => {
    const { data: user, isLoading, isFetching } = useGetUserByIdQuery(userId);

    return (
        <HStack pb={8} mb={4}>
            <If condition={isLoading || isFetching}>
                <ProfileSkeletonMini />
            </If>
            <If condition={!!user && !isLoading && !isFetching}>
                <HStack space={6} alignItems="center">
                    <AvatarComponent mt={4} size="2xl" shadow={9} imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                    <VStack mt="4" space={2}>
                        <HStack space={2}>
                            <Heading textAlign="center" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                                {user?.firstName}
                            </Heading>
                            <Heading textAlign="center" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                                {user?.lastName}
                            </Heading>
                        </HStack>
                        <Heading size="md" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                            {user?.department?.departmentName}
                        </Heading>
                        <Heading size="md" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                            {user?.campus.campusName}
                        </Heading>
                        <Heading size="md" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                            {user?.phoneNumber}
                        </Heading>
                    </VStack>
                </HStack>
            </If>
        </HStack>
    );
};

export default UserProfileBrief;
