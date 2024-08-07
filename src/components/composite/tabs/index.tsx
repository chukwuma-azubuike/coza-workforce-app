import React from 'react';
import { TabBar, TabBarProps, TabView, TabViewProps } from 'react-native-tab-view';
import { THEME_CONFIG } from '@config/appConfig';
import { StyleSheet, useWindowDimensions } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import TextComponent from '@components/text';

interface ITabComponentProps extends TabViewProps<any> {
    tabBarScroll?: boolean;
    hideTabBar?: boolean;
}

const renderTabBar: React.FC<TabBarProps<any> & { hideTabBar?: boolean }> = props => {
    const { isLightMode } = useAppColorMode();

    return (
        <>
            {props.hideTabBar ? null : (
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
                    renderLabel={({ route, focused, color }) => (
                        <TextComponent style={{ color }}>{route.title}</TextComponent>
                    )}
                />
            )}
        </>
    );
};

const renderTabBarScroll: React.FC<TabBarProps<any> & { hideTabBar?: boolean }> = props => {
    const { isLightMode } = useAppColorMode();

    return (
        <>
            {props.hideTabBar ? null : (
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
                    renderLabel={({ route, focused, color }) => (
                        <TextComponent style={{ color }}>{route.title}</TextComponent>
                    )}
                />
            )}
        </>
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
        marginVertical: 10,
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
