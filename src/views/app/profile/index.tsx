import { Icon } from '@rneui/themed';
import moment from 'moment';
import { Heading } from 'native-base';
import React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import UserInfo from '@components/atoms/user-info';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import Utils from '@utils/index';
import DeviceInfo from 'react-native-device-info';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { useAuth } from '@hooks/auth';
import { ParamListBase } from '@react-navigation/native';
import { IEditProfilePayload } from '@store/types';
import useUpload from '@hooks/upload';
import { IMGBB_ALBUM_ID } from '@config/uploadConfig';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@store/services/account';
import { useAppDispatch } from '@store/hooks';
import { userActionTypes } from '@store/services/users';
import { useGetUserScoreQuery } from '@store/services/score';
import StatusTag from '@components/atoms/status-tag';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import VStackComponent from '@components/layout/v-stack';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import useAppColorMode from '@hooks/theme/colorMode';

const Profile: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const { user, isGlobalPastor } = useRole();

    const { logOut } = useAuth();
    const { navigate } = navigation;

    const dispatch = useAppDispatch();

    const handleLogout = () => {
        logOut();
    };

    const handleEdit = (key: string, value: any) => () => {
        let field: any = {};
        field[key] = value;
        navigate('Edit Profile', field);
    };

    const {
        isError: uploadIsError,
        error: uploadError,
        isSuccess: uploadIsSuccess,
        data: uploadData,
        initialise,
        loading: uploadLoading,
        reset,
    } = useUpload({
        albumId: IMGBB_ALBUM_ID.PROFILE_PICTURE,
    });

    const [
        updateUser,
        { reset: resetUpdate, isLoading: updateIsLoading, isError: updateIsError, isSuccess: updateIsSuccess },
    ] = useUpdateUserMutation();

    const { data: newUserData, refetch: refetchUser, isFetching: newUserDataLoading } = useGetUserByIdQuery(user?._id);

    const { data: score } = useGetUserScoreQuery(user?._id);

    const handleProfilePicture = () => {
        initialise();
    };

    React.useEffect(() => {
        if (uploadIsSuccess) {
            reset();
        }

        if (uploadIsError) {
            reset();
        }
    }, [uploadIsError, uploadIsSuccess]);

    React.useEffect(() => {
        if (uploadIsSuccess && uploadData?.display_url) {
            updateUser({ pictureUrl: uploadData?.display_url, _id: user?._id } as IEditProfilePayload);
        }
    }, [uploadIsSuccess]);

    React.useEffect(() => {
        if (updateIsSuccess) {
            refetchUser();
        }
    }, [updateIsSuccess, updateIsError]);

    React.useEffect(() => {
        if (newUserData) {
            dispatch({
                type: userActionTypes.SET_USER_DATA,
                payload: newUserData,
            });
        }
    }, [newUserData]);

    const { backgroundColor } = useAppColorMode();

    return (
        <ViewWrapper
            scroll
            onRefresh={refetchUser}
            refreshing={newUserDataLoading}
            style={{ paddingVertical: 20, paddingHorizontal: 20 }}
        >
            <VStackComponent style={{ paddingBottom: 32 }}>
                <VStackComponent style={{ paddingBottom: 8, alignItems: 'center' }}>
                    <Pressable
                        style={{ maxHeight: 114 }}
                        onPress={handleProfilePicture}
                        disabled={newUserDataLoading || updateIsLoading || uploadLoading}
                    >
                        <AvatarComponent
                            size="xl"
                            shadow={9}
                            error={uploadError}
                            lastName={user?.lastName}
                            firstName={user?.firstName}
                            isLoading={newUserDataLoading || updateIsLoading || uploadLoading}
                            imageUrl={user?.pictureUrl ? user.pictureUrl : AVATAR_FALLBACK_URL}
                        />
                        <Icon
                            size={20}
                            name="edit"
                            type="antdesign"
                            color={THEME_CONFIG.gray}
                            style={{ marginBottom: 20, top: -2, left: 30, zIndex: 100 }}
                        />
                    </Pressable>
                    <VStackComponent style={{ marginTop: 20 }} space={4}>
                        <View
                            style={{
                                justifyContent: 'space-around',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <View>
                                <Heading
                                    size="md"
                                    textAlign="center"
                                    _dark={{ color: 'gray.300' }}
                                    _light={{ color: 'gray.700' }}
                                    onPress={handleEdit('firstName', user?.firstName)}
                                >
                                    {user?.firstName}
                                </Heading>
                            </View>
                            <Heading
                                size="md"
                                textAlign="center"
                                _dark={{ color: 'gray.300' }}
                                _light={{ color: 'gray.700' }}
                                onPress={handleEdit('lastName', user?.lastName)}
                            >
                                {user?.lastName}
                            </Heading>
                            <Icon color={THEME_CONFIG.gray} name="edit" size={18} type="antdesign" />
                        </View>
                        <TextComponent bold style={{ textAlign: 'center' }}>
                            {user?.campus?.campusName}
                        </TextComponent>
                        <TextComponent style={{ textAlign: 'center' }}>
                            {isGlobalPastor ? 'Global Senior Pastor' : user?.department?.departmentName}
                        </TextComponent>
                    </VStackComponent>
                </VStackComponent>
                <HStackComponent
                    style={{
                        marginBottom: 8,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 0.2,
                        borderColor: THEME_CONFIG.lightGray,
                        backgroundColor: backgroundColor,
                    }}
                >
                    <HStackComponent style={{ padding: 6, justifyContent: 'flex-start' }}>
                        <Icon size={22} name="person" type="Ionicons" color={THEME_CONFIG.lightGray} />
                        <TextComponent style={{ marginLeft: 4 }}>User Info</TextComponent>
                    </HStackComponent>
                </HStackComponent>
                <View style={{ marginHorizontal: 4 }}>
                    <HStackComponent
                        style={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginVertical: 2,
                        }}
                    >
                        <TextComponent bold>CGWC Status</TextComponent>
                        <StatusTag w={24}>{(user?.isCGWCApproved ? 'APPROVED' : 'UNAPPROVED') as any}</StatusTag>
                    </HStackComponent>
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
                    <UserInfo heading="Birthday" name="birthDay" value={moment(user?.birthDay).format('DD MMM')} />
                </View>
                <TouchableOpacity activeOpacity={0.4} style={{ width: '100%' }} onPress={handleLogout}>
                    <HStackComponent
                        style={{
                            marginVertical: 6,
                            paddingVertical: 16,
                            borderRadius: 12,
                            borderWidth: 0.2,
                            backgroundColor: backgroundColor,
                        }}
                    >
                        <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'flex-start' }}>
                            <Icon size={22} name="logout" type="Ionicons" color={THEME_CONFIG.lightGray} />
                            <TextComponent style={{ marginLeft: 4 }}>Logout</TextComponent>
                        </View>
                    </HStackComponent>
                </TouchableOpacity>
                <TextComponent style={{ paddingVertical: 8, textAlign: 'center' }}>
                    Version {DeviceInfo.getVersion()}
                </TextComponent>
            </VStackComponent>
        </ViewWrapper>
    );
};

export default React.memo(Profile);
