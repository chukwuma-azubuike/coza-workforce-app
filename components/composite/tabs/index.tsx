import React, { useCallback } from 'react';
import { TabBar, TabBarProps, TabView, TabViewProps } from 'react-native-tab-view';
import { THEME_CONFIG } from '@config/appConfig';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Loading from '~/components/atoms/loading';

interface ITabComponentProps extends TabViewProps<any> {
    tabBarScroll?: boolean;
    hideTabBar?: boolean;
}

const renderTabBar: React.FC<TabBarProps<any> & { hideTabBar?: boolean }> = props => {

    return (
        <>
            {props.hideTabBar ? null : (
                <TabBar
                    gap={4}
                    {...props}
                    style={Style.base}
                    tabStyle={Style.tab}
                    indicatorStyle={Style.indicator}
                    activeColor={THEME_CONFIG.primary}
                    inactiveColor={THEME_CONFIG.primary}
                />
            )}
        </>
    );
};

const renderTabBarScroll: React.FC<TabBarProps<any> & { hideTabBar?: boolean }> = props => {

    return (
        <>
            {props.hideTabBar ? null : (
                <TabBar
                    gap={4}
                    {...props}
                    scrollEnabled
                    style={Style.base}
                    tabStyle={Style.tab}
                    activeColor={THEME_CONFIG.primary}
                    inactiveColor={THEME_CONFIG.primary}
                    indicatorStyle={Style.indicatorScroll}
                />
            )}
        </>
    );
};

const TabComponent: React.FC<ITabComponentProps> = props => {
    const layout = useWindowDimensions();

    const renderLazyPlaceholder = useCallback(() => <Loading cover spinnerProps={{ size: 'small' }} />, []);

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
    },
    tab: {
        borderRadius: 6,
        paddingHorizontal: 0,
        marginHorizontal: 4.5,
        borderColor: THEME_CONFIG.primary,
    },
    indicatorScroll: {
        backgroundColor: THEME_CONFIG.primary,
        borderRadius: 6,
    },
});
