import * as React from 'react';
import { ActivityIndicator, Animated, Platform, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { hostOf, openLinkExternally } from '~/components/composite/link-preview';
import { FailureState } from './viewer-states';

export interface WebViewerHandle {
    reload: () => void;
}

interface WebViewerProps {
    /** Address to load. For Office documents this is the gview wrapper URL. */
    url: string;
    /** The original link, used for external hand-off and failure copy. */
    sourceUrl?: string;
    /** Hide the navigation bar for embedded content that can't be navigated. */
    withNavigationBar?: boolean;
    onFailure?: () => void;
}

/**
 * Full-screen in-app browser: determinate progress, fade-in, a real failure
 * state and a bottom navigation bar. Mirrors the behaviour of
 * `link-preview/link-preview-sheet.tsx` — the sheet is a modal over a list,
 * this is a pushed screen — so both surfaces fail and navigate identically.
 */
const WebViewer = React.forwardRef<WebViewerHandle, WebViewerProps>(
    ({ url, sourceUrl, withNavigationBar = true, onFailure }, ref) => {
        const insets = useSafeAreaInsets();
        const { isDarkColorScheme } = useColorScheme();

        const webRef = React.useRef<WebView>(null);
        const [progress, setProgress] = React.useState(0);
        const [isLoading, setIsLoading] = React.useState(true);
        const [hasFailed, setHasFailed] = React.useState(false);
        const [reloadKey, setReloadKey] = React.useState(0);
        const [currentUrl, setCurrentUrl] = React.useState(url);
        const [canGoBack, setCanGoBack] = React.useState(false);
        const [canGoForward, setCanGoForward] = React.useState(false);

        const progressAnim = React.useRef(new Animated.Value(0)).current;
        const fadeAnim = React.useRef(new Animated.Value(0)).current;

        const retry = React.useCallback(() => {
            setHasFailed(false);
            setIsLoading(true);
            setProgress(0);
            progressAnim.setValue(0);
            fadeAnim.setValue(0);
            setReloadKey(key => key + 1);
        }, [progressAnim, fadeAnim]);

        React.useImperativeHandle(ref, () => ({ reload: retry }), [retry]);

        React.useEffect(() => {
            Animated.timing(progressAnim, { toValue: progress, duration: 180, useNativeDriver: false }).start();
        }, [progress, progressAnim]);

        const onLoadEnd = React.useCallback(() => {
            setIsLoading(false);
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        }, [fadeAnim]);

        // Deep links (instagram://, tel:, mailto:) can't render in a webview —
        // hand them to the OS instead of letting the WebView error out.
        const onShouldStartLoadWithRequest = React.useCallback((request: WebViewNavigation) => {
            if (/^https?:\/\//i.test(request.url)) return true;
            openLinkExternally(request.url);
            return false;
        }, []);

        const tap = React.useCallback((action: () => void) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
            action();
        }, []);

        const iconColor = isDarkColorScheme ? THEME_CONFIG.lightGray : THEME_CONFIG.gray;
        const disabledColor = isDarkColorScheme ? THEME_CONFIG.gray : THEME_CONFIG.veryLightGray;
        const background = isDarkColorScheme ? THEME_CONFIG.darkGray : THEME_CONFIG.white;

        if (hasFailed) {
            return (
                <FailureState
                    url={sourceUrl ?? url}
                    body={`${hostOf(sourceUrl ?? url) || 'This page'} wouldn't load inside the app. Opening it in your browser will work.`}
                    onRetry={retry}
                />
            );
        }

        return (
            <View className="flex-1 bg-background">
                {/* Determinate load progress */}
                <View className="h-0.5 bg-border">
                    {isLoading ? (
                        <Animated.View
                            className="h-0.5"
                            style={{
                                backgroundColor: THEME_CONFIG.primaryLight,
                                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['4%', '100%'] }),
                            }}
                        />
                    ) : null}
                </View>

                <View className="flex-1">
                    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                        <WebView
                            ref={webRef}
                            key={reloadKey}
                            source={{ uri: url }}
                            originWhitelist={['http://*', 'https://*']}
                            onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
                            onLoadEnd={onLoadEnd}
                            onError={() => {
                                setHasFailed(true);
                                onFailure?.();
                            }}
                            onHttpError={({ nativeEvent }) => {
                                // Android reports sub-resource failures here too. Only a
                                // bad status on the main document means the page is
                                // genuinely unreachable — a missing tracking pixel or
                                // font shouldn't blank out a page that rendered fine.
                                const isMainDocument = nativeEvent.url === url || nativeEvent.url === currentUrl;
                                if (isMainDocument && nativeEvent.statusCode >= 400) setHasFailed(true);
                            }}
                            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                            onNavigationStateChange={state => {
                                setCurrentUrl(state.url);
                                setCanGoBack(state.canGoBack);
                                setCanGoForward(state.canGoForward);
                            }}
                            setSupportMultipleWindows={false}
                            allowsInlineMediaPlayback
                            mediaPlaybackRequiresUserAction
                            javaScriptEnabled
                            domStorageEnabled
                            allowsBackForwardNavigationGestures
                            pullToRefreshEnabled={Platform.OS === 'android'}
                            style={{ flex: 1, backgroundColor: background }}
                        />
                    </Animated.View>

                    {isLoading ? (
                        <View className="absolute inset-0 items-center justify-center gap-3 bg-background">
                            <ActivityIndicator size="small" color={THEME_CONFIG.primaryLight} />
                            <Text className="!text-[12px] text-muted-foreground">
                                Loading {hostOf(sourceUrl ?? url) || 'page'}…
                            </Text>
                        </View>
                    ) : null}
                </View>

                {withNavigationBar ? (
                    <View
                        className="flex-row items-center gap-1 px-3 pt-2 border-t border-border bg-background"
                        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
                    >
                        <TouchableOpacity
                            hitSlop={8}
                            disabled={!canGoBack}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                            className="h-9 w-9 items-center justify-center"
                            onPress={() => tap(() => webRef.current?.goBack())}
                        >
                            <Ionicons name="chevron-back" size={22} color={canGoBack ? iconColor : disabledColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            hitSlop={8}
                            disabled={!canGoForward}
                            accessibilityRole="button"
                            accessibilityLabel="Go forward"
                            className="h-9 w-9 items-center justify-center"
                            onPress={() => tap(() => webRef.current?.goForward())}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={22}
                                color={canGoForward ? iconColor : disabledColor}
                            />
                        </TouchableOpacity>

                        <Text className="!text-[11px] text-muted-foreground flex-1 text-center" numberOfLines={1}>
                            {hostOf(currentUrl) || hostOf(url)}
                        </Text>

                        <TouchableOpacity
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Reload page"
                            className="h-9 w-9 items-center justify-center"
                            onPress={() => tap(() => webRef.current?.reload())}
                        >
                            <Ionicons name="refresh" size={19} color={iconColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Open in browser"
                            className="h-9 w-9 items-center justify-center"
                            onPress={() => openLinkExternally(currentUrl || sourceUrl || url)}
                        >
                            <Ionicons name="open-outline" size={19} color={THEME_CONFIG.primaryLight} />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        );
    }
);

WebViewer.displayName = 'WebViewer';

export default React.memo(WebViewer);
