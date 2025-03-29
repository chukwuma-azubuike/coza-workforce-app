import { ParamListBase, RouteProp } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { Center, HStack } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import { AppRoutes } from '@config/navigation';
import useRole from '@hooks/role';
import useAppColorMode from '@hooks/theme/colorMode';
import TextComponent from '@components/text';

const TabBar: React.FC<any> = React.memo(({ state, descriptors, navigation }) => {
    const { isWorker, isQC, isCGWCApproved } = useRole();
    const { isLightMode } = useAppColorMode();

    const inMenuBarNames = React.useMemo(
        () =>
            AppRoutes.map(route => {
                if (route.inMenuBar || (isWorker && route.name === 'CGLS' && isCGWCApproved)) return route.name;
            }),
        [AppRoutes, isCGWCApproved, isWorker]
    );

    return (
        <HStack
            px={2}
            borderTopWidth={0.5}
            style={{ height: 55 }}
            justifyContent="space-between"
            _dark={{ bg: 'black', borderColor: 'gray.800' }}
            _light={{ bg: 'white', borderColor: 'gray.300' }}
        >
            {state.routes.map((route: RouteProp<ParamListBase>, index: number) => {
                let isFocused = state.index === index;

                if (!inMenuBarNames.includes(route.name)) {
                    isFocused = true;
                    return;
                }

                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                          ? options.title
                          : route.name;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({
                            name: route.name,
                            merge: true,
                        });
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                let iconName = 'home';
                let iconType = 'antdesign';

                switch (route.name) {
                    case 'Home':
                        iconName = 'home';
                        iconType = 'antdesign';
                        break;
                    case 'Attendance':
                        iconName = 'checklist';
                        iconType = 'octicon';
                        break;
                    case 'Permissions':
                        iconName = 'hand-left-outline';
                        iconType = 'ionicon';
                        break;
                    case 'Tickets':
                        iconName = 'ticket-confirmation-outline';
                        iconType = 'material-community';
                        break;
                    case 'More':
                        iconName = 'menu-outline';
                        iconType = 'ionicon';
                        break;
                    case 'CGLS':
                        iconName = 'crown';
                        iconType = 'foundation';
                    default:
                        break;
                }

                // Roles and permissions filter
                if (isWorker && !isQC && route.name === 'More') return;
                if (isWorker && isQC && route.name === 'CGLS') return;

                return (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.6}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={{ flex: 1 }}
                        onLongPress={onLongPress}
                    >
                        <Center py={1.5} minWidth={60}>
                            <Icon
                                size={22}
                                name={iconName}
                                type={iconType}
                                color={
                                    isFocused
                                        ? isLightMode
                                            ? THEME_CONFIG.primary
                                            : THEME_CONFIG.primaryLight
                                        : THEME_CONFIG.lightGray
                                }
                            />
                            <TextComponent
                                style={{
                                    color: isFocused
                                        ? isLightMode
                                            ? THEME_CONFIG.primary
                                            : THEME_CONFIG.primaryLight
                                        : THEME_CONFIG.lightGray,
                                    fontSize: 10,
                                    marginTop: 4,
                                }}
                            >
                                {label}
                            </TextComponent>
                        </Center>
                    </TouchableOpacity>
                );
            })}
        </HStack>
    );
});

export default React.memo(TabBar);
