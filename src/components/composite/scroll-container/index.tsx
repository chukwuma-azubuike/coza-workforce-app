import React from 'react';
import { Animated } from 'react-native';
import { ScrollView } from 'react-native';

interface IScrollContainerProps extends Partial<ScrollView> {
    scrollOffsetY: Animated.Value;
}

const ScrollContainer: React.FC<IScrollContainerProps> = ({ children, scrollOffsetY, ...prop }) => {
    return (
        <ScrollView
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }], {
                useNativeDriver: false,
            })}
            {...prop}
        >
            {children}
        </ScrollView>
    );
};

export default ScrollContainer;
