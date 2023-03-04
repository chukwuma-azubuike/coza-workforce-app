import React from 'react';
import { Text } from 'native-base';
import { TabBar, TabBarProps, TabView, TabViewProps } from 'react-native-tab-view';
import { THEME_CONFIG } from '../../../config/appConfig';
import { StyleSheet, useWindowDimensions } from 'react-native';
import useAppColorMode from '../../../hooks/theme/colorMode';

interface ITabComponentProps extends TabViewProps<any> {
    tabBarScroll?: boolean;
}

const renderTabBar: React.FC<TabBarProps<any>> = props => {
    const { isLightMode } = useAppColorMode();

    return (
        <TabBar
            gap={4}
            {...props}
            style={Style.base}
            activeColor="white"
            tabStyle={Style.tab}
            indicatorStyle={Style.indicator}
            inactiveColor={isLightMode ? THEME_CONFIG.primary : THEME_CONFIG.primary}
            pressColor={isLightMode ? THEME_CONFIG.primaryVeryLight : THEME_CONFIG.primaryTransparent}
            labelStyle={{ color: THEME_CONFIG.primary }}
            renderLabel={({ route, focused, color }) => <Text style={{ color }}>{route.title}</Text>}
        />
    );
};

const renderTabBarScroll: React.FC<TabBarProps<any>> = props => {
    const { isLightMode } = useAppColorMode();

    return (
        <TabBar
            gap={4}
            {...props}
            scrollEnabled
            style={Style.base}
            activeColor="white"
            tabStyle={Style.tab}
            indicatorStyle={Style.indicatorScroll}
            labelStyle={{ color: THEME_CONFIG.primary }}
            inactiveColor={isLightMode ? THEME_CONFIG.primary : THEME_CONFIG.primaryLight}
            pressColor={isLightMode ? THEME_CONFIG.primaryVeryLight : THEME_CONFIG.primaryTransparent}
            renderLabel={({ route, focused, color }) => <Text style={{ color }}>{route.title}</Text>}
        />
    );
};

const TabComponent: React.FC<ITabComponentProps> = props => {
    const layout = useWindowDimensions();

    return (
        <TabView
            {...props}
            initialLayout={{ width: layout.width }}
            renderTabBar={props.tabBarScroll ? renderTabBarScroll : renderTabBar}
        />
    );
};

export default TabComponent;

const Style = StyleSheet.create({
    base: {
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        borderWidth: 0,
        marginHorizontal: 6,
        marginBottom: 25,
    },
    indicator: {
        backgroundColor: THEME_CONFIG.primary,
        borderRadius: 6,
        height: '100%',
    },
    tab: {
        borderRadius: 6,
        borderWidth: 0.6,
        paddingHorizontal: 0,
        marginHorizontal: 4.5,
        borderColor: THEME_CONFIG.primary,
    },
    indicatorScroll: {
        backgroundColor: THEME_CONFIG.primary,
        borderRadius: 6,
        height: '100%',
    },
});
