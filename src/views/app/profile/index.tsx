import { Icon } from '@rneui/themed';
import moment from 'moment';
import { Box, Heading, HStack, Stack, Text, VStack } from 'native-base';
import React from 'react';
import { Image, Pressable, TouchableOpacity } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import UserInfo from '../../../components/atoms/user-info';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../config/appConfig';
import useRole from '../../../hooks/role';
import Utils from '../../../utils';
import DeviceInfo from 'react-native-device-info';
import { AVATAR_FALLBACK_URL } from '../../../constants';
import { useAuth } from '../../../hooks/auth';
import { useNavigation } from '@react-navigation/native';
import { IEditProfilePayload } from '../../../store/types';
import useUpload from '../../../hooks/upload';
import { IMGBB_ALBUM_ID } from '../../../config/uploadConfig';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../../store/services/account';
import { useAppDispatch } from '../../../store/hooks';
import { userActionTypes } from '../../../store/services/users';
import { useGetUserScoreQuery } from '../../../store/services/score';

const Profile: React.FC = () => {
    const { user, isGlobalPastor } = useRole();

    const { logOut } = useAuth();
    const { navigate } = useNavigation();

    const dispatch = useAppDispatch();

    const handleLogout = () => {
        logOut();
    };

    const handleEdit = (key: string, value: any) => () => {
        let field: any = {};
        field[key] = value;
        navigate('Edit Profile' as never, field as never);
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

    return (
        <ViewWrapper scroll>
            <VStack pb={8}>
                <VStack pb={4} flexDirection="column" alignItems="center">
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
                    <Stack mt="4" space={2}>
                        <HStack space={2} alignItems="center">
                            <Heading
                                size="md"
                                textAlign="center"
                                _dark={{ color: 'gray.300' }}
                                _light={{ color: 'gray.700' }}
                                onPress={handleEdit('firstName', user?.firstName)}
                            >
                                {user?.firstName}
                            </Heading>
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
                        </HStack>
                        <Text
                            fontSize="md"
                            fontWeight="600"
                            color="gray.400"
                            textAlign="center"
                            _dark={{ color: 'gray.300' }}
                            _light={{ color: 'gray.700' }}
                        >
                            {user?.campus?.campusName}
                        </Text>
                        <Text
                            fontWeight="400"
                            color="gray.400"
                            textAlign="center"
                            _dark={{ color: 'gray.400' }}
                            _light={{ color: 'gray.600' }}
                        >
                            {isGlobalPastor ? 'Global Senior Pastor' : user?.department?.departmentName}
                        </Text>
                    </Stack>
                </VStack>
                <Stack
                    mb={2}
                    mx={4}
                    py={4}
                    borderRadius={6}
                    borderWidth={0.2}
                    borderColor="gray.400"
                    _dark={{ bg: 'gray.900' }}
                    _light={{ bg: 'gray.100' }}
                >
                    <Box px={3} flexDirection="row" justifyContent="flex-start">
                        <Icon size={22} name="person" type="Ionicons" color={THEME_CONFIG.lightGray} />
                        <Text ml={4} fontSize="md" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                            User Info
                        </Text>
                    </Box>
                </Stack>
                <Box mx={2}>
                    <UserInfo heading="Role" isEditable={false} name="role" value={user?.roleName} />
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
                </Box>
                {score && score?.accruedPoint >= score?.cutOffPoint && (
                    <Box h={240} p={2} w={240} mx="auto" my={4}>
                        <Image
                            style={{ height: '100%', width: '100%' }}
                            source={{
                                uri: user?.qrCodeUrl,
                            }}
                        />
                    </Box>
                )}
                <TouchableOpacity activeOpacity={0.4} style={{ width: '100%' }} onPress={handleLogout}>
                    <Stack
                        my={3}
                        mx={4}
                        py={4}
                        borderRadius={6}
                        borderWidth={0.2}
                        _dark={{ bg: 'gray.900' }}
                        _light={{ bg: 'gray.100' }}
                    >
                        <Box px={3} flexDirection="row" justifyContent="flex-start">
                            <Icon size={22} name="logout" type="Ionicons" color={THEME_CONFIG.lightGray} />
                            <Text ml={4} fontSize="md" _dark={{ color: 'gray.300' }} _light={{ color: 'gray.700' }}>
                                Logout
                            </Text>
                        </Box>
                    </Stack>
                </TouchableOpacity>
                <Text pt={2} pb={4} color="gray.400" textAlign="center">
                    Version {DeviceInfo.getVersion()}
                </Text>
            </VStack>
        </ViewWrapper>
    );
};

export default Profile;
