import * as React from 'react';
import { ActivityIndicator, Animated, Modal, Platform, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useColorScheme } from '~/lib/useColorScheme';
import { THEME_CONFIG } from '~/config/appConfig';
import { brandFor, hostOf, normalizeUrl } from './utils';
import { openLinkExternally, shareLink } from './open-link';

interface LinkPreviewSheetProps {
    visible: boolean;
    url?: string;
    platform?: string;
    title?: string;
    onClose: () => void;
}

/**
 * In-app preview of an outbound link: a sheet holding a real WebView, with a
 * loading shimmer, a graceful failure state (plenty of social pages refuse to
 * render inside a webview at all), and a one-tap hand-off to the platform's own
 * app. Kept separate from the card so a screen only mounts one WebView at a
 * time no matter how many links it lists.
 */
const LinkPreviewSheet: React.FC<LinkPreviewSheetProps> = ({ visible, url, platform, title, onClose }) => {
    const insets = useSafeAreaInsets();
    const { isDarkColorScheme } = useColorScheme();

    const href = normalizeUrl(url);
    const brand = brandFor(href, platform);
    const host = hostOf(href);

    const [progress, setProgress] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasFailed, setHasFailed] = React.useState(false);
    const [reloadKey, setReloadKey] = React.useState(0);
    const [currentUrl, setCurrentUrl] = React.useState(href);

    const progressAnim = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (!visible) return;
        setProgress(0);
        setIsLoading(true);
        setHasFailed(false);
        setCurrentUrl(href);
        progressAnim.setValue(0);
        fadeAnim.setValue(0);
    }, [visible, href]);

    React.useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const onLoadEnd = React.useCallback(() => {
        setIsLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }, []);

    const retry = React.useCallback(() => {
        setHasFailed(false);
        setIsLoading(true);
        setProgress(0);
        progressAnim.setValue(0);
        fadeAnim.setValue(0);
        setReloadKey(key => key + 1);
    }, []);

    // Deep links (instagram://, tel:, mailto:) can't render in a webview — hand
    // them to the OS instead of letting the WebView error out.
    const onShouldStartLoadWithRequest = React.useCallback((request: WebViewNavigation) => {
        if (/^https?:\/\//i.test(request.url)) return true;
        openLinkExternally(request.url);
        return false;
    }, []);

    const iconColor = isDarkColorScheme ? THEME_CONFIG.lightGray : THEME_CONFIG.gray;

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View
                    className="bg-background rounded-t-3xl overflow-hidden"
                    style={{ height: '92%', paddingBottom: insets.bottom }}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View className="w-10 h-1 rounded-full bg-muted" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center gap-3 px-4 py-3">
                        <View
                            className="h-10 w-10 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: brand.color }}
                        >
                            <Ionicons name={brand.icon} size={20} color={brand.onColor} />
                        </View>
                        <View className="flex-1">
                            <Text className="!text-[15px] font-bold text-foreground" numberOfLines={1}>
                                {title || brand.label}
                            </Text>
                            <Text className="!text-[11px] text-muted-foreground" numberOfLines={1}>
                                {hostOf(currentUrl) || host}
                            </Text>
                        </View>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Share link"
                            hitSlop={8}
                            className="h-9 w-9 items-center justify-center rounded-full bg-muted-background"
                            onPress={() => shareLink(currentUrl || href, title)}
                        >
                            <Ionicons name="share-outline" size={17} color={iconColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Close preview"
                            hitSlop={8}
                            className="h-9 w-9 items-center justify-center rounded-full bg-muted-background"
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={19} color={iconColor} />
                        </TouchableOpacity>
                    </View>

                    {/* Determinate load progress */}
                    <View className="h-0.5 bg-border">
                        {isLoading && !hasFailed ? (
                            <Animated.View
                                className="h-0.5"
                                style={{
                                    backgroundColor: THEME_CONFIG.primaryLight,
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['4%', '100%'],
                                    }),
                                }}
                            />
                        ) : null}
                    </View>

                    {/* Body */}
                    <View className="flex-1 bg-card">
                        {hasFailed ? (
                            <View className="flex-1 items-center justify-center gap-3 px-8">
                                <View className="h-16 w-16 rounded-3xl items-center justify-center bg-muted-background">
                                    <Ionicons name="cloud-offline-outline" size={28} color={iconColor} />
                                </View>
                                <Text className="!text-base font-bold text-foreground text-center">
                                    Preview unavailable
                                </Text>
                                <Text className="!text-[13px] text-muted-foreground text-center leading-relaxed">
                                    {brand.label} wouldn&apos;t load this post inside the app. Opening it in{' '}
                                    {brand.label === 'Link' ? 'your browser' : brand.label} will work.
                                </Text>
                                <View className="flex-row gap-3 mt-1">
                                    <Button size="sm" variant="outline" onPress={retry}>
                                        Try again
                                    </Button>
                                    <Button size="sm" onPress={() => openLinkExternally(href)}>
                                        Open link
                                    </Button>
                                </View>
                            </View>
                        ) : href ? (
                            <>
                                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                                    <WebView
                                        key={reloadKey}
                                        source={{ uri: href }}
                                        originWhitelist={['http://*', 'https://*']}
                                        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
                                        onLoadEnd={onLoadEnd}
                                        onError={() => setHasFailed(true)}
                                        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                                        onNavigationStateChange={state => setCurrentUrl(state.url)}
                                        setSupportMultipleWindows={false}
                                        allowsInlineMediaPlayback
                                        mediaPlaybackRequiresUserAction
                                        javaScriptEnabled
                                        domStorageEnabled
                                        pullToRefreshEnabled={Platform.OS === 'android'}
                                        style={{ flex: 1, backgroundColor: 'transparent' }}
                                    />
                                </Animated.View>
                                {isLoading ? (
                                    <View className="absolute inset-0 items-center justify-center gap-3">
                                        <ActivityIndicator size="small" color={THEME_CONFIG.primaryLight} />
                                        <Text className="!text-[12px] text-muted-foreground">
                                            Loading preview from {host}…
                                        </Text>
                                    </View>
                                ) : null}
                            </>
                        ) : null}
                    </View>

                    {/* Hand-off */}
                    <View className="px-4 pt-3 pb-2 border-t border-border bg-background">
                        <Button
                            className="h-12 rounded-xl"
                            onPress={() => openLinkExternally(href)}
                            startIcon={<Ionicons name="open-outline" size={17} color="#FFF" />}
                        >
                            {brand.label === 'Link' ? 'Open in browser' : `Open in ${brand.label}`}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default LinkPreviewSheet;
