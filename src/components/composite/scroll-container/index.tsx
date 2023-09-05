import React from 'react';
import { Animated } from 'react-native';
import { ScrollView } from 'react-native';

interface IScrollContainerProps {
    scrollOffsetY: Animated.Value;
}

const ScrollContainer: React.FC<IScrollContainerProps> = ({ children, scrollOffsetY }) => {
    return (
        <ScrollView
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }], {
                useNativeDriver: false,
            })}
        >
            {children}
        </ScrollView>
    );
};

export default ScrollContainer;
