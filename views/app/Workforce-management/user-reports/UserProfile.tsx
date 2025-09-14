import React from 'react';
import { View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import If from '@components/composite/if-container';
import { ProfileSkeletonMini } from '@components/layout/skeleton';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useGetUserByIdQuery } from '@store/services/account';
import { IUser } from '@store/types';
import Utils from '@utils/index';
import { Text } from '~/components/ui/text';

const UserProfileBrief: React.FC<{ userId: IUser['_id']; isMobileView?: boolean }> = ({ userId }) => {
    const { data: user, isLoading, isFetching } = useGetUserByIdQuery(userId);

    return (
        <View className="py-4 min-h-[10rem] md:min-h-[16rem]">
            <If condition={isLoading || isFetching}>
                <ProfileSkeletonMini />
            </If>
            <If condition={!!user && !isLoading && !isFetching}>
                <View className="gap-4 items-center flex-row">
                    <AvatarComponent
                        alt="profile-pic"
                        className="w-32 h-32 md:w-56 md:h-56"
                        imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <View className="gap-1 flex-auto">
                        <View className="gap-1">
                            <Text className="font-bold text-2xl md:text-4xl">
                                {user && Utils.capitalizeFirstChar(user?.firstName)}{' '}
                                {user && Utils.capitalizeFirstChar(user?.lastName)}
                            </Text>
                        </View>
                        <Text className="text-muted-foreground md:text-2xl">{user?.department?.departmentName}</Text>
                        <Text className="text-muted-foreground md:text-2xl">{user?.campus.campusName}</Text>
                        <Text className="text-muted-foreground md:text-2xl">{user?.phoneNumber}</Text>
                    </View>
                </View>
            </If>
        </View>
    );
};

export default UserProfileBrief;
