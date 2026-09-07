import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';

import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { THEME_CONFIG } from '~/config/appConfig';

interface StreakResetCardProps {
    /** The streak that ended. Named rather than hidden — see below. */
    previous: number;
    onDismiss: () => void;
    isDismissing?: boolean;
}

/**
 * The reset acknowledgment (US-4.3).
 *
 * This card exists for the person most likely to stop opening the app: someone who missed
 * a day and now expects to be told off. So it names the loss plainly, refuses to editorialise
 * about it, and ends on the one action that fixes it — which is just opening the app again,
 * something they have already done by reading this.
 *
 * It sits **above the ember**, before anything else, because a worker who returns to a
 * screen showing "0" with no explanation reads the zero as a punishment. The card is what
 * turns it back into a starting line.
 */
const StreakResetCard: React.FC<StreakResetCardProps> = ({ previous, onDismiss, isDismissing }) => (
    <Card className="mb-6 border-border">
        <CardContent className="p-4 flex-row gap-3 items-start">
            <View className="w-9 h-9 rounded-full bg-muted items-center justify-center">
                <Icon type="feather" name="sunrise" size={18} color={THEME_CONFIG.primary} />
            </View>

            <View className="flex-1 gap-1">
                <Text className="font-semibold">Your streak reset</Text>
                <Text className="!text-sm text-muted-foreground">
                    {previous > 0
                        ? `${previous} days was a real run. It happens — check in today and you're back on day 1.`
                        : "It happens. Check in today and you're back on day 1."}
                </Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.6}
                onPress={onDismiss}
                disabled={isDismissing}
                accessibilityRole="button"
                accessibilityLabel="Dismiss streak reset notice"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="p-1"
            >
                <Icon type="feather" name="x" size={16} color={THEME_CONFIG.lightGray} />
            </TouchableOpacity>
        </CardContent>
    </Card>
);

export default StreakResetCard;
