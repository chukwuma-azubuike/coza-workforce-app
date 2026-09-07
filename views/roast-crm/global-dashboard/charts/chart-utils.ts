import dayjs from 'dayjs';

/* ────────────────────────────────────────────────────────────────────────────
 * Shared chart primitives for the Roast CRM dashboards.
 *
 * Both the Zone Performance (grouped bars) and Monthly Trends (multi-line) charts
 * are rendered with pure `react-native-svg` so we own every tick, gridline and
 * label — no more interpolated `undefined` axis marks or empty axes.
 * ──────────────────────────────────────────────────────────────────────────── */

export type FunnelKey = 'invited' | 'attended' | 'discipled' | 'joined';

export interface SeriesConfig {
    key: FunnelKey;
    label: string;
    color: string;
}

/** The four assimilation-funnel metrics, in funnel order. Colours match the Legend. */
export const FUNNEL_SERIES: SeriesConfig[] = [
    { key: 'invited', label: 'Invited', color: '#6B7280' },
    { key: 'attended', label: 'Attended', color: '#3B82F6' },
    { key: 'discipled', label: 'Discipled', color: '#8B5CF6' },
    { key: 'joined', label: 'Joined', color: '#10B981' },
];

export interface XY {
    x: number;
    y: number;
}

/* ── Number formatting ─────────────────────────────────────────────────────── */

/** Compact, human-readable numbers for axis ticks (e.g. 1.2k, 3.4M). */
export const formatCompactNumber = (value?: number): string => {
    if (value == null || Number.isNaN(value)) return '—';
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    return Math.round(value).toLocaleString();
};

/* ── Axis scaling ──────────────────────────────────────────────────────────── */

/**
 * Builds a set of evenly-spaced, "nice" y-axis ticks from 0 up to a rounded
 * ceiling ≥ rawMax. The last entry is the domain max to scale against.
 * Always returns at least `[0, 1]` so an all-zero dataset still draws an axis.
 */
export const buildYTicks = (rawMax: number, tickCount = 4): number[] => {
    if (!Number.isFinite(rawMax) || rawMax <= 0) return [0, 1];

    const rough = rawMax / tickCount;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;

    let step: number;
    if (norm <= 1) step = 1;
    else if (norm <= 2) step = 2;
    else if (norm <= 2.5) step = 2.5;
    else if (norm <= 5) step = 5;
    else step = 10;
    step *= pow;

    const niceMax = Math.ceil(rawMax / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= niceMax + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
};

/* ── Path generation ───────────────────────────────────────────────────────── */

/** Catmull-Rom → cubic-bezier smooth path (replaces skia's `curveType="catmullRom"`). */
export const catmullRomPath = (pts: XY[]): string => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(
            2
        )} ${p2.y.toFixed(2)}`;
    }
    return d;
};

/** SVG path for a bar with only its top two corners rounded. */
export const roundedTopRectPath = (x: number, y: number, w: number, h: number, radius: number): string => {
    if (h <= 0) return '';
    const r = Math.max(0, Math.min(radius, w / 2, h));
    return [
        `M ${x.toFixed(2)} ${(y + h).toFixed(2)}`,
        `L ${x.toFixed(2)} ${(y + r).toFixed(2)}`,
        `Q ${x.toFixed(2)} ${y.toFixed(2)} ${(x + r).toFixed(2)} ${y.toFixed(2)}`,
        `L ${(x + w - r).toFixed(2)} ${y.toFixed(2)}`,
        `Q ${(x + w).toFixed(2)} ${y.toFixed(2)} ${(x + w).toFixed(2)} ${(y + r).toFixed(2)}`,
        `L ${(x + w).toFixed(2)} ${(y + h).toFixed(2)}`,
        'Z',
    ].join(' ');
};

/* ── Donut / polar geometry ────────────────────────────────────────────────── */

/** Polar → cartesian with 0° at 12 o'clock, increasing clockwise. */
export const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number): XY => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

/** SVG path for a donut segment between two angles (degrees, clockwise from top). */
export const donutSlicePath = (
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    startAngle: number,
    endAngle: number
): string => {
    // Cap a full-circle slice just shy of 360° so the arc still renders.
    const end = endAngle - startAngle >= 360 ? startAngle + 359.999 : endAngle;
    const largeArc = end - startAngle > 180 ? 1 : 0;

    const oEnd = polarToCartesian(cx, cy, rOuter, end);
    const oStart = polarToCartesian(cx, cy, rOuter, startAngle);
    const iStart = polarToCartesian(cx, cy, rInner, startAngle);
    const iEnd = polarToCartesian(cx, cy, rInner, end);

    return [
        `M ${oEnd.x.toFixed(2)} ${oEnd.y.toFixed(2)}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${oStart.x.toFixed(2)} ${oStart.y.toFixed(2)}`,
        `L ${iStart.x.toFixed(2)} ${iStart.y.toFixed(2)}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 1 ${iEnd.x.toFixed(2)} ${iEnd.y.toFixed(2)}`,
        'Z',
    ].join(' ');
};

/** Stable colour for a known funnel/stage name; falls back to a provided colour then a palette. */
export const STAGE_PALETTE = ['#6B7280', '#3B82F6', '#8B5CF6', '#10B981', '#0EA5E9', '#F59E0B', '#F87171', '#14B8A6'];

export const stageColor = (name: string, fallback?: string, index = 0): string => {
    const key = name.toLowerCase();
    if (key.includes('invite')) return '#6B7280';
    if (key.includes('attend')) return '#3B82F6';
    if (key.includes('discipl')) return '#8B5CF6';
    if (key.includes('join')) return '#10B981';
    return fallback || STAGE_PALETTE[index % STAGE_PALETTE.length] || '#6B7280';
};

/* ── Labels ────────────────────────────────────────────────────────────────── */

/**
 * Evenly-spaced label indices (always including first & last), capped at
 * `maxLabels` and de-duplicated so short series don't double up.
 */
export const thinnedIndices = (count: number, maxLabels: number): number[] => {
    if (count <= 0) return [];
    if (count <= maxLabels) return Array.from({ length: count }, (_, i) => i);

    const labelCount = Math.max(2, maxLabels);
    return Array.from({ length: labelCount }, (_, k) => Math.round((k * (count - 1)) / (labelCount - 1))).filter(
        (v, i, arr) => arr.indexOf(v) === i
    );
};

/** Truncate long category labels; empty/nullish → empty string. */
export const truncateLabel = (s: string | null | undefined, max = 10): string => {
    if (!s) return '';
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

/* ── Dates ─────────────────────────────────────────────────────────────────── */

/**
 * Robustly parse a `month` value that may be an ISO string, a unix timestamp in
 * seconds, or one in milliseconds (matches the heuristic the charts relied on).
 */
export const parseMonth = (month: string | number): dayjs.Dayjs => {
    const raw = String(month).trim();
    const n = Number(raw);
    if (raw !== '' && !Number.isNaN(n)) {
        const asMs = n > 1e12 ? n : n < 1e11 ? n * 1000 : n;
        return dayjs(asMs);
    }
    return dayjs(month);
};

/* ── Theme-aware chart colours ─────────────────────────────────────────────── */

export const chartTheme = (isDark: boolean) => ({
    axisText: isDark ? '#A1A1AA' : '#71717A',
    grid: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    baseline: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
    crosshair: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
    dotRing: isDark ? '#18181B' : '#FFFFFF',
});
