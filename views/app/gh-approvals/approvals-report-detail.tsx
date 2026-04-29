import React, { memo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import AvatarComponent from '@components/atoms/avatar';
import { Separator } from '~/components/ui/separator';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import {
    useForwardReportToGspMutation,
    useGetGhReportDetailQuery,
} from '@store/services/grouphead';
import { cn } from '~/lib/utils';

interface RouteParams {
    reportId: string;
    departmentId: string;
    serviceId: string;
    departmentName: string;
    campus: string;
    serviceName: string;
    status: string;
}

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

interface AttendanceStatProps {
    label: string;
    value: number;
    total: number;
    containerClass: string;
    textClass: string;
}

const AttendanceStat: React.FC<AttendanceStatProps> = ({ label, value, total, containerClass, textClass }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <View className={cn('flex-1 rounded-xl p-2.5 items-center', containerClass)}>
            <Text className={cn('!text-[24px] font-bold leading-none', textClass)}>{value}</Text>
            <Text className={cn('!text-[10px] font-semibold mt-1', textClass)}>{label}</Text>
            <Text className={cn('!text-[10px] mt-0.5 opacity-65', textClass)}>{pct}%</Text>
        </View>
    );
};

const ApprovalsReportDetail: React.FC = () => {
    const params = useLocalSearchParams<RouteParams>();
    const { reportId, serviceId, departmentName, campus, serviceName, status } = params;

    const [forwarded, setForwarded] = useState(false);

    const { data: detail, isLoading } = useGetGhReportDetailQuery(
        { reportId: reportId as string },
        { skip: !reportId }
    );

    const [forwardToGsp, { isLoading: isForwarding }] = useForwardReportToGspMutation();

    const handleForward = () => {
        Alert.alert('Forward to GSP', 'Send this report to the GSP for review?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Forward',
                onPress: async () => {
                    try {
                        await forwardToGsp({ reportId: reportId as string, serviceId: serviceId as string }).unwrap();
                        setForwarded(true);
                    } catch {
                        Alert.alert('Error', 'Could not forward report. Please try again.');
                    }
                },
            },
        ]);
    };

    const serviceLabel = serviceName || campus;
    const att = detail?.attendance;

    return (
        <ScrollView className="flex-1 bg-background">
            <View className="px-4 pt-3 pb-8 gap-3">
                {/* Submitted by */}
                <Card className="p-4">
                    {isLoading ? (
                        <View className="flex-row items-center gap-3">
                            <Skeleton className="w-11 h-11 rounded-full" />
                            <View className="gap-1.5">
                                <Skeleton className="h-4 w-32 rounded" />
                                <Skeleton className="h-3 w-48 rounded" />
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row items-center gap-3">
                            <AvatarComponent
                                alt="hod"
                                className="w-11 h-11"
                                firstName={detail?.submittedBy?.firstName}
                                lastName={detail?.submittedBy?.lastName}
                                imageUrl={detail?.submittedBy?.pictureUrl ?? AVATAR_FALLBACK_URL}
                            />
                            <View className="flex-1">
                                <Text className="!text-sm font-semibold text-foreground">
                                    {detail?.submittedBy
                                        ? `${detail.submittedBy.firstName} ${detail.submittedBy.lastName}`
                                        : 'Head of Department'}
                                </Text>
                                <Text className="!text-[11px] text-muted-foreground mt-0.5">
                                    Head of Department
                                    {detail?.submittedAt
                                        ? ` · submitted ${dayjs(detail.submittedAt).fromNow()}`
                                        : ''}
                                </Text>
                            </View>
                        </View>
                    )}
                </Card>

                {/* Attendance */}
                <Card className="p-4 gap-3">
                    <SectionLabel>Attendance</SectionLabel>
                    {isLoading || !att ? (
                        <View className="gap-2">
                            <View className="flex-row gap-2">
                                <Skeleton className="flex-1 h-20 rounded-xl" />
                                <Skeleton className="flex-1 h-20 rounded-xl" />
                                <Skeleton className="flex-1 h-20 rounded-xl" />
                            </View>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </View>
                    ) : (
                        <>
                            <View className="flex-row gap-2">
                                <AttendanceStat
                                    label="Present"
                                    value={att.present}
                                    total={att.total}
                                    containerClass="bg-green-100 dark:bg-green-900/20"
                                    textClass="text-green-700 dark:text-green-400"
                                />
                                <AttendanceStat
                                    label="Late"
                                    value={att.late}
                                    total={att.total}
                                    containerClass="bg-amber-100 dark:bg-amber-900/20"
                                    textClass="text-amber-700 dark:text-amber-400"
                                />
                                <AttendanceStat
                                    label="Absent"
                                    value={att.absent}
                                    total={att.total}
                                    containerClass="bg-red-100 dark:bg-red-900/20"
                                    textClass="text-red-700 dark:text-red-400"
                                />
                            </View>
                            {/* Proportion bar */}
                            <View className="h-2 rounded-full overflow-hidden flex-row">
                                <View
                                    className="bg-green-600"
                                    style={[styles.bar, { flex: att.present }]}
                                />
                                <View
                                    className="bg-amber-500"
                                    style={[styles.bar, { flex: att.late }]}
                                />
                                <View
                                    className="bg-red-600"
                                    style={[styles.bar, { flex: att.absent }]}
                                />
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="!text-[10px] text-muted-foreground">0</Text>
                                <Text className="!text-[11px] text-muted-foreground font-medium">
                                    {att.total} total workforce
                                </Text>
                                <Text className="!text-[10px] text-muted-foreground">{att.total}</Text>
                            </View>
                        </>
                    )}
                </Card>

                {/* Narrative */}
                <Card className="p-4 gap-2">
                    <SectionLabel>Report narrative</SectionLabel>
                    {isLoading ? (
                        <View className="gap-1.5">
                            <Skeleton className="h-3.5 w-full rounded" />
                            <Skeleton className="h-3.5 w-full rounded" />
                            <Skeleton className="h-3.5 w-4/5 rounded" />
                        </View>
                    ) : (
                        <Text className="!text-[13px] text-foreground leading-relaxed">
                            {detail?.narrative ?? '—'}
                        </Text>
                    )}
                </Card>

                {/* Key highlights */}
                {(isLoading || (detail?.highlights?.length ?? 0) > 0) && (
                    <Card className="p-4 gap-2.5">
                        <SectionLabel>Key highlights</SectionLabel>
                        {isLoading ? (
                            <View className="gap-2">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-3.5 w-full rounded" />)}
                            </View>
                        ) : (
                            <View className="gap-2">
                                {detail!.highlights.map((h, i) => (
                                    <View key={i} className="flex-row items-start gap-2.5">
                                        <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <Text className="!text-[13px] text-foreground leading-snug flex-1">{h}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                )}

                {/* Attachments */}
                {(isLoading || (detail?.attachments?.length ?? 0) > 0) && (
                    <Card className="p-0">
                        <View className="px-4 pt-3.5 pb-2">
                            <SectionLabel>
                                {`Attachments${detail?.attachments ? ` (${detail.attachments.length})` : ''}`}
                            </SectionLabel>
                        </View>
                        {isLoading ? (
                            <View className="px-4 pb-3 gap-2">
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </View>
                        ) : (
                            detail!.attachments.map((att, i) => (
                                <View key={i}>
                                    {i > 0 && <Separator />}
                                    <View className="flex-row items-center gap-3 px-4 py-3">
                                        <View className="w-8 h-8 rounded-lg bg-secondary items-center justify-center shrink-0">
                                            <Ionicons name="attach-outline" size={14} color="#8b5cf6" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="!text-[13px] font-medium text-foreground">{att.name}</Text>
                                            <Text className="!text-[11px] text-muted-foreground">{att.size}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </Card>
                )}

                {/* Actions */}
                <View className="flex-row items-center gap-2 pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        startIcon={<Ionicons name="chatbubble-outline" size={15} color="#71717a" />}
                        onPress={() => Alert.alert('Comment', 'Comment feature coming soon.')}
                    >
                        Comment
                    </Button>

                    {forwarded ? (
                        <View className="flex-1 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 items-center justify-center flex-row gap-2">
                            <Ionicons name="checkmark" size={15} color="#16a34a" />
                            <Text className="!text-[13px] font-semibold text-green-700 dark:text-green-400">
                                Forwarded to GSP
                            </Text>
                        </View>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            isLoading={isForwarding}
                            onPress={handleForward}
                            startIcon={<Ionicons name="checkmark" size={16} color="white" />}
                        >
                            Forward to GSP
                        </Button>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default memo(ApprovalsReportDetail);

const styles = StyleSheet.create({
    bar: { height: '100%' },
});
