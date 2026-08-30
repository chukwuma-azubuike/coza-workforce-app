import { ContactChannel, ROAST_TASK_KIND } from '~/store/types';

/**
 * One glyph per task kind — the thing that lets a widget be triaged at a glance.
 *
 * Before this, a call, an invite, a note and a reminder were four identical pairs of text
 * lines and the only visual differentiator on the whole surface was a red bar for overdue.
 *
 * ## Shape carries the kind. Colour carries the urgency.
 *
 * Every glyph renders in the accent colour, and switches to the overdue colour when the
 * row is overdue. Six kinds in six colours is the obvious alternative and it is wrong
 * twice over: it makes a work surface look like a toy, and it spends the colour budget on
 * a distinction nobody needs while starving the one that matters.
 *
 * It is also what keeps the widget legible in **iOS 18 tinted mode**, which re-renders
 * everything monochrome from the alpha channel. A design where the kind is a tint becomes
 * six identical grey dots there. A design where the kind is a silhouette does not.
 *
 * ## Two renderings, one table
 *
 * iOS draws SF Symbols; Android draws these paths through `SvgWidget`, which takes a raw
 * SVG string — so no font has to be installed and no drawable pipeline exists. They cannot
 * share an asset, so they share this table: the SF Symbol name for each kind is in the
 * comment beside its path, and `WidgetGlyphs.swift` names the same symbols in the same
 * order.
 *
 * ⚠️ Adding a kind means editing this file **and** `targets/roast-widget/WidgetGlyphs.swift`.
 *
 * Paths are 24×24, stroke-based, hand-minified — six of these ride inside every
 * RemoteViews update and that payload has a hard transaction limit.
 */

const svg = (path: string, colour: string): string =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

/** Kept apart from `svg()` so the shapes can be read without the wrapper noise. */
const PATHS: Record<ROAST_TASK_KIND, string> = {
    /** SF Symbol: `bell.fill` */
    [ROAST_TASK_KIND.REMINDER]:
        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    /** SF Symbol: `phone.fill` */
    [ROAST_TASK_KIND.CALL_DUE]:
        '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2.1z"/>',
    /** SF Symbol: `arrow.uturn.left` */
    [ROAST_TASK_KIND.FOLLOW_UP]: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    /** SF Symbol: `envelope.fill` */
    [ROAST_TASK_KIND.INVITE]:
        '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    /** SF Symbol: `square.and.pencil` */
    [ROAST_TASK_KIND.NOTE]:
        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    /** SF Symbol: `chart.line.uptrend.xyaxis` */
    [ROAST_TASK_KIND.PROGRESS]: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
};

/** The glyph for a kind, already coloured. Unknown kinds fall back to the reminder bell. */
export const widgetGlyphFor = (kind: ROAST_TASK_KIND, colour: string): string =>
    svg(PATHS[kind] ?? PATHS[ROAST_TASK_KIND.REMINDER], colour);

/**
 * The row's action strip — Call, WhatsApp, Text.
 *
 * ⚠️ **Mirrored in `targets/roast-widget/WidgetGlyphs.swift`** under `action(for:)`, the
 * same hand-mirroring the kind table above lives under.
 *
 * WhatsApp is the awkward one. Its brand mark is not an SF Symbol and never will be, so
 * the two platforms cannot draw the same thing — and a green tile would be the only
 * branded colour on a surface whose whole colour budget is spent on urgency. So the strip
 * is semantic rather than branded: **one bubble is a text message, two bubbles are the
 * chat app, a handset is a call.** That distinction survives iOS 18's tinted mode, which a
 * brand colour would not, and the accessibility label carries the word either way.
 *
 * `VISIT` has no glyph because it has no URL — see `contactUrlFor`.
 */
const ACTION_PATHS: Partial<Record<ContactChannel, string>> = {
    /** SF Symbol: `phone.fill` — the same handset the `CALL_DUE` kind uses. */
    [ContactChannel.CALL]: PATHS[ROAST_TASK_KIND.CALL_DUE],
    /** SF Symbol: `bubble.left.and.bubble.right.fill` */
    [ContactChannel.WHATSAPP]:
        '<path d="M13 8a2 2 0 0 1-2 2H6l-3 3V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2z"/><path d="M17 8h2a2 2 0 0 1 2 2v11l-3-3h-7a2 2 0 0 1-2-2v-1"/>',
    /** SF Symbol: `message.fill` */
    [ContactChannel.SMS]: '<path d="M21 14a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};

/** The glyph for a contact channel, already coloured. `null` for one with nothing to draw. */
export const widgetActionGlyphFor = (channel: ContactChannel, colour: string): string | null => {
    const path = ACTION_PATHS[channel];

    return path ? svg(path, colour) : null;
};
