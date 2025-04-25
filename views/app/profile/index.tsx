import { Text } from '~/components/ui/text';
import { Icon } from '@rneui/themed';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import UserInfo from '@components/atoms/user-info';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import Utils from '@utils/index';
import DeviceInfo from 'react-native-device-info';
import { AVATAR_FALLBACK_URL, S3_BUCKET_FOLDERS } from '@constants/index';
import { useAuth } from '@hooks/auth';
import { IEditProfilePayload } from '@store/types';
import { useUpdateUserMutation } from '@store/services/account';
import StatusTag from '@components/atoms/status-tag';
import APP_ENV from '@config/envConfig';
import { router } from 'expo-router';
import useUploader from '~/hooks/use-uploader';
import capitalize from 'lodash/capitalize';

const Profile: React.FC = () => {
    const { user, isGlobalPastor } = useRole();

    const { logOut } = useAuth();

    const handleLogout = () => {
        logOut();
    };

    const handleEdit = useCallback(
        (key: string, value: any) => () => {
            router.push({ pathname: '/profile/edit-profile', params: { [key]: value } });
        },
        []
    );

    const [updateUser, { isLoading: updateIsLoading }] = useUpdateUserMutation();

    const { pickImage, isUploading, error } = useUploader({
        user,
        type: 'gallery',
        s3Folder: S3_BUCKET_FOLDERS.profile_pictures,
        onUploadSuccess: async pictureUrl => {
            await updateUser({ pictureUrl, _id: user?._id } as IEditProfilePayload);
        },
        allowedTypes: ['image/*'],
    });

    const isProfilePictureLoading = updateIsLoading || isUploading;

    return (
        <View className="flex-1">
            <ScrollView className="px-4 pt-6 pb-12">
                <View className="pb-8 items-center">
                    <TouchableOpacity activeOpacity={0.7} onPress={pickImage} disabled={updateIsLoading || isUploading}>
                        <AvatarComponent
                            alt="current-user-avatar"
                            lastName={user?.lastName}
                            firstName={user?.firstName}
                            error={JSON.stringify(error)}
                            className="w-32 h-32 shadow-sm"
                            isLoading={isProfilePictureLoading}
                            imageUrl={user?.pictureUrl ? user.pictureUrl : AVATAR_FALLBACK_URL}
                        />
                        <Text className="absolute bottom-4 left-6 bg-black/50 text-white rounded-lg text-sm px-2">
                            {user?.pictureUrl ? 'Edit' : 'Add'} photo
                        </Text>
                    </TouchableOpacity>
                    <View className="gap-1 py-2">
                        <View
                            style={{
                                justifyContent: 'space-around',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <View>
                                <Text
                                    className="text-center font-bold text-2xl"
                                    onPress={handleEdit('firstName', user?.firstName)}
                                >
                                    {user?.firstName}
                                </Text>
                            </View>
                            <Text
                                className="text-center font-bold text-2xl"
                                onPress={handleEdit('lastName', user?.lastName)}
                            >
                                {user?.lastName}
                            </Text>
                            <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
                        </View>
                        <Text className="font-bold text-muted-foreground text-center">{user?.campus?.campusName}</Text>
                        <Text className="text-center text-muted-foreground">
                            {isGlobalPastor ? 'Global Senior Pastor' : user?.department?.departmentName}
                        </Text>
                    </View>
                </View>
                <View className="mb-4 px-4 py-4 bg-muted-background rounded-2xl border border-gray-300 dark:border-border">
                    <View className="p-0 justify-start flex-row">
                        <Icon size={22} name="person" type="Ionicons" color={THEME_CONFIG.lightGray} />
                        <Text className="ml-4 text-muted-foreground">User Info</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 4 }}>
                    <View className="items-center justify-between my-2 flex-row">
                        <Text className="font-bold text-muted-foreground">CGWC Status</Text>
                        <StatusTag>{(user?.isCGWCApproved ? 'APPROVED' : 'UNAPPROVED') as any}</StatusTag>
                    </View>
                    <UserInfo heading="Role" name="role" value={user?.role.name} />
                    <UserInfo heading="Address" name="address" value={user?.address} />
                    <UserInfo heading="Email" isEditable={false} name="email" value={user?.email} />
                    <UserInfo heading="Phone" name="phoneNumber" value={user?.phoneNumber} />
                    <UserInfo heading="Next of kin" name="nextOfKin" value={user?.nextOfKin} />
                    <UserInfo heading="Occupation" name="occupation" value={user?.occupation} />
                    <UserInfo heading="Place of work" name="placeOfWork" value={user?.placeOfWork} />
                    <UserInfo heading="Gender" name="gender" value={user?.gender} />
                    <UserInfo
                        name="maritalStatus"
                        heading="Marital Status"
                        value={Utils.capitalizeFirstChar(user?.maritalStatus || '')}
                    />
                    <UserInfo
                        name="birthDay"
                        heading="Birthday"
                        dateString={user.birthDay}
                        value={dayjs(user?.birthDay).format('DD MMM')}
                    />
                </View>
                <TouchableOpacity activeOpacity={0.6} onPress={handleLogout}>
                    <View className="px-4 mt-4 py-4 bg-muted-background rounded-2xl border border-gray-300 dark:border-border">
                        <View className="flex-row">
                            <Icon size={22} name="logout" type="Ionicons" color={THEME_CONFIG.lightGray} />
                            <Text className="ml-4">Logout</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <Text className="py-6 text-center text-muted-foreground">
                    Version {DeviceInfo.getVersion()} ({capitalize(APP_ENV.ENV)})
                </Text>
            </ScrollView>
        </View>
    );
};

export default React.memo(Profile);
