import * as React from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { FailureState } from './viewer-states';

const MAX_SCALE = 4;
const MIN_SCALE = 1;
const DOUBLE_TAP_SCALE = 2.5;

interface ImageViewerProps {
    url: string;
    onFailure?: () => void;
}

/**
 * Full-bleed image with pinch-to-zoom, pan and double-tap — what anyone expects
 * after tapping a picture.
 *
 * Deliberately uses plain animated styles only: reanimated's `entering` /
 * `layout` animations are a known trigger of the Android Fabric
 * `dispatchGetDisplayList` crash in this app, so they're avoided here.
 * `GestureHandlerRootView` is mounted locally because the root layout does not
 * provide one (see components/Kanban/index.tsx for the same approach).
 */
const ImageViewer: React.FC<ImageViewerProps> = ({ url, onFailure }) => {
    const { width, height } = Dimensions.get('window');

    const [isLoading, setIsLoading] = React.useState(true);
    const [hasFailed, setHasFailed] = React.useState(false);
    const [isZoomed, setIsZoomed] = React.useState(false);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinch = React.useMemo(
        () =>
            Gesture.Pinch()
                .onUpdate(event => {
                    const next = savedScale.value * event.scale;
                    scale.value = Math.min(Math.max(next, MIN_SCALE * 0.6), MAX_SCALE);
                })
                .onEnd(() => {
                    // Rubber-band back when pinched below the natural size.
                    if (scale.value < MIN_SCALE) {
                        scale.value = withTiming(MIN_SCALE);
                        savedScale.value = MIN_SCALE;
                        translateX.value = withTiming(0);
                        translateY.value = withTiming(0);
                        savedTranslateX.value = 0;
                        savedTranslateY.value = 0;
                        runOnJS(setIsZoomed)(false);
                        return;
                    }
                    savedScale.value = scale.value;
                    runOnJS(setIsZoomed)(scale.value > MIN_SCALE);
                }),
        [scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]
    );

    const pan = React.useMemo(
        () =>
            Gesture.Pan()
                // One finger only while zoomed out, so a zoomed-out image never
                // drifts and the parent scroll/stack gestures keep working.
                .averageTouches(true)
                .onUpdate(event => {
                    if (scale.value <= MIN_SCALE) return;
                    const bound = (scale.value - 1) * 0.5;
                    translateX.value = Math.min(
                        Math.max(savedTranslateX.value + event.translationX, -width * bound),
                        width * bound
                    );
                    translateY.value = Math.min(
                        Math.max(savedTranslateY.value + event.translationY, -height * bound),
                        height * bound
                    );
                })
                .onEnd(() => {
                    savedTranslateX.value = translateX.value;
                    savedTranslateY.value = translateY.value;
                }),
        [scale, translateX, translateY, savedTranslateX, savedTranslateY, width, height]
    );

    const doubleTap = React.useMemo(
        () =>
            Gesture.Tap()
                .numberOfTaps(2)
                .onEnd(() => {
                    if (scale.value > MIN_SCALE) {
                        scale.value = withTiming(MIN_SCALE);
                        savedScale.value = MIN_SCALE;
                        translateX.value = withTiming(0);
                        translateY.value = withTiming(0);
                        savedTranslateX.value = 0;
                        savedTranslateY.value = 0;
                        runOnJS(setIsZoomed)(false);
                        return;
                    }
                    scale.value = withTiming(DOUBLE_TAP_SCALE);
                    savedScale.value = DOUBLE_TAP_SCALE;
                    runOnJS(setIsZoomed)(true);
                }),
        [scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]
    );

    const gesture = React.useMemo(
        () => Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan)),
        [pinch, doubleTap, pan]
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    }));

    if (hasFailed) {
        return (
            <FailureState
                url={url}
                body="This image couldn't be loaded."
                onRetry={() => {
                    setHasFailed(false);
                    setIsLoading(true);
                }}
            />
        );
    }

    return (
        <GestureHandlerRootView className="flex-1">
            <View className="flex-1 bg-black">
                <GestureDetector gesture={gesture}>
                    <Animated.View className="flex-1 items-center justify-center" style={animatedStyle}>
                        <Image
                            source={{ uri: url }}
                            style={{ width, height: height * 0.8 }}
                            contentFit="contain"
                            transition={220}
                            onLoadEnd={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasFailed(true);
                                onFailure?.();
                            }}
                        />
                    </Animated.View>
                </GestureDetector>

                {isLoading ? (
                    <View className="absolute inset-0 items-center justify-center">
                        <ActivityIndicator size="small" color={THEME_CONFIG.primaryLight} />
                    </View>
                ) : null}

                {!isLoading ? (
                    <View className="absolute bottom-6 self-center rounded-full bg-white/15 px-3.5 py-1.5">
                        <Text className="!text-[11px] font-medium text-white">
                            {isZoomed ? 'Double-tap to reset' : 'Pinch or double-tap to zoom'}
                        </Text>
                    </View>
                ) : null}
            </View>
        </GestureHandlerRootView>
    );
};

export default React.memo(ImageViewer);
