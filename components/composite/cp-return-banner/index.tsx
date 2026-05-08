import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { IReportHistoryEntry } from '@store/types';

interface CpReturnBannerProps {
    entry: IReportHistoryEntry;
}

const ROLE_LABELS: Record<string, string> = {
    CP: 'Campus Pastor',
    GSP: 'Global Senior Pastor',
    GH: 'Group Head',
    HOD: 'Head of Department',
    AHOD: 'Asst. Head of Department',
};

const CpReturnBanner: React.FC<CpReturnBannerProps> = ({ entry }) => {
    const roleLabel = ROLE_LABELS[entry.actorRole] ?? entry.actorRole;
    const timeAgo = dayjs(entry.createdAt).fromNow();

    return (
        <View className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 gap-3">
            <View className="flex-row items-center gap-2">
                <Ionicons name="arrow-undo-circle" size={16} color="#ef4444" />
                <Text className="!text-[12px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                    Returned for changes
                </Text>
            </View>

            <View className="flex-row items-start gap-3">
                <AvatarComponent
                    alt={entry.actorName}
                    className="w-8 h-8"
                    imageUrl={AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-0.5">
                    <Text className="!text-[13px] font-semibold text-foreground">{entry.actorName}</Text>
                    <Text className="!text-[11px] text-muted-foreground">
                        {roleLabel} · {timeAgo}
                    </Text>
                </View>
            </View>

            {entry.comment ? (
                <View className="bg-red-100 dark:bg-red-900/30 rounded-xl px-3 py-2.5">
                    <Text className="!text-[13px] text-red-800 dark:text-red-300 leading-snug">
                        "{entry.comment}"
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

export default CpReturnBanner;
