import React from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import CgwcTopNav from '@components/composite/header/cgwc-top-nav';
import useAppColorMode from '@hooks/theme/colorMode';

const MIN_HEADER_HEIGHT = 50;
const MAX_HEADER_HEIGHT = 80;

const SCROLL_DISTANCE = MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT;

interface IDynamicHeader {
    title: string;
    animHeaderValue: Animated.Value;
}

const DynamicHeader: React.FC<IDynamicHeader> = React.memo(({ animHeaderValue, title }) => {
    const { isDarkMode } = useAppColorMode();

    const animatedHeaderHeight = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
    });

    const animateHeaderBackgroundColor = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
        outputRange: [
            isDarkMode ? '#000' : '#fff',
            isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryVeryLightGray,
        ],
    });

    const animateHeaderTextsize = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        outputRange: [22, 15],
        inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
    });

    const animateHeaderTextPosition = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        outputRange: [-16, 6],
        inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
    });

    return (
        <Animated.View
            style={[
                styles.header,
                {
                    height: animatedHeaderHeight,
                    backgroundColor: animateHeaderBackgroundColor,
                    paddingTop: 0,
                },
            ]}
        >
            <View>
                <CgwcTopNav
                    title={
                        title ? (
                            <Animated.Text
                                style={[
                                    styles.headerText,
                                    {
                                        fontSize: animateHeaderTextsize,
                                        bottom: animateHeaderTextPosition,
                                        color: isDarkMode ? '#fff' : '#000',
                                    },
                                ]}
                            >
                                {title}
                            </Animated.Text>
                        ) : (
                            ''
                        )
                    }
                />
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    header: {
        paddingBottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        bottom: 10,
        marginTop: 15,
        fontWeight: '600',
        textAlign: 'center',
        position: 'relative',
    },
});

export { DynamicHeader };
