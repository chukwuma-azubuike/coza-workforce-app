import { Text } from "~/components/ui/text";
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { List } from 'native-base';
import { AppRoutes, IAppRoute } from '@config/navigation';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import useRole, { DEPARTMENTS, ROLES } from '@hooks/role';
import { useCustomBackNavigation } from '@hooks/navigation';
import { useGetUserByIdQuery } from '@store/services/account';
import useScreenFocus from '@hooks/focus';

const More: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const handlePress = (route: IAppRoute) => () => navigation.navigate(route.name);
    const {
        user: {
            userId,
            role: { name: roleName },
            department: { departmentName },
        },
        isSuperAdmin,
        isCampusPastor,
        isCGWCApproved,
    } = useRole();

    const { refetch, isLoading } = useGetUserByIdQuery(userId);
    useScreenFocus({
        onFocus: refetch,
    });

    const filteredRoutes = React.useMemo(
        () =>
            AppRoutes.filter(route => {
                if (!route.inMore) {
                    return;
                }
                if (!isCGWCApproved && !isCampusPastor && !isSuperAdmin && route.name === 'CGLS') {
                    return;
                }
                if (!route.users?.length) {
                    return route;
                }
                const rolesAndDepartments = route.users;
                if (
                    rolesAndDepartments.includes(roleName as ROLES) ||
                    rolesAndDepartments.includes(departmentName as DEPARTMENTS)
                ) {
                    return route;
                }
            }),
        [AppRoutes, isCGWCApproved, isSuperAdmin, roleName, departmentName]
    );

    useCustomBackNavigation({ targetRoute: 'Home' });

    return (
        <ViewWrapper scroll style={{ paddingTop: 10 }} refreshing={isLoading} onRefresh={refetch}>
            <View>
                <List mx={4} borderWidth={0}>
                    {filteredRoutes?.map((route, idx) => (
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
                                <View w="full" alignItems="center" justifyContent="space-between" className="px-3">
                                    <View flexDirection="row" justifyContent="flex-start">
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
                                    </View>
                                    <Icon
                                        size={22}
                                        type="entypo"
                                        name="chevron-small-right"
                                        color={THEME_CONFIG.lightGray}
                                    />
                                </View>
                            </TouchableOpacity>
                        </List.Item>
                    ))}
                </List>
            </View>
        </ViewWrapper>
    );
};

export default React.memo(More);
