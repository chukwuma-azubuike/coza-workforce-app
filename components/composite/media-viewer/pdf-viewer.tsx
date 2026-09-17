import * as React from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf-jsi';

import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { FailureState } from './viewer-states';

interface PdfViewerProps {
    url: string;
    onFailure?: () => void;
}

/**
 * PDF rendering with a page counter.
 *
 * The viewer is always mounted and the progress indicator sits on top of it.
 * The previous implementation rendered the spinner *instead of* `<Pdf />` while
 * loading, so the component that was supposed to report progress never
 * mounted and the screen could never leave its loading state.
 */
const PdfViewer: React.FC<PdfViewerProps> = ({ url, onFailure }) => {
    const { isDarkColorScheme } = useColorScheme();

    const [progress, setProgress] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasFailed, setHasFailed] = React.useState(false);
    const [reloadKey, setReloadKey] = React.useState(0);
    const [pages, setPages] = React.useState({ current: 0, total: 0 });

    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const onLoadComplete = React.useCallback(
        (totalPages: number) => {
            setPages(state => ({ ...state, total: totalPages }));
            setIsLoading(false);
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        },
        [fadeAnim]
    );

    const onError = React.useCallback(() => {
        setIsLoading(false);
        setHasFailed(true);
        onFailure?.();
    }, [onFailure]);

    const retry = React.useCallback(() => {
        setHasFailed(false);
        setIsLoading(true);
        setProgress(0);
        fadeAnim.setValue(0);
        setReloadKey(key => key + 1);
    }, [fadeAnim]);

    if (hasFailed) {
        return <FailureState url={url} body="This document couldn't be opened in the app." onRetry={retry} />;
    }

    return (
        <View className="flex-1 bg-card">
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                <Pdf
                    key={reloadKey}
                    trustAllCerts={false}
                    onError={onError}
                    source={{ uri: url, cache: true }}
                    onLoadComplete={onLoadComplete}
                    onLoadProgress={percent => setProgress(percent)}
                    onPageChanged={current => setPages(state => ({ ...state, current }))}
                    style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: isDarkColorScheme ? THEME_CONFIG.darkGray : THEME_CONFIG.veryVeryLightGray },
                    ]}
                />
            </Animated.View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center gap-3">
                    <ActivityIndicator size="small" color={THEME_CONFIG.primaryLight} />
                    <Text className="!text-[12px] text-muted-foreground">
                        {progress > 0 ? `Loading document… ${Math.round(progress * 100)}%` : 'Loading document…'}
                    </Text>
                </View>
            ) : null}

            {!isLoading && pages.total > 1 ? (
                <View className="absolute bottom-5 self-center rounded-full bg-black/70 px-3.5 py-1.5">
                    <Text className="!text-[11px] font-semibold text-white">
                        {pages.current || 1} of {pages.total}
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

export default React.memo(PdfViewer);
