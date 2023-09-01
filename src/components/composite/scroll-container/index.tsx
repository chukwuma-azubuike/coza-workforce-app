import React from 'react';
import { Animated, View } from 'react-native';
import { ScrollView } from 'react-native';

interface IScrollContainerProps {
    scrollOffsetY: Animated.Value;
}

const ScrollContainer: React.FC<IScrollContainerProps> = ({ children, scrollOffsetY }) => {
    return (
        <View>
            <ScrollView
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }], {
                    useNativeDriver: false,
                })}
            >
                {children}
            </ScrollView>
        </View>
    );
};

export default ScrollContainer;
