import { Icon } from '@rneui/themed';
import { Box, Heading, Stack, Text, VStack } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { AppStateContext } from '../../../../App';
import AvatarComponent from '../../../components/atoms/avatar';
import UserInfo from '../../../components/atoms/user-info';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { THEME_CONFIG } from '../../../config/appConfig';
import Utils from '../../../utils';

const Profile: React.FC = () => {
    const { setIsLoggedIn } = React.useContext(AppStateContext);

    const handleLogout = () => {
        Utils.removeUserSession().then(res => {
            setIsLoggedIn && setIsLoggedIn(false);
        });
    };

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
                        imageUrl="https://bit.ly/3AdGvvM"
                    />
                    <Stack mt="2">
                        <Heading textAlign="center" size="md">
                            David Johnson
                        </Heading>
                        <Text textAlign="center" fontWeight="400">
                            Media
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
                    <UserInfo
                        heading="Address"
                        detail="56. Oduwole Str. Egebda, Lagos."
                    />
                    <UserInfo heading="Phone" detail="+2348165513593" />
                    <UserInfo heading="Next of kin" detail="Micheal James" />
                    <UserInfo heading="Occupation" detail="Engineer" />
                    <UserInfo heading="Place of work" detail="COZA Global" />
                    <UserInfo heading="Gender" detail="Male" />
                    <UserInfo heading="Marital Status" detail="Single" />
                    <UserInfo heading="Birthday" detail="5 Dec." />
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
