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

interface Usr {
    address: '18 Felix';
    birthDay: '1994-05-01T11:34:42.227Z';
    campus: {
        LGA: 'Ikeja LG';
        address: 'No. 20 Mobolaji Bank Anthony, Iekja, Lagos';
        campusName: 'Lagos Campus';
        country: 'Nigeria';
        createdAt: '2022-11-01T22:49:41.357Z';
        dateOfBirth: null;
        description: 'This is the CommonWealth of Zion Assembly (COZA) Lagos campus';
        id: '6361a285832e7fbd65897cb7';
        location: { lat: 435; long: 234 };
        state: 'Lagos';
    };
    createdAt: '2022-12-08T11:40:26.734Z';
    department: null;
    email: 'ranechopro@gmail.com';
    firstName: 'Chukwuma';
    gender: 'M';
    isActivated: true;
    isVerified: false;
    lastName: 'Azubuike';
    maritalStatus: 'SINGLE';
    nextOfKin: 'Chi';
    nextOfKinPhoneNo: '07033045884';
    occupation: 'Engineer';
    phoneNumber: '07085590939';
    pictureUrl: '';
    placeOfWork: 'AjoCard';
    role: {
        __v: 0;
        _id: '638a5f1e8eb1e1ef2b0be2a7';
        createdAt: '2022-12-02T20:25:02.831Z';
        description: 'Worker in the CommonWealth of Zion Assembly';
        name: 'Worker';
    };
    socialMedia: {
        facebook: '@chumiike';
        instagram: '@chumiike';
        twitter: '@chumiike';
    };
    userId: '6391cd2a073488539583a273';
}

const Profile: React.FC = () => {
    const { setIsLoggedIn } = React.useContext(AppStateContext);

    const handleLogout = () => {
        Utils.clearCurrentUserStorage().then(res => {
            Utils.clearStorage().then(res => {
                setIsLoggedIn && setIsLoggedIn(false);
            });
        });
    };

    const { user } = useRole();

    return (
        <ViewWrapper scroll>
            <VStack>
                <VStack
                    pt={1}
                    pb={4}
                    flexDirection="column"
                    alignItems="center"
                >
                    <AvatarComponent
                        shadow={9}
                        size="xl"
                        imageUrl="https://i.ibb.co/P6k4dWF/Group-3.png"
                    />
                    <Stack mt="2">
                        <Heading textAlign="center" size="md">
                            {user &&
                                `${Utils.capitalizeFirstChar(
                                    user?.firstName
                                )} ${Utils.capitalizeFirstChar(
                                    user?.lastName
                                )}`}
                        </Heading>
                        <Text textAlign="center" fontWeight="400">
                            {user?.department?.departmentName}
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
            </VStack>
        </ViewWrapper>
    );
};

export default Profile;
