import React, { memo, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import AvatarComponent from '@components/atoms/avatar';
import useRole from '@hooks/role';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import { THEME_CONFIG } from '@config/appConfig';
import {
    IGHWordReview,
    useAcknowledgeGhWordReviewMutation,
    useGetGhWordReviewsQuery,
    useSuspendGhWordReviewMutation,
} from '@store/services/grouphead';
import { useGetLatestServiceQuery } from '@store/services/services';
import { cn } from '~/lib/utils';
import FilterChip from './approvals-filter-chip';

type ReviewFilter = 'PENDING' | 'ACKNOWLEDGED' | 'SUSPENDED';

const FILTERS: { key: ReviewFilter; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { key: 'SUSPENDED', label: 'Suspended' },
];

// TODO: Remove MOCK_REVIEWS once GET /gh/wordReviews/:serviceId is live on backend.
const MOCK_REVIEWS: IGHWordReview[] = [
    {
        _id: 'mock-1',
        firstName: 'Bisi',
        lastName: 'Olatunji',
        role: 'HOD',
        departmentName: 'Praise & Worship',
        weekEnding: dayjs().subtract(3, 'day').toISOString(),
        wordCount: 342,
        preview:
            'Studied John 4:23-24 on worship in spirit and truth. Three things stood out — the Father is actively seeking worshippers, worship is a posture before it is an activity, and truth here is the person of Jesus, not just accuracy.',
        status: 'PENDING',
        isLate: false,
        submittedAt: dayjs().subtract(4, 'hour').toISOString(),
    },
    {
        _id: 'mock-2',
        firstName: 'Sola',
        lastName: 'Akande',
        role: 'HOD',
        departmentName: 'PCU (Children)',
        weekEnding: dayjs().subtract(3, 'day').toISOString(),
        wordCount: 287,
        preview:
            'Reflected on Mark 10:14 — "let the little children come". Children are not a junior congregation; they are a present audience for the gospel. We must guard against entertaining them while withholding substance.',
        status: 'PENDING',
        isLate: false,
        submittedAt: dayjs().subtract(6, 'hour').toISOString(),
    },
    {
        _id: 'mock-3',
        firstName: 'Yemi',
        lastName: 'Falade',
        role: 'AHOD',
        departmentName: 'Protocol',
        weekEnding: dayjs().subtract(10, 'day').toISOString(),
        wordCount: 198,
        preview:
            'Considered Matthew 25:21. "Faithful in a few things" reorders my view of small assignments — protocol is not crowd control, it is hospitality on behalf of the Lord of the house.',
        status: 'PENDING',
        isLate: true,
        submittedAt: dayjs().subtract(2, 'day').toISOString(),
    },
];

interface ReviewCardProps {
    review: IGHWordReview;
    onAcknowledge: (id: string) => void;
    onSuspend: (id: string) => void;
    isAcknowledging: boolean;
    isSuspending: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    onAcknowledge,
    onSuspend,
    isAcknowledging,
    isSuspending,
}) => {
    const { firstName, lastName, role, departmentName, weekEnding, wordCount, preview, isLate, submittedAt } = review;
    const fullName = `${firstName} ${lastName}`;
    const weekLabel = `Week ending ${dayjs(weekEnding).format('D MMM')}`;

    return (
        <Card className="p-4 gap-3">
            <View className="flex-row items-start gap-3">
                <AvatarComponent
                    alt="hod"
                    className="w-10 h-10"
                    firstName={firstName}
                    lastName={lastName}
                    imageUrl={AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2">
                        <Text className="!text-sm font-semibold text-foreground">{fullName}</Text>
                        <View className="flex-row items-center gap-1 rounded-full h-5 px-2 bg-secondary border border-border">
                            <Text className="!text-[11px] font-semibold text-primary">{role}</Text>
                        </View>
                    </View>
                    <Text className="!text-[11px] text-muted-foreground">
                        {departmentName} · {weekLabel}
                    </Text>
                </View>
                {isLate && (
                    <View className="flex-row items-center gap-1.5 rounded-full h-5 px-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <Text className="!text-[10px] font-semibold text-red-700 dark:text-red-400">Late</Text>
                    </View>
                )}
            </View>

            <Text className="!text-[13px] text-foreground leading-snug line-clamp-3">{preview}</Text>

            <View className="flex-row items-center gap-1">
                <Ionicons name="reader-outline" size={12} color="#71717a" />
                <Text className="!text-[11px] text-muted-foreground font-semibold">{wordCount} words</Text>
            </View>

            <View className="flex-row items-center gap-2">
                <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    isLoading={isAcknowledging}
                    onPress={() => onAcknowledge(review._id)}
                    startIcon={<Ionicons name="star-outline" size={14} color="white" />}
                >
                    Acknowledge & badge
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="px-4"
                    isLoading={isSuspending}
                    onPress={() => onSuspend(review._id)}
                >
                    Suspend
                </Button>
            </View>
        </Card>
    );
};

const AcknowledgedCard: React.FC<{ review: IGHWordReview }> = ({ review }) => {
    const { firstName, lastName, role, departmentName, weekEnding, wordCount } = review;
    const fullName = `${firstName} ${lastName}`;
    const weekLabel = `Week ending ${dayjs(weekEnding).format('D MMM')}`;

    return (
        <Card className="p-4 gap-3">
            <View className="flex-row items-center gap-3">
                <AvatarComponent
                    alt="hod"
                    className="w-10 h-10"
                    firstName={firstName}
                    lastName={lastName}
                    imageUrl={AVATAR_FALLBACK_URL}
                />
                <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2">
                        <Text className="!text-sm font-semibold text-foreground">{fullName}</Text>
                        <View className="flex-row items-center gap-1 rounded-full h-5 px-2 bg-secondary border border-border">
                            <Text className="!text-[11px] font-semibold text-primary">{role}</Text>
                        </View>
                    </View>
                    <Text className="!text-[11px] text-muted-foreground">
                        {departmentName} · {weekLabel}
                    </Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full h-5 px-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <View className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    <Text className="!text-[10px] font-semibold text-green-700 dark:text-green-400">Acknowledged</Text>
                </View>
            </View>
            <View className="flex-row items-center gap-1">
                <Ionicons name="reader-outline" size={12} color="#71717a" />
                <Text className="!text-[11px] text-muted-foreground font-semibold">{wordCount} words</Text>
            </View>
        </Card>
    );
};

const ApprovalsReviews: React.FC = () => {
    const [filter, setFilter] = useState<ReviewFilter>('PENDING');
    const { user } = useRole();
    const campusId = user?.campus?._id;

    const { data: latestService } = useGetLatestServiceQuery(campusId as string, { skip: !campusId });
    const { data: apiReviews, isLoading } = useGetGhWordReviewsQuery(
        { serviceId: latestService?._id as string },
        { skip: !latestService?._id }
    );

    // Use live data if available, fall back to mock so the UI is always populated
    const reviews = apiReviews ?? MOCK_REVIEWS;

    const [acknowledge, { isLoading: isAcknowledging, originalArgs: ackArgs }] = useAcknowledgeGhWordReviewMutation();
    const [suspend, { isLoading: isSuspending, originalArgs: suspArgs }] = useSuspendGhWordReviewMutation();

    const handleAcknowledge = async (reviewId: string) => {
        try {
            await acknowledge({ reviewId }).unwrap();
            Alert.alert('Acknowledged', 'Badge awarded · review acknowledged.');
        } catch {
            Alert.alert('Error', 'Could not acknowledge review. Please try again.');
        }
    };

    const handleSuspend = async (reviewId: string) => {
        Alert.alert('Suspend review', 'This will flag the submission for suspension.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Suspend',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await suspend({ reviewId }).unwrap();
                        Alert.alert('Suspended', 'Review has been suspended.');
                    } catch {
                        Alert.alert('Error', 'Could not suspend review. Please try again.');
                    }
                },
            },
        ]);
    };

    const filtered = useMemo(() => reviews.filter(r => r.status === filter), [reviews, filter]);

    return (
        <View className="flex-1">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-3 grow-0 shrink-0"
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {FILTERS.map(f => (
                    <FilterChip key={f.key} active={filter === f.key} onPress={() => setFilter(f.key)}>
                        {f.label}
                    </FilterChip>
                ))}
            </ScrollView>

            <ScrollView className="flex-1">
                <View className="px-4 pb-8 gap-3">
                    {isLoading ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)
                    ) : filtered.length === 0 ? (
                        <View className="py-12 items-center">
                            <Text className="!text-sm text-muted-foreground text-center">
                                No {filter.toLowerCase()} word reviews.
                            </Text>
                        </View>
                    ) : (
                        filtered.map(review =>
                            review.status === 'ACKNOWLEDGED' ? (
                                <AcknowledgedCard key={review._id} review={review} />
                            ) : (
                                <ReviewCard
                                    key={review._id}
                                    review={review}
                                    onAcknowledge={handleAcknowledge}
                                    onSuspend={handleSuspend}
                                    isAcknowledging={isAcknowledging && ackArgs?.reviewId === review._id}
                                    isSuspending={isSuspending && suspArgs?.reviewId === review._id}
                                />
                            )
                        )
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default memo(ApprovalsReviews);
