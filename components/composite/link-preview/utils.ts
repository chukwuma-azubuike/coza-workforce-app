import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';

export interface ILinkPost {
    platform?: string;
    url?: string;
}

export interface ILinkMetadata {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

export interface IPlatformBrand {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    /** Brand colour — used for the icon tile and accent text. */
    color: string;
    /** Foreground colour to sit on top of `color`. */
    onColor: string;
}

const FALLBACK_BRAND: IPlatformBrand = { label: 'Link', icon: 'link', color: '#6B079C', onColor: '#FFFFFF' };

// Ordered — first match wins, so narrower patterns sit above broader ones.
const BRANDS: { match: RegExp; brand: IPlatformBrand }[] = [
    {
        match: /instagr(am\.com|\.am)/,
        brand: { label: 'Instagram', icon: 'logo-instagram', color: '#E1306C', onColor: '#FFFFFF' },
    },
    {
        match: /threads\.(net|com)/,
        brand: { label: 'Threads', icon: 'logo-threads', color: '#101010', onColor: '#FFFFFF' },
    },
    {
        match: /(facebook\.com|fb\.watch|fb\.me)/,
        brand: { label: 'Facebook', icon: 'logo-facebook', color: '#1877F2', onColor: '#FFFFFF' },
    },
    {
        match: /(twitter\.com|(^|\/\/|\.)x\.com)/,
        brand: { label: 'X', icon: 'logo-x', color: '#0F1419', onColor: '#FFFFFF' },
    },
    {
        match: /(youtube\.com|youtu\.be)/,
        brand: { label: 'YouTube', icon: 'logo-youtube', color: '#FF0000', onColor: '#FFFFFF' },
    },
    { match: /tiktok\.com/, brand: { label: 'TikTok', icon: 'logo-tiktok', color: '#111111', onColor: '#FFFFFF' } },
    {
        match: /(linkedin\.com|lnkd\.in)/,
        brand: { label: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2', onColor: '#FFFFFF' },
    },
    {
        match: /(wa\.me|whatsapp\.com)/,
        brand: { label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', onColor: '#FFFFFF' },
    },
    {
        match: /(t\.me|telegram\.(me|org))/,
        brand: { label: 'Telegram', icon: 'paper-plane', color: '#229ED9', onColor: '#FFFFFF' },
    },
    {
        match: /snapchat\.com/,
        brand: { label: 'Snapchat', icon: 'logo-snapchat', color: '#FFC800', onColor: '#111111' },
    },
    {
        match: /(pinterest\.|pin\.it)/,
        brand: { label: 'Pinterest', icon: 'logo-pinterest', color: '#E60023', onColor: '#FFFFFF' },
    },
    { match: /reddit\.com/, brand: { label: 'Reddit', icon: 'logo-reddit', color: '#FF4500', onColor: '#FFFFFF' } },
    { match: /vimeo\.com/, brand: { label: 'Vimeo', icon: 'logo-vimeo', color: '#1AB7EA', onColor: '#FFFFFF' } },
    { match: /twitch\.tv/, brand: { label: 'Twitch', icon: 'logo-twitch', color: '#9146FF', onColor: '#FFFFFF' } },
    {
        match: /soundcloud\.com/,
        brand: { label: 'SoundCloud', icon: 'logo-soundcloud', color: '#FF5500', onColor: '#FFFFFF' },
    },
    {
        match: /(spotify\.com|spoti\.fi)/,
        brand: { label: 'Spotify', icon: 'musical-notes', color: '#1DB954', onColor: '#FFFFFF' },
    },
    { match: /mixlr\.com/, brand: { label: 'Mixlr', icon: 'radio', color: '#F26F21', onColor: '#FFFFFF' } },
    {
        match: /(drive|docs)\.google\.com/,
        brand: { label: 'Google Drive', icon: 'logo-google', color: '#1A73E8', onColor: '#FFFFFF' },
    },
];

/**
 * Reports are typed by hand, so a URL may arrive without a scheme
 * ("instagram.com/p/xyz") or with stray whitespace. Returns an absolute https
 * URL, or `undefined` when the value can't plausibly be a link.
 */
export const normalizeUrl = (raw?: string | null): string | undefined => {
    const value = `${raw ?? ''}`.trim().replace(/\s+/g, '');
    if (!value) return undefined;
    if (/^https?:\/\//i.test(value)) return value;
    // Bare domain — must have at least one dot and a plausible TLD.
    if (/^[\w-]+(\.[\w-]+)+(\/|$|\?|#)/.test(value)) return `https://${value}`;
    return undefined;
};

/** "https://www.instagram.com/p/xyz?a=1" → "instagram.com" */
export const hostOf = (url?: string): string => {
    if (!url) return '';
    const [host] = url
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split(/[/?#]/);
    return (host ?? '').toLowerCase();
};

/** "https://www.instagram.com/p/xyz?a=1" → "/p/xyz" */
export const pathOf = (url?: string): string => {
    if (!url) return '';
    const withoutHost = url.replace(/^https?:\/\//i, '').replace(/^[^/]+/, '');
    return withoutHost.split(/[?#]/)[0] || '';
};

/**
 * Brand lookup keyed off the URL first (authoritative), then the free-text
 * platform label the reporter typed, so "Instagram" still resolves when the
 * link points at a shortener.
 */
export const brandFor = (url?: string, platform?: string): IPlatformBrand => {
    const haystack = `${url ?? ''}`.toLowerCase();
    const byUrl = BRANDS.find(({ match }) => match.test(haystack));
    if (byUrl) return byUrl.brand;

    const label = `${platform ?? ''}`.trim();
    if (label) {
        const byLabel = BRANDS.find(({ brand }) => brand.label.toLowerCase() === label.toLowerCase());
        if (byLabel) return byLabel.brand;
        return { ...FALLBACK_BRAND, label };
    }
    return FALLBACK_BRAND;
};

// ─── Open Graph scraping ────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    '#39': "'",
    '#x27': "'",
    '#x2F': '/',
};

const decodeEntities = (value: string): string =>
    value.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (whole, code: string) => {
        const known = ENTITIES[code];
        if (known) return known;
        if (/^#x/i.test(code)) return String.fromCharCode(parseInt(code.slice(2), 16));
        if (/^#/.test(code)) return String.fromCharCode(parseInt(code.slice(1), 10));
        return whole;
    });

const attr = (tag: string, name: string): string | undefined => {
    const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
    return match ? (match[2] ?? match[3] ?? match[4]) : undefined;
};

const parseMetadata = (html: string, baseUrl: string): ILinkMetadata => {
    const tags = html.match(/<meta\s[^>]*>/gi) ?? [];
    const bag: Record<string, string> = {};

    tags.forEach(tag => {
        const key = (attr(tag, 'property') || attr(tag, 'name') || attr(tag, 'itemprop') || '').toLowerCase();
        const content = attr(tag, 'content');
        if (key && content && !bag[key]) bag[key] = decodeEntities(content).trim();
    });

    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    const image = bag['og:image'] || bag['og:image:secure_url'] || bag['twitter:image'] || bag['image'];

    return {
        title: bag['og:title'] || bag['twitter:title'] || (titleTag ? decodeEntities(titleTag).trim() : undefined),
        description: bag['og:description'] || bag['twitter:description'] || bag['description'],
        siteName: bag['og:site_name'] || bag['application-name'],
        image: image ? absolutize(image, baseUrl) : undefined,
    };
};

const absolutize = (candidate: string, baseUrl: string): string | undefined => {
    if (/^https?:\/\//i.test(candidate)) return candidate;
    if (/^\/\//.test(candidate)) return `https:${candidate}`;
    if (/^\//.test(candidate)) return `https://${hostOf(baseUrl)}${candidate}`;
    return undefined;
};

const CACHE = new Map<string, ILinkMetadata>();
const INFLIGHT = new Map<string, Promise<ILinkMetadata>>();
const TIMEOUT_MS = 8000;
const MAX_HTML = 300_000;

// Desktop UA — several social platforms only emit Open Graph tags to something
// that looks like a crawler-capable browser.
const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/**
 * Fetches Open Graph metadata for a link so the card can render a rich preview
 * (thumbnail + title) the way a chat app would. Results are memoised for the
 * session; failures resolve to an empty object rather than throwing, since the
 * card degrades to a plain branded row.
 */
export const fetchLinkMetadata = async (url: string): Promise<ILinkMetadata> => {
    const cached = CACHE.get(url);
    if (cached) return cached;

    const pending = INFLIGHT.get(url);
    if (pending) return pending;

    const request = (async (): Promise<ILinkMetadata> => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
            });

            const contentType = response.headers.get('content-type') ?? '';
            if (/^image\//i.test(contentType)) return { image: url };
            if (!/html|xml/i.test(contentType)) return {};

            const html = (await response.text()).slice(0, MAX_HTML);
            return parseMetadata(html, url);
        } catch {
            return {};
        } finally {
            clearTimeout(timer);
            INFLIGHT.delete(url);
        }
    })();

    INFLIGHT.set(url, request);
    const result = await request;
    CACHE.set(url, result);
    return result;
};

export type LinkMetadataStatus = 'idle' | 'loading' | 'ready';

export const useLinkMetadata = (url?: string, enabled: boolean = true) => {
    const [metadata, setMetadata] = React.useState<ILinkMetadata>({});
    const [status, setStatus] = React.useState<LinkMetadataStatus>('idle');

    React.useEffect(() => {
        if (!url || !enabled) {
            setStatus('idle');
            setMetadata({});
            return;
        }

        const cached = CACHE.get(url);
        if (cached) {
            setMetadata(cached);
            setStatus('ready');
            return;
        }

        let active = true;
        setStatus('loading');
        setMetadata({});

        fetchLinkMetadata(url).then(result => {
            if (!active) return;
            setMetadata(result);
            setStatus('ready');
        });

        return () => {
            active = false;
        };
    }, [url, enabled]);

    return { metadata, status, isLoading: status === 'loading' };
};
