import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the OS has been asked to reduce motion.
 *
 * The ember loops forever and the streak number counts up; both are decorative, and for
 * someone with a vestibular disorder a looping flame behind a scrolling list is not a
 * delight but a reason to close the app. iOS exposes this as Reduce Motion and Android as
 * "Remove animations"; `AccessibilityInfo` normalises both.
 *
 * Subscribed rather than read once, because the setting is commonly toggled *while* the
 * app is open — that is exactly what somebody does when the motion starts bothering them.
 */
const useReduceMotion = (): boolean => {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        let mounted = true;

        AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
            if (mounted) {
                setReduceMotion(enabled);
            }
        });

        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

        return () => {
            mounted = false;
            subscription.remove();
        };
    }, []);

    return reduceMotion;
};

export default useReduceMotion;
