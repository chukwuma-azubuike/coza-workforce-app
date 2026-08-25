import React from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { THEME_CONFIG } from '@config/appConfig';

/**
 * Secondary action surfaced on the home screen that lets authorised users
 * clock another person in. Visibility mirrors the access list declared on the
 * `/manual-clock-in` route in `config/navigation.ts`, so it stays in sync with
 * the canonical permission source.
 */
const ManualClockInButton: React.FC = () => {

    const handlePress = React.useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/manual-clock-in' as any);
    }, []);


    return (
        <Button
            size="sm"
            variant="outline"
            onPress={handlePress}
            accessibilityLabel="Clock in someone else"
            className="!h-12 !rounded-full border-primary/20 bg-primary/5 px-5 shadow-sm active:bg-primary/10"
            textClassName="font-semibold"
            startIcon={<Ionicons name="person-add-outline" size={18} color={THEME_CONFIG.primary} />}
            endIcon={<Ionicons name="chevron-forward" size={16} color={THEME_CONFIG.primary} />}
        >
            Clock in someone else
        </Button>
    );
};

export default React.memo(ManualClockInButton);
