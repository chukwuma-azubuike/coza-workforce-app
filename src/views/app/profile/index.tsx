import { Icon } from '@rneui/themed';
import moment from 'moment';
import { Box, Heading, Stack, Text, VStack } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { AppStateContext } from '../../../../App';
import AvatarComponent from '../../../components/atoms/avatar';
import UserInfo from '../../../components/atoms/user-info';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../config/appConfig';
import useRole from '../../../hooks/role';
import Utils from '../../../utils';
import DeviceInfo from 'react-native-device-info';

const Profile: React.FC = () => {
    const { setIsLoggedIn } = React.useContext(AppStateContext);

    const handleLogout = () => {
        Utils.clearCurrentUserStorage().then(res => {
            Utils.clearStorage().then(res => {
                setIsLoggedIn && setIsLoggedIn(false);
            });
        });
    };

    const { user, isGlobalPastor } = useRole();

    return (
        <ViewWrapper scroll>
            <VStack pb={8}>
                <VStack pb={4} flexDirection="column" alignItems="center">
                    <AvatarComponent
                        shadow={9}
                        size="xl"
                        imageUrl={
                            user?.pictureUrl
                                ? user.pictureUrl
                                : 'https://i.ibb.co/P6k4dWF/Group-3.png'
                        }
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                    />
                    <Stack mt="4" space={2}>
                        <Heading textAlign="center" size="md">
                            {user && `${user?.firstName} ${user?.lastName}`}
                        </Heading>
                        <Text
                            textAlign="center"
                            fontWeight="400"
                            color="gray.400"
                        >
                            {isGlobalPastor
                                ? 'Global Senior Pastor'
                                : user?.department?.departmentName}
                        </Text>
                    </Stack>
                </VStack>
                <Stack
                    mb={2}
                    mx={4}
                    py={4}
                    bg="gray.50"
                    borderRadius={6}
                    borderWidth={0.2}
                    borderColor="gray.400"
                >
                    <Box px={3} flexDirection="row" justifyContent="flex-start">
                        <Icon
                            size={22}
                            name="person"
                            type="Ionicons"
                            color={THEME_CONFIG.lightGray}
                        />
                        <Text ml={4} fontSize="md" color="gray.500">
                            User Info
                        </Text>
                    </Box>
                </Stack>
                <Box mx={4}>
                    <UserInfo heading="Address" detail={user?.address} />
                    <UserInfo heading="Phone" detail={user?.phoneNumber} />
                    <UserInfo heading="Next of kin" detail={user?.nextOfKin} />
                    <UserInfo heading="Occupation" detail={user?.occupation} />
                    <UserInfo
                        heading="Place of work"
                        detail={user?.placeOfWork}
                    />
                    <UserInfo heading="Gender" detail={user?.gender} />
                    <UserInfo
                        heading="Marital Status"
                        detail={Utils.capitalizeFirstChar(
                            user?.maritalStatus || ''
                        )}
                    />
                    <UserInfo
                        heading="Birthday"
                        detail={moment(user?.birthDay).format('DD MMM')}
                    />
                </Box>
                <TouchableOpacity
                    activeOpacity={0.4}
                    style={{ width: '100%' }}
                    onPress={handleLogout}
                >
                    <Stack
                        my={3}
                        mx={4}
                        py={4}
                        bg="gray.50"
                        borderRadius={6}
                        borderWidth={0.2}
                        borderColor="gray.400"
                    >
                        <Box
                            px={3}
                            flexDirection="row"
                            justifyContent="flex-start"
                        >
                            <Icon
                                size={22}
                                name="logout"
                                type="Ionicons"
                                color={THEME_CONFIG.lightGray}
                            />
                            <Text ml={4} fontSize="md" color="gray.500">
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
