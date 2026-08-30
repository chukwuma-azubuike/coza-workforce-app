import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import ROAST_COPY from '~/constants/roast-copy';
import { WIDGET_CLICK, WIDGET_STALE_AFTER_MS, WIDGET_VISIBLE_ROWS } from '~/constants/widget';
import { widgetGlyphFor } from '~/constants/widget-glyphs';
import { IWidgetPalette, WIDGET_COLOURS, WIDGET_RADIUS, WIDGET_SPACE, WIDGET_TYPE } from '~/constants/widget-theme';
// `import type`, so this edge erases at build and the require cycle documented in
// `widget-bridge.ts` stays one-directional.
import type { IRoastWidgetSnapshot, IRoastWidgetSnapshotItem } from '~/utils/widget-bridge';
import { widgetFooterFor } from '~/utils/widget-bridge';

/**
 * The Android home-screen widget — 4x2 (`systemMedium`'s counterpart).
 *
 * Authored in JSX and compiled to `RemoteViews` by `react-native-android-widget`. Hand
 * written RemoteViews XML would have been the alternative: a fixed, small view vocabulary,
 * no custom drawing, and still a JS bridge needed for the data — so the same layout twice,
 * in two languages, drifting apart. This shares its vocabulary *and now its tokens* with
 * the SwiftUI layout in `targets/roast-widget/`, which is what keeps the two platforms
 * saying the same thing.
 *
 * ⚠️ **No scrolling and no network, ever.** A widget process has a tiny memory budget and
 * no auth context. It renders a file the app left behind; everything else is the app's job.
 *
 * ## What RemoteViews can and cannot do
 *
 * It can do more than the first version of this file assumed: `backgroundGradient` with
 * eight orientations, per-corner radii, `letterSpacing`, `lineHeight`,
 * `adjustsFontSizeToFit`, and — the one that matters most — `SvgWidget`, which takes a raw
 * SVG **string**, so real vector iconography needs no font installed and no drawable
 * pipeline.
 *
 * It cannot draw a shadow or an elevation. So depth here is a shallow gradient plus a
 * hairline, exactly as on iOS, rather than a dark rectangle pretending to be a shadow.
 *
 * ## The vertical budget
 *
 * `app.json` declares `minHeight: '130dp'` for this widget, and the layout below spends
 * all of it. **That is only possible because the footer is conditional** — the note under
 * each row and an always-present footer line cannot both fit. A launcher that hands over
 * less clips from the bottom, so the order of loss is: footer (already gone unless it has
 * something to admit), then the second row's note. Same degradation order as iOS.
 */

interface RoastWidgetProps {
    snapshot: IRoastWidgetSnapshot;
    /** RemoteViews cannot read the theme itself; the handler renders both and Android picks. */
    isDark?: boolean;
}

const timeFor = (iso: string): string => {
    const date = new Date(iso);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const relativeFor = (iso: string): string => {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

    if (minutes < 1) {
        return 'just now';
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.round(minutes / 60);

    return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

/**
 * One task.
 *
 * The rail keeps its lane whether or not the row is overdue — it used to be rendered
 * *only* when overdue, so an overdue row's text began 11dp further right than a normal
 * one's. Nothing on the surface said "unfinished" as loudly as text that did not line up.
 */
const Row: React.FC<{ item: IRoastWidgetSnapshotItem; palette: IWidgetPalette }> = ({ item, palette }) => {
    const accent = item.isOverdue ? palette.overdue : palette.accent;

    return (
        <FlexWidget
            clickAction={WIDGET_CLICK.OPEN_URI}
            clickActionData={{ uri: item.deepLink }}
            accessibilityLabel={`${item.title}${item.isOverdue ? ', overdue' : `, ${timeFor(item.dueAt)}`}${
                item.subtitle ? `, ${item.subtitle}` : ''
            }`}
            style={{
                width: 'match_parent',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: WIDGET_RADIUS.row,
                backgroundColor: item.isOverdue ? palette.overdueFill : palette.rowFill,
                paddingHorizontal: WIDGET_SPACE.rowPaddingH,
                paddingVertical: WIDGET_SPACE.rowPaddingV,
                marginBottom: WIDGET_SPACE.rowGap,
            }}
        >
            <FlexWidget
                style={{
                    width: WIDGET_SPACE.railWidth,
                    height: 30,
                    borderRadius: 2,
                    backgroundColor: item.isOverdue ? palette.overdue : '#00000000',
                    marginRight: 8,
                }}
            />

            {/* Shape carries the kind, colour carries the urgency — see `widget-glyphs.ts`. */}
            <SvgWidget svg={widgetGlyphFor(item.kind, accent)} style={{ width: 14, height: 14, marginRight: 8 }} />

            <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
                <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center' }}>
                    <TextWidget
                        text={item.title}
                        maxLines={1}
                        truncate="END"
                        style={{
                            fontSize: WIDGET_TYPE.title.size,
                            fontWeight: WIDGET_TYPE.title.weight,
                            letterSpacing: WIDGET_TYPE.title.letterSpacing,
                            color: palette.foreground,
                        }}
                    />

                    <FlexWidget style={{ flex: 1 }} />

                    {/* Never colour alone. The word is what survives a monochrome render. */}
                    <TextWidget
                        text={item.isOverdue ? 'OVERDUE' : timeFor(item.dueAt)}
                        style={
                            item.isOverdue
                                ? {
                                      fontSize: WIDGET_TYPE.label.size,
                                      fontWeight: WIDGET_TYPE.label.weight,
                                      letterSpacing: WIDGET_TYPE.label.letterSpacing,
                                      color: palette.overdue,
                                      marginLeft: 6,
                                  }
                                : {
                                      fontSize: WIDGET_TYPE.meta.size,
                                      fontWeight: WIDGET_TYPE.meta.weight,
                                      color: palette.muted,
                                      marginLeft: 6,
                                  }
                        }
                    />
                </FlexWidget>

                {/* The note. Already in the snapshot, already redacted under
                    `hideGuestNames`, and rendered by neither platform until now. An
                    overdue row with no note still has to say when it was due. */}
                {(!!item.subtitle || item.isOverdue) && (
                    <TextWidget
                        text={item.subtitle || timeFor(item.dueAt)}
                        maxLines={1}
                        truncate="END"
                        style={{
                            fontSize: WIDGET_TYPE.subtitle.size,
                            fontWeight: WIDGET_TYPE.subtitle.weight,
                            color: palette.muted,
                            // First thing to shrink when the system font scale is cranked
                            // up — the note is the most expendable line in the row.
                            adjustsFontSizeToFit: true,
                        }}
                    />
                )}
            </FlexWidget>

            {/* Only a reminder can be completed from here. Everything else needs a screen,
                and a checkbox that opened the app would be a checkbox that lied. Filled
                rather than hairline-outlined, because it genuinely is pressable and a
                control that reads as decoration does not get pressed. */}
            {item.completable && (
                <FlexWidget
                    clickAction={WIDGET_CLICK.COMPLETE_REMINDER}
                    clickActionData={{ reminderId: item.id }}
                    accessibilityLabel={`Mark done: ${item.title}`}
                    style={{
                        width: WIDGET_SPACE.checkbox,
                        height: WIDGET_SPACE.checkbox,
                        borderRadius: WIDGET_RADIUS.checkbox,
                        backgroundColor: palette.accentFill,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 6,
                    }}
                >
                    <TextWidget text="✓" style={{ fontSize: 14, fontWeight: '700', color: palette.accent }} />
                </FlexWidget>
            )}
        </FlexWidget>
    );
};

/**
 * The streak, as a capsule rather than a bare emoji.
 *
 * It was `🔥 5` at 13sp, drawn by whatever emoji font the OEM shipped — Samsung's flame is
 * not Google's — and it is the one delightful thing in the feature. At risk the pill
 * **inverts** to a hollow outline rather than merely dimming, because a shape change
 * survives a monochrome render and an opacity change does not.
 */
const StreakPill: React.FC<{ snapshot: IRoastWidgetSnapshot; palette: IWidgetPalette }> = ({ snapshot, palette }) => (
    <FlexWidget
        accessibilityLabel={
            snapshot.streak.isAtRisk
                ? `Streak at risk, ${snapshot.streak.current} days`
                : `${snapshot.streak.current} day streak`
        }
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: WIDGET_RADIUS.pill,
            paddingHorizontal: 8,
            paddingVertical: 4,
            ...(snapshot.streak.isAtRisk
                ? { borderWidth: 1, borderColor: palette.emberFrom }
                : {
                      backgroundGradient: {
                          from: palette.emberFrom,
                          to: palette.emberTo,
                          orientation: 'TL_BR' as const,
                      },
                  }),
        }}
    >
        <TextWidget text="🔥" style={{ fontSize: 10, marginRight: 3 }} />
        <TextWidget
            text={`${snapshot.streak.current}`}
            style={{
                fontSize: WIDGET_TYPE.figure.size,
                fontWeight: WIDGET_TYPE.figure.weight,
                color: snapshot.streak.isAtRisk ? palette.emberFrom : '#FFFFFF',
            }}
        />
    </FlexWidget>
);

/** Centred mark + headline + subline, the same three-part shape as the app's empty states. */
const Placeholder: React.FC<{ title: string; body: string; palette: IWidgetPalette }> = ({ title, body, palette }) => (
    <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center', alignItems: 'center' }}>
        <FlexWidget
            style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: palette.accentFill,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
            }}
        >
            <TextWidget text="🔥" style={{ fontSize: 18 }} />
        </FlexWidget>
        <TextWidget
            text={title}
            style={{
                fontSize: WIDGET_TYPE.title.size,
                fontWeight: WIDGET_TYPE.title.weight,
                color: palette.foreground,
            }}
        />
        <TextWidget text={body} style={{ fontSize: WIDGET_TYPE.subtitle.size, color: palette.muted }} />
    </FlexWidget>
);

const RoastWidget: React.FC<RoastWidgetProps> = ({ snapshot, isDark = false }) => {
    const palette = isDark ? WIDGET_COLOURS.dark : WIDGET_COLOURS.light;

    const isStale = Date.now() - new Date(snapshot.generatedAt).getTime() > WIDGET_STALE_AFTER_MS;
    const rows = snapshot.items.slice(0, WIDGET_VISIBLE_ROWS);
    const remaining = snapshot.totalItems - rows.length;

    // Rendered only when the widget has something to admit — see `widgetFooterFor`, which
    // is where the rule lives so that iOS and Android cannot word it differently.
    const footer = widgetFooterFor(snapshot, { isStale, relative: relativeFor(snapshot.generatedAt) });

    return (
        <FlexWidget
            // The whole surface opens the app. Row-level actions override this, so the
            // fallback is never a dead tap.
            clickAction={WIDGET_CLICK.OPEN_APP}
            accessibilityLabel="Roast — today's tasks"
            style={{
                height: 'match_parent',
                width: 'match_parent',
                flexDirection: 'column',
                // Depth without a shadow: two stops a few percent apart. A wider spread
                // bands visibly on low-end panels.
                backgroundGradient: {
                    from: palette.backgroundFrom,
                    to: palette.backgroundTo,
                    orientation: 'TOP_BOTTOM',
                },
                borderRadius: WIDGET_RADIUS.container,
                borderWidth: 1,
                borderColor: palette.hairline,
                padding: WIDGET_SPACE.containerPadding,
            }}
        >
            {!snapshot.isSignedIn ? (
                <Placeholder
                    title={ROAST_COPY.widget.signedOut}
                    body="Your guests and your streak."
                    palette={palette}
                />
            ) : (
                <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'column' }}>
                    <FlexWidget
                        style={{
                            width: 'match_parent',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: WIDGET_SPACE.headerGap,
                        }}
                    >
                        <TextWidget
                            text={
                                snapshot.counts.overdue > 0
                                    ? `${snapshot.counts.due} due · ${snapshot.counts.overdue} overdue`
                                    : `${snapshot.counts.due} due`
                            }
                            maxLines={1}
                            truncate="END"
                            style={{
                                fontSize: WIDGET_TYPE.figure.size,
                                fontWeight: WIDGET_TYPE.figure.weight,
                                color: snapshot.counts.overdue > 0 ? palette.overdue : palette.foreground,
                            }}
                        />

                        <FlexWidget style={{ flex: 1 }} />

                        {remaining > 0 && (
                            <FlexWidget
                                style={{
                                    borderRadius: WIDGET_RADIUS.pill,
                                    backgroundColor: palette.rowFill,
                                    paddingHorizontal: 7,
                                    paddingVertical: 3,
                                    marginRight: 6,
                                }}
                            >
                                <TextWidget
                                    text={`+${remaining}`}
                                    style={{
                                        fontSize: WIDGET_TYPE.label.size,
                                        fontWeight: WIDGET_TYPE.label.weight,
                                        letterSpacing: WIDGET_TYPE.label.letterSpacing,
                                        color: palette.muted,
                                    }}
                                />
                            </FlexWidget>
                        )}

                        <StreakPill snapshot={snapshot} palette={palette} />
                    </FlexWidget>

                    {rows.length === 0 ? (
                        <Placeholder
                            title={ROAST_COPY.today.emptyTitle}
                            body={ROAST_COPY.today.emptyBody}
                            palette={palette}
                        />
                    ) : (
                        <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'column' }}>
                            {rows.map(item => (
                                <Row key={item.id} item={item} palette={palette} />
                            ))}
                        </FlexWidget>
                    )}

                    {!!footer && (
                        <TextWidget
                            text={footer}
                            maxLines={1}
                            truncate="END"
                            style={{
                                fontSize: WIDGET_TYPE.meta.size,
                                fontWeight: WIDGET_TYPE.meta.weight,
                                color: isStale ? palette.muted : palette.emberFrom,
                            }}
                        />
                    )}
                </FlexWidget>
            )}
        </FlexWidget>
    );
};

export default RoastWidget;
