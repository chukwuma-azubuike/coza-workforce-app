import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { Box, HStack, List, Text, VStack } from 'native-base';
import { AppRoutes, IAppRoute } from '../../../config/navigation';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import useRole from '../../../hooks/role';
import { useCustomBackNavigation } from '../../../hooks/navigation';

const More: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const handlePress = (route: IAppRoute) => () => navigation.navigate(route.name);

    const { isGlobalPastor, isHOD, isAHOD, isQC } = useRole();

    const routeFilters = ['Profile', 'Notifications'];

    const roleFilterArray = [
        { role: isGlobalPastor, routes: ['Manual clock in'] },
        { role: (isHOD && !isQC) || (isAHOD && !isQC), routes: ['Manual clock in'] },
    ];

    const assertFilterRole = React.useMemo(() => roleFilterArray.find(filter => filter.role), [roleFilterArray]);

    const filteredRoutes = React.useMemo(
        () =>
            AppRoutes.filter(
                route =>
                    !route.inMenuBar &&
                    !routeFilters.includes(route.name) &&
                    !(assertFilterRole?.role && assertFilterRole.routes.includes(route.name))
            ),
        [AppRoutes]
    );

    useCustomBackNavigation({ targetRoute: 'Home' });

    return (
        <ViewWrapper>
            <VStack>
                <List mx={4} borderWidth={0}>
                    {filteredRoutes.map((route, idx) => (
                        <List.Item
                            mb={2}
                            py={4}
                            key={idx}
                            borderRadius={6}
                            borderColor="gray.400"
                            _dark={{ bg: 'gray.900' }}
                            _light={{ bg: 'gray.100' }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.6}
                                style={{ width: '100%' }}
                                onPress={handlePress(route)}
                            >
                                <HStack px={3} w="full" alignItems="center" justifyContent="space-between">
                                    <Box flexDirection="row" justifyContent="flex-start">
                                        <Icon
                                            size={22}
                                            name={route.icon.name}
                                            type={route.icon.type}
                                            color={THEME_CONFIG.lightGray}
                                        />
                                        <Text
                                            ml={4}
                                            fontSize="md"
                                            _light={{ color: 'gray.600' }}
                                            _dark={{ color: 'gray.400' }}
                                        >
                                            {route.name}
                                        </Text>
                                    </Box>
                                    <Icon
                                        size={22}
                                        type="entypo"
                                        name="chevron-small-right"
                                        color={THEME_CONFIG.lightGray}
                                    />
                                </HStack>
                            </TouchableOpacity>
                        </List.Item>
                    ))}
                </List>
            </VStack>
        </ViewWrapper>
    );
};

export default More;
