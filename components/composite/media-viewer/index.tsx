import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';

import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { normalizeUrl, openLinkExternally, shareLink, useLinkKind } from '~/components/composite/link-preview';
import PdfViewer from './pdf-viewer';
import ImageViewer from './image-viewer';
import AvViewer from './av-viewer';
import WebViewer, { type WebViewerHandle } from './web-viewer';
import { MissingLinkState, OfflineState, ResolvingState } from './viewer-states';

export * from './viewer-states';
export { default as PdfViewer } from './pdf-viewer';
export { default as ImageViewer } from './image-viewer';
export { default as WebViewer } from './web-viewer';
export { default as AvViewer } from './av-viewer';

interface MediaViewerProps {
    /** Raw link — normalised internally, so a scheme-less "site.com/x" is fine. */
    url?: string;
    /** Shown as the screen title and used when sharing. */
    title?: string;
    /** Set the navigation header title and actions. Off for embedded use. */
    withHeaderActions?: boolean;
}

/**
 * Opens whatever a link actually points at: a PDF, an image, a video or audio
 * file, an Office document, or an ordinary web page.
 *
 * Previously the congress resource screen assumed every link was a PDF, so any
 * normal URL landed on an error. The kind is resolved from the extension first,
 * then from the server's content type, and falls back to a web view — the one
 * renderer that degrades gracefully for anything unrecognised.
 */
export const MediaViewer: React.FC<MediaViewerProps> = ({ url, title, withHeaderActions = true }) => {
    const href = normalizeUrl(url);
    const navigation = useNavigation();
    const netInfo = useNetInfo();
    const { isDarkColorScheme } = useColorScheme();

    const { kind, isResolving } = useLinkKind(href);
    const webRef = React.useRef<WebViewerHandle>(null);
    const [retryKey, setRetryKey] = React.useState(0);

    const isOffline = netInfo.isInternetReachable === false;
    const iconColor = isDarkColorScheme ? THEME_CONFIG.lightGray : THEME_CONFIG.gray;

    // `setOptions` is a side effect and must not run during render — the screens
    // this replaces called it inline in the component body.
    React.useLayoutEffect(() => {
        if (!withHeaderActions) return;

        navigation.setOptions({
            title: title || 'Resource',
            headerRight: href
                ? () => (
                      <View className="flex-row items-center gap-1">
                          <TouchableOpacity
                              hitSlop={8}
                              accessibilityRole="button"
                              accessibilityLabel="Share link"
                              className="h-9 w-9 items-center justify-center"
                              onPress={() => shareLink(href, title)}
                          >
                              <Ionicons name="share-outline" size={19} color={iconColor} />
                          </TouchableOpacity>
                          <TouchableOpacity
                              hitSlop={8}
                              accessibilityRole="button"
                              accessibilityLabel="Open outside the app"
                              className="h-9 w-9 items-center justify-center"
                              onPress={() => openLinkExternally(href)}
                          >
                              <Ionicons name="open-outline" size={19} color={THEME_CONFIG.primaryLight} />
                          </TouchableOpacity>
                      </View>
                  )
                : undefined,
        });
    }, [navigation, title, href, iconColor, withHeaderActions]);

    const onRetry = React.useCallback(() => setRetryKey(key => key + 1), []);

    if (!href) return <MissingLinkState />;
    if (isOffline) return <OfflineState onRetry={onRetry} />;
    if (isResolving || !kind) return <ResolvingState url={href} title={title} />;

    switch (kind) {
        case 'pdf':
            return <PdfViewer key={retryKey} url={href} />;

        case 'image':
            return <ImageViewer key={retryKey} url={href} />;

        case 'video':
        case 'audio':
            return <AvViewer key={retryKey} url={href} kind={kind} title={title} />;

        case 'office':
            // Google's viewer renders Office formats that neither platform can
            // display natively.
            return (
                <WebViewer
                    key={retryKey}
                    ref={webRef}
                    sourceUrl={href}
                    withNavigationBar={false}
                    url={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(href)}`}
                />
            );

        case 'web':
        default:
            return <WebViewer key={retryKey} ref={webRef} url={href} sourceUrl={href} />;
    }
};

export default MediaViewer;
