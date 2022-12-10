import React from 'react';
import { Text } from 'native-base';
import {
    TabBar,
    TabBarProps,
    TabView,
    TabViewProps,
} from 'react-native-tab-view';
import { THEME_CONFIG } from '../../../config/appConfig';
import { StyleSheet, useWindowDimensions } from 'react-native';

interface ITabComponentProps extends TabViewProps<any> {
    tabBarScroll?: boolean;
}

const renderTabBar: React.FC<TabBarProps<any>> = props => (
    <TabBar
        gap={4}
        {...props}
        style={Style.base}
        activeColor="white"
        tabStyle={Style.tab}
        indicatorStyle={Style.indicator}
        inactiveColor={THEME_CONFIG.primary}
        indicatorContainerStyle={{ margin: 4 }}
        pressColor={THEME_CONFIG.primaryVeryLight}
        labelStyle={{ color: THEME_CONFIG.primary }}
        renderLabel={({ route, focused, color }) => (
            <Text style={{ color }}>{route.title}</Text>
        )}
    />
);

const renderTabBarScroll: React.FC<TabBarProps<any>> = props => (
    <TabBar
        gap={4}
        {...props}
        scrollEnabled
        style={Style.base}
        activeColor="white"
        tabStyle={Style.tab}
        indicatorStyle={Style.indicatorScroll}
        inactiveColor={THEME_CONFIG.primary}
        indicatorContainerStyle={{ margin: 4 }}
        pressColor={THEME_CONFIG.primaryVeryLight}
        labelStyle={{ color: THEME_CONFIG.primary }}
        renderLabel={({ route, focused, color }) => (
            <Text style={{ color }}>{route.title}</Text>
        )}
    />
);

const TabComponent: React.FC<ITabComponentProps> = props => {
    const layout = useWindowDimensions();

    return (
        <TabView
            {...props}
            initialLayout={{ width: layout.width }}
            renderTabBar={
                props.tabBarScroll ? renderTabBarScroll : renderTabBar
            }
        />
    );
};

export default TabComponent;

const Style = StyleSheet.create({
    base: {
        backgroundColor: 'white',
        shadowColor: 'white',
        borderWidth: 0,
        marginRight: 6,
        marginBottom: 25,
    },
    indicator: {
        backgroundColor: THEME_CONFIG.primary,
        marginBottom: -3.5,
        borderRadius: 6,
        height: '118%',
        width: 195,
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
        marginBottom: -3.5,
        borderRadius: 6,
        height: '118%',
    },
});
