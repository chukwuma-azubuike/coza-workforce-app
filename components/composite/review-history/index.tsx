import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { IReviewHistoryEntry } from '@store/types';
import { cn } from '~/lib/utils';

interface ReviewHistoryProps {
    // Most report forms pass this straight through from expo-router params,
    // which mangles nested arrays into a string (or drops them) unless the
    // caller wrapped the whole payload in a `data: JSON.stringify(...)`
    // envelope — so this can arrive as a real array, a JSON string, or junk.
    history?: IReviewHistoryEntry[] | string | null;
    title?: string;
    // Entries beyond this count collapse behind a "Show earlier" toggle. The
    // most recent entries are always visible — context that matters most.
    collapseAfter?: number;
}

const coerceHistory = (value: ReviewHistoryProps['history']): IReviewHistoryEntry[] => {
    let v: unknown = value;
    if (typeof v === 'string') {
        try {
            v = JSON.parse(v);
        } catch {
            return [];
        }
    }
    return Array.isArray(v) ? (v.filter(e => e && typeof e === 'object' && typeof e.action === 'string') as IReviewHistoryEntry[]) : [];
};

type ActionTone = 'submit' | 'approve' | 'reject';

const ACTION_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; tone: ActionTone }> = {
    SUBMIT: { label: 'Submitted the report', icon: 'paper-plane', tone: 'submit' },
    RESUBMIT: { label: 'Resubmitted the report', icon: 'refresh', tone: 'submit' },
    APPROVE: { label: 'Approved', icon: 'checkmark-circle', tone: 'approve' },
    CHANGE_REQUESTED: { label: 'Requested changes', icon: 'alert-circle', tone: 'reject' },
};

const TONE_CLASSES: Record<ActionTone, { dot: string; icon: string; ring: string; quote: string }> = {
    submit: {
        dot: 'bg-blue-500',
        icon: '#3b82f6',
        ring: 'border-blue-200 dark:border-blue-800',
        quote: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
    },
    approve: {
        dot: 'bg-green-500',
        icon: '#22c55e',
        ring: 'border-green-200 dark:border-green-800',
        quote: 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
    },
    reject: {
        dot: 'bg-amber-500',
        icon: '#d97706',
        ring: 'border-amber-200 dark:border-amber-800',
        quote: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
    },
};

const ROLE_LABELS: Record<string, string> = {
    HOD: 'Head of Department',
    AHOD: 'Asst. Head of Department',
    GH: 'Group Head',
    CP: 'Campus Pastor',
    GSP: 'Global Senior Pastor',
};

const humanize = (key: string): string =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();

const actionMeta = (action: string) =>
    ACTION_META[action] ?? { label: humanize(action), icon: 'ellipse' as const, tone: 'submit' as const };

const HistoryRow: React.FC<{ entry: IReviewHistoryEntry; isLast: boolean; isLatest: boolean }> = ({
    entry,
    isLast,
    isLatest,
}) => {
    const meta = actionMeta(entry.action);
    const tone = TONE_CLASSES[meta.tone];
    const roleLabel = ROLE_LABELS[entry.actorRole] ?? entry.actorRole;

    return (
        <View className="flex-row gap-3">
            <View className="items-center">
                <View
                    className={cn(
                        'w-8 h-8 rounded-full items-center justify-center border-2 bg-background',
                        tone.ring,
                        isLatest && tone.dot
                    )}
                >
                    <Ionicons name={meta.icon} size={14} color={isLatest ? 'white' : tone.icon} />
                </View>
                {!isLast && <View className="w-0.5 flex-1 bg-border mt-1 mb-1" />}
            </View>

            <View className={cn('flex-1 gap-1', !isLast && 'pb-4')}>
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-sm font-bold text-foreground">{roleLabel}</Text>
                    <Text className="!text-[11px] text-muted-foreground" numberOfLines={1}>
                        {dayjs(entry.timestamp).fromNow()}
                    </Text>
                </View>
                <Text className="text-sm text-muted-foreground">{meta.label}</Text>
                <Text className="!text-[11px] text-muted-foreground/70">
                    {dayjs(entry.timestamp).format('DD MMM YYYY, h:mm A')}
                </Text>
                {entry.comment ? (
                    <View className={cn('mt-1 rounded-xl border-l-2 px-3 py-2', tone.quote)}>
                        <Text className="text-sm text-foreground line-clamp-none leading-snug italic">"{entry.comment}"</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const ReviewHistory: React.FC<ReviewHistoryProps> = ({ history, title = 'Review history', collapseAfter = 4 }) => {
    const [expanded, setExpanded] = useState(false);

    const reversed = useMemo(() => coerceHistory(history).reverse(), [history]);

    if (!reversed.length) return null;

    const visibleCount = expanded ? reversed.length : Math.min(reversed.length, collapseAfter);
    const visible = reversed.slice(0, visibleCount);
    const hiddenCount = reversed.length - visible.length;

    return (
        <Card className="p-4 gap-3">
            <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={15} color="#71717a" />
                <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex-1">
                    {title}
                </Text>
                <View className="rounded-full bg-secondary px-2 py-0.5">
                    <Text className="!text-[11px] font-semibold text-muted-foreground">
                        {reversed.length} {reversed.length === 1 ? 'update' : 'updates'}
                    </Text>
                </View>
            </View>

            <View className="gap-0 mt-1">
                {visible.map((entry, i) => (
                    <HistoryRow
                        key={entry._id ?? `${entry.timestamp}-${i}`}
                        entry={entry}
                        isLatest={i === 0}
                        isLast={i === visible.length - 1 && !hiddenCount}
                    />
                ))}
            </View>

            {hiddenCount > 0 && (
                <Button variant="ghost" size="sm" textClassName="!text-sm" onPress={() => setExpanded(true)}>
                    {`Show ${hiddenCount} earlier ${hiddenCount === 1 ? 'update' : 'updates'}`}
                </Button>
            )}
        </Card>
    );
};

export default ReviewHistory;
