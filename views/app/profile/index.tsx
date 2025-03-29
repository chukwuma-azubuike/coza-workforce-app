import { Icon } from '@rneui/themed';
import moment from 'moment';
import { Heading } from 'native-base';
import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import UserInfo from '@components/atoms/user-info';
import ViewWrapper from '@components/layout/viewWrapper';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
import Utils from '@utils/index';
import DeviceInfo from 'react-native-device-info';
import { AVATAR_FALLBACK_URL, S3_BUCKET_FOLDERS } from '@constants/index';
import { useAuth } from '@hooks/auth';
import { ParamListBase } from '@react-navigation/native';
import { IEditProfilePayload } from '@store/types';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@store/services/account';
import { useAppDispatch } from '@store/hooks';
import { userActionTypes } from '@store/services/users';
import StatusTag from '@components/atoms/status-tag';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import VStackComponent from '@components/layout/v-stack';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import useAppColorMode from '@hooks/theme/colorMode';
import APP_ENV from '@config/envConfig';
import filePicker from '@utils/filePicker';
import { useGenerateUploadUrlMutation, useUploadMutation } from '@store/services/upload';
import { AWS_REGION, AWS_S3_BUCKET_NAME } from '@env';

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

    const [updateUser, { isLoading: updateIsLoading }] = useUpdateUserMutation();

    const { data: newUserData, refetch: refetchUser, isFetching: newUserDataLoading } = useGetUserByIdQuery(user?._id);

    const [generateUrl, { isLoading: generateUrlLoading }] = useGenerateUploadUrlMutation();
    const [upload, { isLoading: isUploading }] = useUploadMutation();
    const [loading, setLoading] = React.useState<boolean>();
    // TODO: Reuse when switched back to axios base query
    // const [progress, setProgress] = React.useState<number>(0);
    const [uploadError, setUploadError] = React.useState<string>();

    const handleProfilePicture = async () => {
        const result = await filePicker({});

        if ('error' in result) {
            setLoading(false);
            setUploadError(result.errorMessage);
            return;
        }

        const asset = result.assets;

        if (asset && asset[0] && asset[0].fileName) {
            const file = asset[0];

            const lastDot = (file.fileName as string).lastIndexOf('.');
            const ext = (file.fileName as string).slice(lastDot + 1);

            const objectKey = `${S3_BUCKET_FOLDERS.profile_pictures}/${user?.campus?.campusName}_${user?._id}_${
                user.firstName
            }_${user.lastName}_timestamp=${new Date().toISOString()}.${ext}`;

            const pictureUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${objectKey}`;

            const response = await fetch(file.uri as string);
            const blob = await response.blob();

            try {
                setLoading(true);

                const urlResponse = await generateUrl({
                    objectKey,
                    expirySeconds: 3600,
                    bucketName: AWS_S3_BUCKET_NAME,
                });

                if ('data' in urlResponse) {
                    const response = await upload({
                        file: blob,
                        contentType: file.type!,
                        url: urlResponse?.data,
                        // setProgress, // TODO: Reuse when switched back to axios base query
                    });

                    if ('data' in response) {
                        setLoading(false);
                        await updateUser({ pictureUrl, _id: user?._id } as IEditProfilePayload);
                        refetchUser();
                    }
                }

                if ('error' in urlResponse) {
                    setLoading(false);
                    Alert.alert('Error uploading file', 'Something went wrong in generating upload url.');
                }
            } catch (error) {
                setLoading(false);
                Alert.alert('Error uploading file', 'Something went wrong during the upload process.');
            }
        }
    };

    React.useEffect(() => {
        if (newUserData) {
            dispatch({
                type: userActionTypes.SET_USER_DATA,
                payload: newUserData,
            });
        }
    }, [newUserData]);

    const { backgroundColor } = useAppColorMode();
    const isProfilePictureLoading = updateIsLoading || isUploading || generateUrlLoading;

    return (
        <ViewWrapper
            scroll
            onRefresh={refetchUser}
            refreshing={newUserDataLoading}
            style={{ paddingVertical: 20, paddingHorizontal: 20 }}
        >
            <VStackComponent style={{ paddingBottom: 32 }}>
                <VStackComponent style={{ paddingBottom: 8, alignItems: 'center' }}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleProfilePicture}
                        disabled={newUserDataLoading || updateIsLoading || isUploading}
                    >
                        <AvatarComponent
                            size="xl"
                            shadow={9}
                            error={uploadError}
                            lastName={user?.lastName}
                            firstName={user?.firstName}
                            isLoading={loading || newUserDataLoading || isProfilePictureLoading}
                            imageUrl={user?.pictureUrl ? user.pictureUrl : AVATAR_FALLBACK_URL}
                        />
                        <TextComponent
                            style={{
                                bottom: 14,
                                left: 18,
                                position: 'absolute',
                                color: THEME_CONFIG.veryVeryLightGray,
                                backgroundColor: THEME_CONFIG.transparentGray,
                            }}
                        >
                            {user?.pictureUrl ? 'Edit' : 'Add'} photo
                        </TextComponent>
                    </TouchableOpacity>
                    <VStackComponent space={4}>
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
                    Version {DeviceInfo.getVersion()} ({APP_ENV.ENV})
                </TextComponent>
            </VStackComponent>
        </ViewWrapper>
    );
};

export default React.memo(Profile);
