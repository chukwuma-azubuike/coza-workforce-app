import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

import ROAST_COPY from '~/constants/roast-copy';
import { WIDGET_CLICK, WIDGET_STALE_AFTER_MS, WIDGET_VISIBLE_ROWS } from '~/constants/widget';
import { IRoastWidgetSnapshot, widgetFooterFor } from '~/utils/widget-bridge';

/**
 * The Android home-screen widget — 4x2 (`systemMedium`'s counterpart).
 *
 * Authored in JSX and compiled to `RemoteViews` by `react-native-android-widget`. Hand
 * written RemoteViews XML would have been the alternative: a fixed, small view vocabulary,
 * no custom drawing, and still a JS bridge needed for the data — so the same layout twice,
 * in two languages, drifting apart. This shares its vocabulary with the SwiftUI layout in
 * `targets/roast-widget/`, which is what keeps the two platforms saying the same thing.
 *
 * ⚠️ **No scrolling and no network, ever.** A widget process has a tiny memory budget and
 * no auth context. It renders a file the app left behind; everything else is the app's job.
 */

const COLOURS = {
    background: '#FFFFFF',
    backgroundDark: '#18181B',
    foreground: '#18181B',
    foregroundDark: '#FAFAFA',
    muted: '#71717A',
    border: '#E4E4E7',
    borderDark: '#27272A',
    primary: '#6B079C',
    destructive: '#DC2626',
    ember: '#F59E0B',
    emberAtRisk: '#A16207',
} as const;

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

const RoastWidget: React.FC<RoastWidgetProps> = ({ snapshot, isDark = false }) => {
    const foreground = isDark ? COLOURS.foregroundDark : COLOURS.foreground;
    const background = isDark ? COLOURS.backgroundDark : COLOURS.background;
    const border = isDark ? COLOURS.borderDark : COLOURS.border;

    const isStale = Date.now() - new Date(snapshot.generatedAt).getTime() > WIDGET_STALE_AFTER_MS;
    const rows = snapshot.items.slice(0, WIDGET_VISIBLE_ROWS);
    const remaining = snapshot.totalItems - rows.length;

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
                backgroundColor: background,
                borderRadius: 24,
                padding: 14,
            }}
        >
            {!snapshot.isSignedIn ? (
                <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center', alignItems: 'center' }}>
                    <TextWidget text="🔥" style={{ fontSize: 22, marginBottom: 4 }} />
                    <TextWidget text={ROAST_COPY.widget.signedOut} style={{ fontSize: 13, color: COLOURS.muted }} />
                </FlexWidget>
            ) : (
                <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'column' }}>
                    <FlexWidget
                        style={{
                            width: 'match_parent',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                        }}
                    >
                        <TextWidget
                            text={
                                snapshot.counts.overdue > 0
                                    ? `${snapshot.counts.due} due · ${snapshot.counts.overdue} overdue`
                                    : `${snapshot.counts.due} due`
                            }
                            style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: snapshot.counts.overdue > 0 ? COLOURS.destructive : foreground,
                            }}
                        />

                        <FlexWidget style={{ flex: 1 }} />

                        <TextWidget
                            text={`🔥 ${snapshot.streak.current}`}
                            style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: snapshot.streak.isAtRisk ? COLOURS.emberAtRisk : COLOURS.ember,
                            }}
                        />
                    </FlexWidget>

                    {rows.length === 0 ? (
                        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center' }}>
                            <TextWidget
                                text={ROAST_COPY.widget.empty}
                                style={{ fontSize: 14, fontWeight: '600', color: foreground }}
                            />
                        </FlexWidget>
                    ) : (
                        <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'column' }}>
                            {rows.map(item => (
                                <FlexWidget
                                    key={item.id}
                                    clickAction={WIDGET_CLICK.OPEN_URI}
                                    clickActionData={{ uri: item.deepLink }}
                                    accessibilityLabel={`${item.title}${item.isOverdue ? ', overdue' : ''}`}
                                    style={{
                                        width: 'match_parent',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 6,
                                        borderTopWidth: 1,
                                        borderTopColor: border,
                                    }}
                                >
                                    {/* Overdue is never colour alone — the time below is in
                                        the destructive colour and reads "Overdue" too. */}
                                    {item.isOverdue && (
                                        <FlexWidget
                                            style={{
                                                width: 3,
                                                height: 26,
                                                borderRadius: 2,
                                                backgroundColor: COLOURS.destructive,
                                                marginRight: 8,
                                            }}
                                        />
                                    )}

                                    <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
                                        <TextWidget
                                            text={item.title}
                                            maxLines={1}
                                            truncate="END"
                                            style={{ fontSize: 13, fontWeight: '500', color: foreground }}
                                        />
                                        <TextWidget
                                            text={
                                                item.isOverdue
                                                    ? `Overdue · ${timeFor(item.dueAt)}`
                                                    : timeFor(item.dueAt)
                                            }
                                            style={{
                                                fontSize: 11,
                                                color: item.isOverdue ? COLOURS.destructive : COLOURS.muted,
                                            }}
                                        />
                                    </FlexWidget>

                                    {/* Only a reminder can be completed from here. Everything
                                        else needs a screen, and a checkbox that opened the app
                                        would be a checkbox that lied. */}
                                    {item.completable && (
                                        <FlexWidget
                                            clickAction={WIDGET_CLICK.COMPLETE_REMINDER}
                                            clickActionData={{ reminderId: item.id }}
                                            accessibilityLabel={`Mark done: ${item.title}`}
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 17,
                                                borderWidth: 1,
                                                borderColor: border,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginLeft: 6,
                                            }}
                                        >
                                            <TextWidget text="✓" style={{ fontSize: 14, color: COLOURS.primary }} />
                                        </FlexWidget>
                                    )}
                                </FlexWidget>
                            ))}
                        </FlexWidget>
                    )}

                    <TextWidget
                        text={
                            isStale
                                ? `Updated ${relativeFor(snapshot.generatedAt)}`
                                : remaining > 0
                                  ? `+${remaining} more in Roast`
                                  : widgetFooterFor(snapshot)
                        }
                        maxLines={1}
                        truncate="END"
                        style={{ fontSize: 11, color: COLOURS.muted, marginTop: 6 }}
                    />
                </FlexWidget>
            )}
        </FlexWidget>
    );
};

export default RoastWidget;
