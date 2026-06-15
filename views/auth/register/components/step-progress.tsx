import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '~/components/ui/text';

interface IStepProgressProps {
    labels: string[];
    currentStep: number;
}

/**
 * Lightweight, fully-controlled progress header for the register flow.
 *
 * Replaces the previous `react-native-step-indicator` + `react-native-swiper`
 * combo whose page index never stayed in sync with the rendered screen. This is
 * a pure function of `currentStep`, so what the bar shows is always what's on
 * screen.
 */
const StepProgress: React.FC<IStepProgressProps> = ({ labels, currentStep }) => {
    const total = labels.length;
    const target = total > 1 ? currentStep / (total - 1) : 1;
    const progress = useSharedValue(target);

    React.useEffect(() => {
        progress.value = withTiming(target, { duration: 300 });
    }, [target]);

    const fillStyle = useAnimatedStyle(() => ({
        width: `${Math.min(Math.max(progress.value, 0), 1) * 100}%`,
    }));

    return (
        <View className="gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {total}
                </Text>
                <Text className="text-sm font-medium text-primary">{labels[currentStep]}</Text>
            </View>
            <View className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <Animated.View className="h-full rounded-full bg-primary" style={fillStyle} />
            </View>
        </View>
    );
};

export default React.memo(StepProgress);
