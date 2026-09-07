import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import LinkPreviewSheet from './link-preview-sheet';
import { openLinkExternally } from './open-link';
import { brandFor, hostOf, ILinkPost, normalizeUrl, pathOf, useLinkMetadata } from './utils';

export { LinkPreviewSheet };
export { openLinkExternally, shareLink } from './open-link';
export * from './utils';

interface LinkPreviewCardProps {
    url?: string;
    platform?: string;
    /** Fetch Open Graph data for a thumbnail + title. Off for long lists. */
    withMetadata?: boolean;
    onPreview?: (url: string, platform?: string, title?: string) => void;
    className?: string;
}

/**
 * A tappable rich link card. Tapping the body leaves the app for the link's own
 * handler (the native Instagram/YouTube app when installed, otherwise the
 * browser); the "Preview" action opens an in-app WebView sheet instead. When
 * Open Graph data is reachable the card upgrades itself to a thumbnail + title
 * layout, and quietly stays a compact branded row when it isn't.
 */
export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
    url,
    platform,
    withMetadata = true,
    onPreview,
    className,
}) => {
    const { isDarkColorScheme } = useColorScheme();
    const href = normalizeUrl(url);
    const brand = brandFor(href, platform);
    const { metadata, isLoading } = useLinkMetadata(href, withMetadata);

    const mutedIcon = isDarkColorScheme ? THEME_CONFIG.lightGray : THEME_CONFIG.gray;
    const title = metadata.title || platform?.trim() || brand.label;
    const subtitle = hostOf(href) + pathOf(href);

    // Nothing usable was typed into the URL field — show the raw text so the
    // reviewer can still see (and query) what the department entered.
    if (!href) {
        const raw = `${url ?? ''}`.trim();
        if (!raw && !platform?.trim()) return null;

        return (
            <View
                className={cn(
                    'rounded-2xl border border-dashed border-border bg-muted-background p-3.5 gap-1',
                    className
                )}
            >
                <View className="flex-row items-center gap-2">
                    <Ionicons name="alert-circle-outline" size={15} color={THEME_CONFIG.warning} />
                    <Text className="!text-[13px] font-semibold text-foreground">{platform?.trim() || 'Post'}</Text>
                </View>
                <Text className="!text-[12px] text-muted-foreground" numberOfLines={2}>
                    {raw ? `${raw} — not a valid link` : 'No link provided'}
                </Text>
            </View>
        );
    }

    const hasHero = !!metadata.image;

    return (
        <View className={cn('rounded-2xl border border-border bg-card overflow-hidden', className)}>
            <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="link"
                accessibilityLabel={`Open ${brand.label} post`}
                accessibilityHint="Opens outside the app"
                onPress={() => openLinkExternally(href)}
            >
                {hasHero ? (
                    <View>
                        <Image
                            source={{ uri: metadata.image }}
                            style={{ width: '100%', height: 168, backgroundColor: 'rgba(120,120,128,0.12)' }}
                            contentFit="cover"
                            transition={220}
                        />
                        <View
                            className="absolute left-3 bottom-3 flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                            style={{ backgroundColor: brand.color }}
                        >
                            <Ionicons name={brand.icon} size={12} color={brand.onColor} />
                            <Text className="!text-[11px] font-bold" style={{ color: brand.onColor }}>
                                {brand.label}
                            </Text>
                        </View>
                    </View>
                ) : null}

                <View className="flex-row items-center gap-3 p-3.5">
                    {!hasHero ? (
                        <View
                            className="h-11 w-11 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: brand.color }}
                        >
                            <Ionicons name={brand.icon} size={21} color={brand.onColor} />
                        </View>
                    ) : null}

                    <View className="flex-1 gap-1">
                        {isLoading && !metadata.title ? (
                            <>
                                <Skeleton className="h-3.5 w-3/4 rounded-full" />
                                <Skeleton className="h-2.5 w-1/2 rounded-full" />
                            </>
                        ) : (
                            <>
                                <Text className="!text-[14px] font-semibold text-foreground" numberOfLines={2}>
                                    {title}
                                </Text>
                                <Text className="!text-[12px] text-muted-foreground" numberOfLines={1}>
                                    {subtitle}
                                </Text>
                            </>
                        )}
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={mutedIcon} />
                </View>
            </TouchableOpacity>

            <View className="flex-row border-t border-border">
                <TouchableOpacity
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityLabel="Preview link in app"
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 border-r border-border"
                    onPress={() => onPreview?.(href, platform, metadata.title)}
                >
                    <Ionicons name="eye-outline" size={15} color={mutedIcon} />
                    <Text className="!text-[12px] font-semibold text-muted-foreground">Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityLabel="Open link outside the app"
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5"
                    onPress={() => openLinkExternally(href)}
                >
                    <Ionicons name="open-outline" size={15} color={THEME_CONFIG.primaryLight} />
                    <Text className="!text-[12px] font-semibold text-primary">Open</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface LinkPreviewListProps {
    posts?: ILinkPost[];
    emptyLabel?: string;
    withMetadata?: boolean;
}

/**
 * Read-only rendering of a report's link list. Owns the preview sheet so only
 * one WebView is ever mounted, however many links the report carries.
 */
export const LinkPreviewList: React.FC<LinkPreviewListProps> = ({
    posts,
    emptyLabel = 'No links were added to this report.',
    withMetadata = true,
}) => {
    const [preview, setPreview] = React.useState<{ url: string; platform?: string; title?: string } | null>(null);

    const visiblePosts = React.useMemo(
        () => (posts ?? []).filter(post => `${post?.url ?? ''}`.trim() || `${post?.platform ?? ''}`.trim()),
        [posts]
    );

    const onPreview = React.useCallback((url: string, platform?: string, title?: string) => {
        setPreview({ url, platform, title });
    }, []);

    if (!visiblePosts.length) {
        return (
            <View className="items-center gap-1.5 rounded-2xl bg-muted-background py-6">
                <Ionicons name="link-outline" size={20} color={THEME_CONFIG.lightGray} />
                <Text className="!text-[12px] text-muted-foreground text-center px-6">{emptyLabel}</Text>
            </View>
        );
    }

    return (
        <View className="gap-3">
            {visiblePosts.map((post, index) => (
                <LinkPreviewCard
                    key={`${post?.url ?? 'post'}-${index}`}
                    url={post?.url}
                    platform={post?.platform}
                    withMetadata={withMetadata}
                    onPreview={onPreview}
                />
            ))}
            <LinkPreviewSheet
                visible={!!preview}
                url={preview?.url}
                platform={preview?.platform}
                title={preview?.title}
                onClose={() => setPreview(null)}
            />
        </View>
    );
};

export default LinkPreviewList;
