import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';
import { cn } from '~/lib/utils';

interface SectionProps {
    title: string;
    subtitle?: string;
    /** Optional trailing action (e.g. "See all" → drill-down). */
    actionLabel?: string;
    onActionPress?: () => void;
    className?: string;
    children: React.ReactNode;
}

/** Consistent section scaffold: header (+ optional action) over a content block. */
const Section: React.FC<SectionProps> = ({ title, subtitle, actionLabel, onActionPress, className, children }) => (
    <View className={cn('gap-3', className)}>
        <View className="flex-row items-end justify-between gap-3">
            <View className="flex-1 gap-0.5">
                <Text className="text-lg font-bold text-foreground">{title}</Text>
                {!!subtitle && <Text className="text-sm text-muted-foreground line-clamp-none">{subtitle}</Text>}
            </View>
            {!!actionLabel && (
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={onActionPress}
                    className="flex-row items-center gap-0.5 -mb-0.5"
                >
                    <Text className="text-sm font-semibold text-blue-600">{actionLabel}</Text>
                    <ChevronRight size={16} color={THEME_CONFIG.blue} />
                </TouchableOpacity>
            )}
        </View>
        {children}
    </View>
);

export default React.memo(Section);
