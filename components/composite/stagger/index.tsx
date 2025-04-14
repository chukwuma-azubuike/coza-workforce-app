// StaggerButtonComponent.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, Pressable, View, ViewProps } from 'react-native';
import { Icon } from '@rneui/themed';

export interface IStaggerButtonComponentProps extends ViewProps {
    buttons: {
        iconName: string;
        color: string;
        iconType: string;
        handleClick?: () => void;
    }[];
}

const StaggerButtonComponent: React.FC<IStaggerButtonComponentProps> = props => {
    const { buttons, style, ...rest } = props;
    const [isOpen, setIsOpen] = useState(false);

    // This single animated value drives the appearance of all extra buttons.
    const animationValue = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => setIsOpen(prev => !prev);

    useEffect(() => {
        Animated.timing(animationValue, {
            toValue: isOpen ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isOpen, animationValue]);

    // Define the spacing for each extra button (adjust as needed).
    const spacing = 70;

    return (
        <View style={[{ position: 'absolute', right: 18, bottom: 36, zIndex: isOpen ? 12 : 0 }, style]} {...rest}>
            {/* Extra Buttons Container */}
            <View className="items-center">
                {buttons.map((btn, idx) => {
                    // Compute translation for each button based on index.
                    const translateY = animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -(idx + 1) * spacing],
                    });
                    // Animate opacity and scale for a smoother effect.
                    const opacity = animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    });
                    const scale = animationValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    });
                    return (
                        <Animated.View
                            key={idx}
                            style={{ transform: [{ translateY }, { scale }], opacity, marginBottom: 10 }}
                        >
                            <Pressable
                                onPress={btn.handleClick}
                                style={{ backgroundColor: btn.color }}
                                className="w-16 h-16 rounded-full justify-center items-center shadow-lg"
                            >
                                <Icon size={28} color="white" name={btn.iconName} type={btn.iconType} />
                            </Pressable>
                        </Animated.View>
                    );
                })}
            </View>
            {/* Main Toggle Button */}
            <View className="justify-center">
                <Pressable
                    onPress={toggleMenu}
                    className="w-20 h-20 rounded-full justify-center items-center shadow-2xl bg-primary-600"
                >
                    <Icon size={38} color="white" name={isOpen ? 'minus' : 'plus'} type="entypo" />
                </Pressable>
            </View>
        </View>
    );
};

export default React.memo(StaggerButtonComponent);
