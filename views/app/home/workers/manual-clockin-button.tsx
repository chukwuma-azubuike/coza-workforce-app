import React from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { THEME_CONFIG } from '@config/appConfig';
import useRole, { DEPARTMENTS, ROLES } from '@hooks/role';
import { AppRoutes } from '~/config/navigation';

const MANUAL_CLOCK_IN_ROUTE = AppRoutes.find(route => route.href === '/manual-clock-in');

/**
 * Secondary action surfaced on the home screen that lets authorised users
 * clock another person in. Visibility mirrors the access list declared on the
 * `/manual-clock-in` route in `config/navigation.ts`, so it stays in sync with
 * the canonical permission source.
 */
const ManualClockInButton: React.FC = () => {
    const { user } = useRole();

    const roleName = user?.role?.name;
    const departmentName = user?.department?.departmentName;

    const canManualClockIn = React.useMemo(
        () =>
            !!MANUAL_CLOCK_IN_ROUTE?.users?.length &&
            (MANUAL_CLOCK_IN_ROUTE.users.includes(roleName as ROLES) ||
                MANUAL_CLOCK_IN_ROUTE.users.includes(departmentName as DEPARTMENTS)),
        [roleName, departmentName]
    );

    const handlePress = React.useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/manual-clock-in' as any);
    }, []);

    if (!canManualClockIn) {
        return null;
    }

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
