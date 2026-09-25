import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import { useGetCongressByIdQuery } from '@store/services/congress';
import { ICongress } from '@store/types';
import { parseApiDate } from '@utils/service-form';
import { THEME_CONFIG } from '~/config/appConfig';

/** The congress a session belongs to and the days it runs, for bounding the session date picker. */
export const useCongressWindow = (congressId?: string) => {
    const { data: congress, isLoading } = useGetCongressByIdQuery(congressId as string, { skip: !congressId });

    return React.useMemo(() => {
        const start = parseApiDate(congress?.startDate)?.startOf('day');
        const end = parseApiDate(congress?.endDate)?.endOf('day');

        return {
            congress,
            isLoading: !!congressId && isLoading,
            startDate: start?.toDate(),
            endDate: end?.toDate(),
            /** Whole days the congress spans, inclusive. */
            dayCount: start && end ? end.diff(start, 'day') + 1 : undefined,
        };
    }, [congress, congressId, isLoading]);
};

export const formatCongressRange = (congress?: ICongress) => {
    const start = parseApiDate(congress?.startDate);
    const end = parseApiDate(congress?.endDate);
    if (!start || !end) return '';
    return start.isSame(end, 'year')
        ? `${start.format('DD MMM')} – ${end.format('DD MMM YYYY')}`
        : `${start.format('DD MMM YYYY')} – ${end.format('DD MMM YYYY')}`;
};

const CongressBanner: React.FC<{ congress?: ICongress; caption?: string }> = ({ congress, caption }) => {
    if (!congress) return null;

    return (
        <View className="flex-row items-center gap-3 rounded-2xl bg-primary/10 p-4">
            <Ionicons name="calendar-outline" size={22} color={THEME_CONFIG.primary} />
            <View className="flex-1 gap-0.5">
                <Text className="font-semibold" numberOfLines={1}>
                    {congress.name}
                </Text>
                <Text className="text-sm text-muted-foreground">
                    {[formatCongressRange(congress), caption].filter(Boolean).join(' · ')}
                </Text>
            </View>
        </View>
    );
};

export default React.memo(CongressBanner);
