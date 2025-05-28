import { Text } from '~/components/ui/text';
import React, { useCallback } from 'react';
import { TabBar, TabBarProps, TabView, TabViewProps } from 'react-native-tab-view';
import { THEME_CONFIG } from '@config/appConfig';
import { StyleSheet, useWindowDimensions } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import Loading from '~/components/atoms/loading';

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
                    renderLabel={({ route }: any) => <Text>{route.title}</Text>}
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
                    renderLabel={({ route, focused, color }: any) => <Text>{route.title}</Text>}
                />
            )}
        </>
    );
};

const TabComponent: React.FC<ITabComponentProps> = props => {
    const layout = useWindowDimensions();

    const renderLazyPlaceholder = useCallback(() => <Loading cover spinnerProps={{ size: 'large' }} />, []);

    return (
        <TabView
            {...props}
            lazy
            initialLayout={{ width: layout.width }}
            renderLazyPlaceholder={renderLazyPlaceholder}
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
        marginBottom: 0,
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
