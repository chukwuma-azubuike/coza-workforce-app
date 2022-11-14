import { ParamListBase, RouteProp } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { Center, HStack } from 'native-base';
import React from 'react';
import { Text, TouchableNativeFeedback } from 'react-native';
import { THEME_CONFIG } from '../config/appConfig';
import { AppRoutes } from '../config/navigation';

const inMenuBar = AppRoutes.map(route => {
    if (route.inMenuBar) return route.name;
});

const TabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
    return (
        <HStack justifyContent="space-around" px={2} bg="white">
            {state.routes.map(
                (route: RouteProp<ParamListBase>, index: number) => {
                    if (!inMenuBar.includes(route.name)) return;

                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

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
                            iconName = 'timer-outline';
                            iconType = 'ionicon';
                            break;
                        case 'Permissions':
                            iconName = 'hand-left-outline';
                            iconType = 'ionicon';
                            break;
                        case 'Notifications':
                            iconName = 'notifications-outline';
                            iconType = 'ionicon';
                            break;
                        case 'More':
                            iconName = 'menu-outline';
                            iconType = 'ionicon';
                            break;
                        default:
                            break;
                    }

                    return (
                        <TouchableNativeFeedback
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={
                                isFocused ? { selected: true } : {}
                            }
                            accessibilityLabel={
                                options.tabBarAccessibilityLabel
                            }
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{ height: 100 }}
                            background={TouchableNativeFeedback.Ripple(
                                THEME_CONFIG.primaryVeryLight,
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
                                            ? THEME_CONFIG.primary
                                            : THEME_CONFIG.lightGray
                                    }
                                />
                                <Text
                                    style={{
                                        color: isFocused
                                            ? THEME_CONFIG.primary
                                            : THEME_CONFIG.lightGray,
                                        fontSize: 12,
                                    }}
                                >
                                    {label}
                                </Text>
                            </Center>
                        </TouchableNativeFeedback>
                    );
                }
            )}
        </HStack>
    );
};

export default TabBar;
