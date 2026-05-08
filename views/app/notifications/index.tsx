import React, { memo, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import ViewWrapper from '@components/layout/viewWrapper';
import { Text } from '~/components/ui/text';
import { Skeleton } from '~/components/ui/skeleton';
import { Separator } from '~/components/ui/separator';
import { useAppSelector } from '@store/hooks';

type NotifFilter = 'ALL' | 'PERMISSIONS' | 'REPORTS' | 'REVIEWS' | 'TICKETS' | 'CONFERENCE';

const FILTERS: { key: NotifFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PERMISSIONS', label: 'Permissions' },
    { key: 'REPORTS', label: 'Reports' },
    { key: 'REVIEWS', label: 'Reviews' },
    { key: 'TICKETS', label: 'Tickets' },
    { key: 'CONFERENCE', label: 'Conference' },
];

const FILTER_CHIP_ACTIVE = 'h-8 px-3.5 rounded-full border items-center justify-center bg-primary border-primary';
const FILTER_CHIP_INACTIVE = 'h-8 px-3.5 rounded-full border items-center justify-center bg-background border-border';

// Event type → filter category mapping
const EVENT_FILTER_MAP: Record<string, NotifFilter> = {
    'permission.approved': 'PERMISSIONS',
    'permission.declined': 'PERMISSIONS',
    'permission.requested': 'PERMISSIONS',
    'report.submitted': 'REPORTS',
    'report.cp_returned_to_gh': 'REPORTS',
    'report.cp_approved': 'REPORTS',
    'report.gh_returned_to_hod': 'REPORTS',
    'report.gsp_approved': 'REPORTS',
    'report.gsp_returned_to_cp': 'REPORTS',
    'word.submitted': 'REVIEWS',
    'ticket.issued': 'TICKETS',
    'ticket.retracted': 'TICKETS',
    'congress.update': 'CONFERENCE',
};

// Human-readable labels for GH-specific events
const EVENT_LABEL_MAP: Record<string, string> = {
    'report.cp_returned_to_gh': 'Campus Pastor returned a report for changes',
    'report.cp_approved': 'Campus Pastor approved a report',
    'report.gh_returned_to_hod': 'A report was returned to the Head of Department',
    'report.gsp_approved': 'Global Senior Pastor approved a report',
    'report.gsp_returned_to_cp': 'Global Senior Pastor returned a report to the Campus Pastor',
};

interface INotification {
    _id: string;
    title: string;
    body: string;
    eventType?: string;
    createdAt: string;
    isRead: boolean;
    meta?: Record<string, string>;
}

const NotificationRow: React.FC<INotification> = notif => {
    const label = notif.eventType ? (EVENT_LABEL_MAP[notif.eventType] ?? notif.title) : notif.title;
    const timeAgo = dayjs(notif.createdAt).fromNow();

    const handlePress = () => {
        if (!notif.meta) return;
        if (notif.eventType?.startsWith('report.')) {
            router.push({
                pathname: '/gh-approvals/report-detail' as any,
                params: notif.meta,
            });
        } else if (notif.eventType?.startsWith('permission.')) {
            router.push({ pathname: '/permissions/permission-details', params: notif.meta as any });
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
            <View className={`px-4 py-3.5 flex-row gap-3 ${notif.isRead ? '' : 'bg-primary/5'}`}>
                <View className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                <View className="flex-1 gap-0.5">
                    <Text className="!text-[13px] font-semibold text-foreground">{label}</Text>
                    <Text className="!text-[12px] text-foreground leading-snug">{notif.body}</Text>
                    <Text className="!text-[11px] text-muted-foreground mt-0.5">{timeAgo}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const Notifications: React.FC = () => {
    const [filter, setFilter] = useState<NotifFilter>('ALL');

    // Placeholder — will be replaced with RTK query once notification endpoint is live
    const notifications: INotification[] = [];
    const isLoading = false;

    const filtered = useMemo(() => {
        if (filter === 'ALL') return notifications;
        return notifications.filter(n => {
            const cat = n.eventType ? (EVENT_FILTER_MAP[n.eventType] ?? 'ALL') : 'ALL';
            return cat === filter;
        });
    }, [notifications, filter]);

    return (
        <ViewWrapper className="flex-1" noPadding>
            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 grow-0 shrink-0"
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        activeOpacity={0.7}
                        onPress={() => setFilter(f.key)}
                        className={filter === f.key ? FILTER_CHIP_ACTIVE : FILTER_CHIP_INACTIVE}
                    >
                        <Text
                            className={`!text-sm font-semibold ${
                                filter === f.key ? 'text-primary-foreground dark:text-white' : 'text-foreground'
                            }`}
                        >
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView className="flex-1">
                <View className="pb-8">
                    {isLoading ? (
                        <View className="px-4 gap-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                            ))}
                        </View>
                    ) : filtered.length === 0 ? (
                        <View className="py-16 items-center px-8">
                            <Text className="!text-sm text-muted-foreground text-center">
                                No {filter === 'ALL' ? '' : filter.toLowerCase()} notifications yet.
                            </Text>
                        </View>
                    ) : (
                        filtered.map((notif, i) => (
                            <View key={notif._id}>
                                {i > 0 && <Separator />}
                                <NotificationRow {...notif} />
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </ViewWrapper>
    );
};

export default memo(Notifications);
