import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { FailureState } from './viewer-states';

interface AvViewerProps {
    url: string;
    kind: 'video' | 'audio';
    title?: string;
    onFailure?: () => void;
}

/**
 * Plays a direct media file (an .mp4 or .mp3 sitting on S3, as opposed to a
 * YouTube page) inside a minimal HTML5 shell.
 *
 * The app ships no video player package, and adding one would mean a new native
 * module — which the pinned production OTA runtime can't take. A WebView with
 * native `controls` gives real playback, scrubbing and fullscreen on both
 * platforms with no native change at all.
 */
const AvViewer: React.FC<AvViewerProps> = ({ url, kind, title, onFailure }) => {
    const { isDarkColorScheme } = useColorScheme();

    const [isLoading, setIsLoading] = React.useState(true);
    const [hasFailed, setHasFailed] = React.useState(false);
    const [reloadKey, setReloadKey] = React.useState(0);

    const background = isDarkColorScheme ? '#000000' : '#0B0B0F';

    const html = React.useMemo(() => {
        const safeUrl = url.replace(/"/g, '&quot;');
        const element =
            kind === 'video'
                ? `<video src="${safeUrl}" controls playsinline autoplay preload="metadata"></video>`
                : `<audio src="${safeUrl}" controls preload="metadata"></audio>`;

        return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: ${background};
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, system-ui, Roboto, sans-serif;
      }
      video { width: 100%; max-height: 100%; background: ${background}; }
      audio { width: 88%; }
      .label {
        position: fixed; top: 16px; left: 0; right: 0;
        text-align: center; color: rgba(255,255,255,0.7);
        font-size: 13px; padding: 0 24px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
    </style>
  </head>
  <body>
    ${kind === 'audio' && title ? `<div class="label">${title.replace(/</g, '&lt;')}</div>` : ''}
    ${element}
    <script>
      var media = document.querySelector('${kind}');
      media.addEventListener('error', function () {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage('media-error');
      });
    </script>
  </body>
</html>`;
    }, [url, kind, title, background]);

    if (hasFailed) {
        return (
            <FailureState
                url={url}
                body={`This ${kind} couldn't be played in the app. Your device's player will handle it.`}
                onRetry={() => {
                    setHasFailed(false);
                    setIsLoading(true);
                    setReloadKey(key => key + 1);
                }}
            />
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: background }}>
            <WebView
                key={reloadKey}
                source={{ html }}
                originWhitelist={['*']}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => {
                    setHasFailed(true);
                    onFailure?.();
                }}
                onMessage={event => {
                    if (event.nativeEvent.data === 'media-error') {
                        setHasFailed(true);
                        onFailure?.();
                    }
                }}
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                style={{ flex: 1, backgroundColor: background }}
            />

            {isLoading ? (
                <View className="absolute inset-0 items-center justify-center gap-3">
                    <ActivityIndicator size="small" color={THEME_CONFIG.primaryLight} />
                    <Text className="!text-[12px] text-white/70">Loading {kind}…</Text>
                </View>
            ) : null}
        </View>
    );
};

export default React.memo(AvViewer);
