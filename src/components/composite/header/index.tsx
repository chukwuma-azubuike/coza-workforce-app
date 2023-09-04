import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import { THEME_CONFIG } from '@config/appConfig';
import useAppColorMode from '@hooks/theme/colorMode';

const MIN_HEADER_HEIGHT = 100;
const MAX_HEADER_HEIGHT = 140;
const SCROLL_DISTANCE = MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT;

interface IDynamicHeader {
    title: string;
    animHeaderValue: Animated.Value;
}

const DynamicHeader: React.FC<IDynamicHeader> = ({ animHeaderValue, title, children }) => {
    const { isDarkMode } = useAppColorMode();

    const animatedHeaderHeight = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [MAX_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
    });

    const animateHeaderBackgroundColor = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
        outputRange: [isDarkMode ? '#000' : '#fff', isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray],
    });

    const animateHeaderTextsize = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        outputRange: [22, 15],
        inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
    });

    const animateHeaderTextPosition = animHeaderValue.interpolate({
        extrapolate: 'clamp',
        outputRange: [10, 22],
        inputRange: [0, MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT],
    });

    return (
        <Animated.View
            style={[
                styles.header,
                {
                    height: animatedHeaderHeight,
                    backgroundColor: animateHeaderBackgroundColor,
                },
            ]}
        >
            {children}
            {title && (
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
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 4,
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
