import { ParamListBase, RouteProp } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { Center, HStack, useColorMode } from 'native-base';
import React from 'react';
import { Text, TouchableNativeFeedback } from 'react-native';
import { THEME_CONFIG } from '../config/appConfig';
import { AppRoutes } from '../config/navigation';
import useRole from '../hooks/role';
import useAppColorMode from '../hooks/theme/colorMode';

const inMenuBarNames = AppRoutes.map(route => {
    if (route.inMenuBar) return route.name;
});

const TabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
    const { isWorker } = useRole();
    const { isLightMode } = useAppColorMode();

    return (
        <HStack
            px={2}
            borderTopWidth={0.5}
            justifyContent="space-around"
            _dark={{ bg: 'gray.900', borderColor: 'gray.700' }}
            _light={{ bg: 'gray.100', borderColor: 'gray.300' }}
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
                    default:
                        break;
                }

                // Roles and permissions filter
                if (isWorker && route.name === 'More') return;

                return (
                    <TouchableNativeFeedback
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={{ height: 100 }}
                        background={TouchableNativeFeedback.Ripple(
                            isLightMode ? THEME_CONFIG.primaryVeryLight : THEME_CONFIG.primaryTransparent,
                            true,
                            40
                        )}
                    >
                        <Center py={2}>
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
                            <Text
                                style={{
                                    color: isFocused
                                        ? isLightMode
                                            ? THEME_CONFIG.primary
                                            : THEME_CONFIG.primaryLight
                                        : THEME_CONFIG.lightGray,
                                    fontSize: 12,
                                }}
                            >
                                {label}
                            </Text>
                        </Center>
                    </TouchableNativeFeedback>
                );
            })}
        </HStack>
    );
};

export default TabBar;
