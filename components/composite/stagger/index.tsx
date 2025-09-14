// StaggerButtonComponent.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, View, ViewProps } from 'react-native';
import { Icon } from '@rneui/themed';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

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
    const spacing = 78;

    return (
        <View style={[{ position: 'absolute', right: 24, bottom: 56, zIndex: isOpen ? 12 : 0 }, style]} {...rest}>
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
                            style={{ transform: [{ translateY }, { scale }], opacity, marginBottom: -70 }}
                        >
                            <Button
                                onPress={btn.handleClick}
                                className={cn(
                                    '!w-[4.4rem] !h-[4.4rem] !px-0 !rounded-full justify-center items-center shadow-lg',
                                    btn.color
                                )}
                            >
                                <Icon size={28} color="white" name={btn.iconName} type={btn.iconType} />
                            </Button>
                        </Animated.View>
                    );
                })}
            </View>
            {/* Main Toggle Button */}
            <View className="justify-center">
                <Button
                    onPress={toggleMenu}
                    className="!w-[4.4rem] !h-[4.4rem] !px-0 !rounded-full justify-center items-center"
                >
                    <Icon size={28} color="white" name={isOpen ? 'minus' : 'plus'} type="entypo" />
                </Button>
            </View>
        </View>
    );
};

export default React.memo(StaggerButtonComponent);
