import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { IReviewHistoryEntry } from '@store/types';

interface ReportReturnBannerProps {
    entry: IReviewHistoryEntry;
    /**
     * What the viewer is expected to do about it. Rendered as the closing line so the
     * banner states the ask and the obligation together — omit it for a bystander,
     * who should see what happened without being told to act on it.
     */
    callToAction?: string;
}

const ROLE_LABELS: Record<string, string> = {
    CP: 'Campus Pastor',
    GSP: 'Global Senior Pastor',
    GH: 'Group Head',
    HOD: 'Head of Department',
    AHOD: 'Asst. Head of Department',
};

/**
 * The reason a report came back, at the top of the screen where it cannot be missed.
 *
 * This is the first thing the recipient of a "changes requested" notification needs,
 * and it used to render only for a Campus Pastor return — so a HOD, the role that
 * actually has to act, saw the Group Head's reason as an unstyled grey note card
 * sitting between two others. Any returning role renders the same banner now.
 */
const ReportReturnBanner: React.FC<ReportReturnBannerProps> = ({ entry, callToAction }) => {
    const roleLabel = ROLE_LABELS[entry.actorRole] ?? entry.actorRole;
    const timeAgo = dayjs(entry.timestamp).fromNow();

    return (
        <View className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 gap-3">
            <View className="flex-row items-center gap-2">
                <Ionicons name="arrow-undo-circle" size={16} color="#ef4444" />
                <Text className="!text-[12px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                    Returned for changes
                </Text>
            </View>

            <View className="flex-row items-start gap-3">
                <AvatarComponent alt={roleLabel} className="w-8 h-8" imageUrl={AVATAR_FALLBACK_URL} />
                <View className="flex-1 gap-0.5">
                    <Text className="!text-[13px] font-semibold text-foreground">{roleLabel}</Text>
                    <Text className="!text-[11px] text-muted-foreground">{timeAgo}</Text>
                </View>
            </View>

            {entry.comment ? (
                <View className="bg-red-100 dark:bg-red-900/30 rounded-xl px-3 py-2.5">
                    {/* The base Text clamps to one line app-wide; a reviewer's reason is
                        the one thing on this screen that must never be truncated. */}
                    <Text className="!text-[13px] text-red-800 dark:text-red-300 leading-snug line-clamp-none">
                        "{entry.comment}"
                    </Text>
                </View>
            ) : null}

            {callToAction ? (
                <Text className="!text-[12px] text-red-700 dark:text-red-400 leading-snug line-clamp-none">
                    {callToAction}
                </Text>
            ) : null}
        </View>
    );
};

export default ReportReturnBanner;
