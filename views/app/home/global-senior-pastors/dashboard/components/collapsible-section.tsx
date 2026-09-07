import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '@config/appConfig';

interface CollapsibleSectionProps {
    title: string;
    badge?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

/** Expand/collapse wrapper. Badge shows a count in the header (e.g. pending tickets). */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, badge, defaultOpen = false, children }) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const Icon = open ? ChevronUp : ChevronDown;

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOpen(v => !v)}
                className="flex-row items-center justify-between py-3"
            >
                <View className="flex-row items-center gap-2">
                    <Text className="text-md font-bold text-foreground">{title}</Text>
                    {badge != null && badge > 0 && (
                        <View className="px-2 py-0.5 rounded-full bg-primary/10">
                            <Text className="!text-[11px] font-bold text-primary">{badge}</Text>
                        </View>
                    )}
                </View>
                <Icon size={18} color={THEME_CONFIG.lightGray} />
            </TouchableOpacity>
            {open && children}
        </View>
    );
};

export default React.memo(CollapsibleSection);
