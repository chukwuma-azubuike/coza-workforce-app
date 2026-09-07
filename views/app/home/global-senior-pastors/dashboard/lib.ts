import dayjs from 'dayjs';
import { THEME_CONFIG } from '@config/appConfig';
import { IGspWindowPreset } from '@store/actions/gsp-dashboard';

/* ────────────────────────────────────────────────────────────────────────────
 * Reporting window resolution
 *
 * All API date params are epoch SECONDS. Filtering is on each report's service
 * time, so "this month" = services held in the current calendar month.
 * ──────────────────────────────────────────────────────────────────────────── */
export interface IResolvedWindow {
    /** epoch seconds */
    start: number;
    /** epoch seconds */
    end: number;
    label: string;
    /** Previous comparable window (same length immediately before), epoch seconds. */
    previous: { start: number; end: number };
}

export const WINDOW_PRESETS: { value: IGspWindowPreset; label: string }[] = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'thisYear', label: 'This Year' },
];

export const resolveWindow = (preset: IGspWindowPreset): IResolvedWindow => {
    const now = dayjs();
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;
    let label: string;

    switch (preset) {
        case 'lastMonth': {
            const m = now.subtract(1, 'month');
            start = m.startOf('month');
            end = m.endOf('month');
            label = m.format('MMMM YYYY');
            break;
        }
        case 'last3Months':
            start = now.subtract(2, 'month').startOf('month');
            end = now.endOf('month');
            label = `${start.format('MMM')} – ${end.format('MMM YYYY')}`;
            break;
        case 'last6Months':
            start = now.subtract(5, 'month').startOf('month');
            end = now.endOf('month');
            label = `${start.format('MMM')} – ${end.format('MMM YYYY')}`;
            break;
        case 'thisYear':
            start = now.startOf('year');
            end = now.endOf('year');
            label = now.format('YYYY');
            break;
        case 'thisMonth':
        default:
            start = now.startOf('month');
            end = now.endOf('month');
            label = now.format('MMMM YYYY');
            break;
    }

    const startSec = start.unix();
    const endSec = end.unix();
    const span = endSec - startSec;

    return {
        start: startSec,
        end: endSec,
        label,
        previous: { start: startSec - span - 1, end: startSec - 1 },
    };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Stable per-campus colours — same campus keeps its colour across every chart.
 * Deterministic hash → fixed palette index (colour is always paired with labels,
 * never the sole signal).
 * ──────────────────────────────────────────────────────────────────────────── */
export const CAMPUS_PALETTE = [
    THEME_CONFIG.primary,
    THEME_CONFIG.info,
    THEME_CONFIG.warning,
    THEME_CONFIG.success,
    THEME_CONFIG.rose,
    THEME_CONFIG.primaryLight,
    THEME_CONFIG.blue,
    '#0EA5E9',
    '#D946EF',
    '#14B8A6',
    '#F59E0B',
    '#8B5CF6',
];

const hashString = (input: string): number => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export const campusColor = (campusId?: string): string => {
    if (!campusId) return THEME_CONFIG.gray;
    return CAMPUS_PALETTE[hashString(campusId) % CAMPUS_PALETTE.length] ?? THEME_CONFIG.gray;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Formatters
 * ──────────────────────────────────────────────────────────────────────────── */
export const formatCompactNumber = (value?: number): string => {
    if (value == null || Number.isNaN(value)) return '—';
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    return Math.round(value).toLocaleString();
};

export const formatPercent = (fraction?: number, digits = 0): string => {
    if (fraction == null || Number.isNaN(fraction)) return '—';
    return `${(fraction * 100).toFixed(digits)}%`;
};

/** Returns a signed, human-readable delta string e.g. "+6.2%" / "−3.0%". */
export const formatDelta = (fraction?: number): string | undefined => {
    if (fraction == null || Number.isNaN(fraction)) return undefined;
    const pct = (fraction * 100).toFixed(1).replace(/\.0$/, '');
    if (fraction > 0) return `+${pct}%`;
    if (fraction < 0) return `−${Math.abs(Number(pct))}%`;
    return '0%';
};

export type DeltaTone = 'good' | 'bad' | 'neutral';

/** Up is usually good; pass invert for metrics where down is good (e.g. absentees). */
export const deltaTone = (fraction?: number, invert = false): DeltaTone => {
    if (fraction == null || fraction === 0) return 'neutral';
    const positive = fraction > 0;
    const isGood = invert ? !positive : positive;
    return isGood ? 'good' : 'bad';
};

/** Maps a 0..1 completion/attendance rate to an accent tone for pills/bars. */
export const rateTone = (rate?: number): 'good' | 'warn' | 'bad' => {
    if (rate == null) return 'warn';
    if (rate >= 0.8) return 'good';
    if (rate >= 0.5) return 'warn';
    return 'bad';
};

/** Best-effort human message from an RTK Query error (envelope `message`, HTTP status, etc.). */
export const getQueryErrorMessage = (error: unknown): string => {
    const e = error as { status?: number | string; data?: any; error?: string } | undefined;
    if (!e) return 'Request failed.';
    const fromData =
        typeof e.data === 'string' ? e.data : e.data?.message || e.data?.error || (e.data ? undefined : undefined);
    const status = e.status !== undefined ? ` (${e.status})` : '';
    if (fromData) return `${fromData}${status}`;
    if (e.status === 403) return 'You are not authorised to view this dashboard (403).';
    if (e.status === 401) return 'Your session has expired. Please sign in again (401).';
    if (e.error) return `${e.error}${status}`;
    return `Could not load data${status}.`;
};
