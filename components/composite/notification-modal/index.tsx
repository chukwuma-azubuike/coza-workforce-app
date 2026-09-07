import React from 'react';
import {
    AccessibilityInfo,
    Animated,
    Easing,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import ModalAlertComponent from '../modal-alert';
import useModal, { useModalState } from '~/hooks/modal/useModal';
import { IModalItem } from '~/store/actions/modal';
import { THEME_CONFIG } from '@config/appConfig';

const ENTER_DURATION = 180;
const EXIT_DURATION = 140;

const HAPTIC_BY_STATUS = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
} as const;

/** Fire-and-forget: haptics reject on devices/emulators without a taptic engine. */
const triggerHaptic = (item: IModalItem) => {
    if (Platform.OS === 'web') return;

    const status = item.render?.status || item.status;
    const type = status ? HAPTIC_BY_STATUS[status as keyof typeof HAPTIC_BY_STATUS] : undefined;

    if (!type) return;

    Haptics.notificationAsync(type).catch(() => null);
};

const announce = (item: IModalItem) => {
    const description = item.render?.description;
    const body = typeof description === 'string' ? description : item.message;

    if (!body) return;

    AccessibilityInfo.announceForAccessibility([item.title, body].filter(Boolean).join('. '));
};

/**
 * App-wide alert surface, driven by `useModal().setModalState`.
 *
 * Built on React Native's `Modal` rather than the shared `Dialog` primitive on purpose:
 *  - it always renders above `@rneui` bottom sheets and other native modals, which the portal-based
 *    dialog does not, so alerts can no longer be silently hidden behind an open sheet;
 *  - it gives the Android hardware back button a real dismissal path;
 *  - it keeps the transition on RN's property animations, avoiding the reanimated layout-animation
 *    path that crashes the Fabric draw pass on Android.
 */
const NotificationModal: React.FC = () => {
    const modal = useModalState();
    const { dismissModal } = useModal();
    const { height } = useWindowDimensions();

    // The store drops the alert the instant it is dismissed; `content` holds on to it for the
    // length of the exit animation so the card does not blink out of existence.
    const [content, setContent] = React.useState<IModalItem | null>(null);
    const [visible, setVisible] = React.useState(false);
    // Measured once per layout; the countdown bar is driven by a translate, which needs a distance.
    const [trackWidth, setTrackWidth] = React.useState(0);

    const anim = React.useRef(new Animated.Value(0)).current;
    const progress = React.useRef(new Animated.Value(0)).current;

    // Read inside animation callbacks, which resolve after the state they were started from.
    const latestModal = React.useRef(modal);
    latestModal.current = modal;

    React.useEffect(() => {
        if (modal) {
            setContent(modal);
            setVisible(true);
            return;
        }

        if (!content) return;

        Animated.timing(anim, {
            toValue: 0,
            duration: EXIT_DURATION,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished || latestModal.current) return;

            setVisible(false);
            setContent(null);
        });
    }, [modal]);

    React.useEffect(() => {
        if (!content || !modal) return;

        anim.stopAnimation();
        anim.setValue(0);
        Animated.timing(anim, {
            toValue: 1,
            duration: ENTER_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();

        progress.stopAnimation();
        progress.setValue(0);

        if (content.durationMs) {
            Animated.timing(progress, {
                toValue: 1,
                duration: content.durationMs,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
        }

        triggerHaptic(content);
        announce(content);
    }, [content?.id]);

    const handleDismiss = React.useCallback(() => {
        if (!content || content.dismissible === false) return;

        dismissModal(content.id);
    }, [content, dismissModal]);

    if (!content) return null;

    const { render, message, status = 'info', title, button, defaultRender = true, durationMs } = content;
    const tint = THEME_CONFIG[render?.status || status];

    // A modal that never times out must always offer a way out.
    const showCloseButton = button || !durationMs;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleDismiss}
            accessibilityViewIsModal
        >
            <Animated.View className="flex-1 items-center justify-center bg-black/60 p-6" style={{ opacity: anim }}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleDismiss}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss notification"
                />
                <Animated.View
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    className="w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-lg"
                    style={{
                        transform: [
                            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                        ],
                    }}
                >
                    <ScrollView
                        bounces={false}
                        style={{ maxHeight: height * 0.7 }}
                        contentContainerClassName="items-center gap-5 px-6 pb-6 pt-8"
                        keyboardShouldPersistTaps="handled"
                    >
                        {!!title && <Text className="line-clamp-none text-center text-2xl font-bold">{title}</Text>}
                        {render ? (
                            <ModalAlertComponent
                                status={render.status || status}
                                iconType={render.iconType}
                                iconName={render.iconName}
                                description={render.description}
                            />
                        ) : defaultRender ? (
                            <ModalAlertComponent status={status} description={message} />
                        ) : (
                            <Text className="line-clamp-none py-2 text-center text-2xl">{message}</Text>
                        )}
                        {showCloseButton && (
                            <Button size="sm" variant="outline" className="w-full" onPress={handleDismiss}>
                                Close
                            </Button>
                        )}
                    </ScrollView>
                    {!!durationMs && (
                        <View
                            className="h-1 w-full overflow-hidden bg-muted"
                            onLayout={event => {
                                const width = event.nativeEvent.layout.width;
                                // Sub-pixel layout noise would otherwise re-render mid-countdown.
                                setTrackWidth(current => (Math.abs(current - width) > 0.5 ? width : current));
                            }}
                        >
                            {/*
                             * A full-width bar slid out through the clipped left edge, rather than an
                             * animated width. Width has to run on the JS driver and re-lays out the row
                             * every frame — on Fabric those passes land out of order and the bar visibly
                             * stutters backwards. A translate runs entirely on the native driver.
                             */}
                            <Animated.View
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: tint,
                                    transform: [
                                        {
                                            translateX: progress.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -trackWidth],
                                            }),
                                        },
                                    ],
                                }}
                            />
                        </View>
                    )}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default React.memo(NotificationModal);
