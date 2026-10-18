import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import StatusTag from '@components/atoms/status-tag';
import { Congress_SESSION_TAGS, IService, SERVICE_TAGS } from '@store/types';
import { parseApiDate } from '@utils/service-form';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

const TAG_LABELS = Object.fromEntries([...SERVICE_TAGS, ...Congress_SESSION_TAGS].map(({ id, value }) => [id, value]));

const formatTime = (value?: string) => parseApiDate(value)?.format('h:mm A') ?? '--';

export interface IServiceCardProps extends IService {
    onEdit: (service: IService) => void;
    onActions: (service: IService) => void;
    /** Hide the date when the list is already grouped by day. */
    hideDate?: boolean;
}

/** One service or congress session in a list. Tap to edit; the ⋯ button (or a long press) for more. */
const ServiceCard: React.FC<IServiceCardProps> = ({ onEdit, onActions, hideDate, ...service }) => {
    const { isDarkColorScheme } = useColorScheme();

    const start = parseApiDate(service.serviceTime);
    const hasEnded = !!parseApiDate(service.serviceEndTime)?.isBefore(dayjs());
    const tag = service.tag?.[0];
    const tagLabel = tag ? (TAG_LABELS[tag] ?? tag) : undefined;

    const handleEdit = () => onEdit(service);
    const handleActions = () => onActions(service);

    return (
        <TouchableOpacity
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handleEdit}
            onLongPress={handleActions}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${service.name}`}
            className="w-full"
        >
            <View
                className={cn(
                    'my-1.5 flex-row items-center gap-3 rounded-xl border border-border py-3 pl-4 pr-2',
                    hasEnded && 'opacity-60'
                )}
            >
                <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="font-bold flex-shrink" numberOfLines={1}>
                            {service.name}
                        </Text>
                        {!!tagLabel && tagLabel !== service.name && (
                            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                · {tagLabel}
                            </Text>
                        )}
                    </View>
                    <Text className="text-sm" numberOfLines={1}>
                        {!hideDate && start ? `${start.format('ddd, DD MMM')} · ` : ''}
                        {formatTime(service.serviceTime)} – {formatTime(service.serviceEndTime)}
                    </Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        Clock-in from {formatTime(service.clockInStartTime)} ·{' '}
                        {service.rangeToClockIn?.toLocaleString()}m range
                    </Text>
                </View>
                <StatusTag
                    className={service.isGlobalService ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}
                >
                    {service.isGlobalService ? 'Global' : 'Local'}
                </StatusTag>
                <TouchableOpacity
                    hitSlop={8}
                    onPress={handleActions}
                    accessibilityRole="button"
                    accessibilityLabel={`More actions for ${service.name}`}
                    className="p-2"
                >
                    <Ionicons name="ellipsis-vertical" size={18} color={isDarkColorScheme ? '#a1a1aa' : '#71717a'} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(ServiceCard);
