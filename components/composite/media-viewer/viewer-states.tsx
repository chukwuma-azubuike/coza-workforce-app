import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { brandFor, hostOf, openLinkExternally } from '~/components/composite/link-preview';

/**
 * The shared loading / empty / failure surfaces for the media viewer. Kept in
 * one place so a PDF that won't open and a web page that won't load fail in
 * exactly the same way.
 */

interface ViewerShellProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    body?: string;
    children?: React.ReactNode;
}

/** Centred icon-tile + copy layout every non-content state shares. */
export const ViewerMessage: React.FC<ViewerShellProps> = ({ icon, title, body, children }) => {
    const { isDarkColorScheme } = useColorScheme();
    const iconColor = isDarkColorScheme ? THEME_CONFIG.lightGray : THEME_CONFIG.gray;

    return (
        <View className="flex-1 items-center justify-center gap-3 px-8">
            <View className="h-16 w-16 rounded-3xl items-center justify-center bg-muted-background">
                <Ionicons name={icon} size={28} color={iconColor} />
            </View>
            <Text className="!text-base font-bold text-foreground text-center">{title}</Text>
            {!!body && <Text className="!text-[13px] text-muted-foreground text-center leading-relaxed">{body}</Text>}
            {!!children && <View className="flex-row gap-3 mt-1">{children}</View>}
        </View>
    );
};

interface ResolvingStateProps {
    url?: string;
    title?: string;
}

/**
 * Shown while we're still asking the server what the link is. A branded
 * skeleton rather than a bare spinner, so the screen reads as "preparing your
 * document" instead of "nothing happened".
 */
export const ResolvingState: React.FC<ResolvingStateProps> = ({ url, title }) => {
    const brand = brandFor(url);
    const host = hostOf(url);

    return (
        <View className="flex-1 px-6 pt-10 gap-6">
            <View className="flex-row items-center gap-3">
                <View
                    className="h-12 w-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: brand.color }}
                >
                    <Ionicons name={brand.icon} size={22} color={brand.onColor} />
                </View>
                <View className="flex-1 gap-1">
                    <Text className="!text-[15px] font-bold text-foreground" numberOfLines={1}>
                        {title || brand.label}
                    </Text>
                    <Text className="!text-[12px] text-muted-foreground" numberOfLines={1}>
                        {host}
                    </Text>
                </View>
            </View>

            <View className="gap-3">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-3.5 w-3/4 rounded-full" />
                <Skeleton className="h-3.5 w-1/2 rounded-full" />
            </View>

            <View className="flex-row items-center justify-center gap-2 mt-2">
                <ActivityIndicator size="small" color={THEME_CONFIG.primaryLight} />
                <Text className="!text-[12px] text-muted-foreground">Preparing preview…</Text>
            </View>
        </View>
    );
};

interface FailureStateProps {
    url?: string;
    /** Description of what failed, e.g. "This document couldn't be opened." */
    body?: string;
    onRetry?: () => void;
}

export const FailureState: React.FC<FailureStateProps> = ({ url, body, onRetry }) => (
    <ViewerMessage
        icon="alert-circle-outline"
        title="Couldn't open this"
        body={body ?? `${hostOf(url) || 'This link'} didn't return anything we could display in the app.`}
    >
        {!!onRetry && (
            <Button size="sm" variant="outline" onPress={onRetry}>
                Try again
            </Button>
        )}
        <Button size="sm" onPress={() => openLinkExternally(url)}>
            Open externally
        </Button>
    </ViewerMessage>
);

export const OfflineState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
    <ViewerMessage
        icon="cloud-offline-outline"
        title="You're offline"
        body="Reconnect to load this resource. Nothing was lost — it'll open as soon as you're back online."
    >
        {!!onRetry && (
            <Button size="sm" onPress={onRetry}>
                Try again
            </Button>
        )}
    </ViewerMessage>
);

export const MissingLinkState: React.FC = () => (
    <ViewerMessage
        icon="link-outline"
        title="No resource attached"
        body="This message doesn't have a link to open yet."
    />
);
