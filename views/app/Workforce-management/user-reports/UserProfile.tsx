import { Heading } from 'native-base';
import React from 'react';
import { Platform, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import If from '@components/composite/if-container';
import { ProfileSkeletonMini } from '@components/layout/skeleton';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useGetUserByIdQuery } from '@store/services/account';
import { IUser } from '@store/types';
import Utils from '@utils/index';
const isAndroid = Platform.OS === 'android';

const UserProfileBrief: React.FC<{ userId: IUser['_id']; isMobileView?: boolean }> = ({
    userId,
    isMobileView = false,
}) => {
    const { data: user, isLoading, isFetching } = useGetUserByIdQuery(userId);

    return (
        <View pb={8} mb={4} className="px-undefined">
            <If condition={isLoading || isFetching}>
                <ProfileSkeletonMini />
            </If>
            <If condition={!!user && !isLoading && !isFetching}>
                <View space={6} alignItems="center">
                    <AvatarComponent mt={4} size="2xl" shadow={9} imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL} />
                    <View mt="4" width="80%" space={2}>
                        <View space={2}>
                            <Heading
                                flexWrap="wrap"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                _dark={{ color: 'gray.300' }}
                                _light={{ color: 'gray.700' }}
                                size={isMobileView ? 'md' : 'lg'}
                            >
                                {user && Utils.capitalizeFirstChar(user?.firstName)}{' '}
                                {user && Utils.capitalizeFirstChar(user?.lastName)}
                            </Heading>
                        </View>
                        <Heading
                            _dark={{ color: 'gray.300' }}
                            _light={{ color: 'gray.700' }}
                            size={isMobileView ? 'sm' : 'md'}
                        >
                            {user?.department?.departmentName}
                        </Heading>
                        <Heading
                            _dark={{ color: 'gray.300' }}
                            _light={{ color: 'gray.700' }}
                            size={isMobileView ? 'sm' : 'md'}
                        >
                            {user?.campus.campusName}
                        </Heading>
                        <Heading
                            _dark={{ color: 'gray.300' }}
                            _light={{ color: 'gray.700' }}
                            size={isMobileView ? 'sm' : 'md'}
                        >
                            {user?.phoneNumber}
                        </Heading>
                    </View>
                </View>
            </If>
        </View>
    );
};

export default UserProfileBrief;
