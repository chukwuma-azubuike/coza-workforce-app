import React from 'react';

import { ChevronLeft } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { router, useNavigation as useExpoNavigation } from 'expo-router';
import { useNavigation as useReactNavigation } from '@react-navigation/native';
import { TouchableOpacity, BackHandler, Platform } from 'react-native';

interface NavButtonProps {
    onBack?: () => void;
    className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ onBack, className }) => {
    const { isDarkColorScheme } = useColorScheme();
    const expoNavigation = useExpoNavigation();
    const reactNavigation = useReactNavigation();

    React.useEffect(() => {
        let backHandler: any;
        if (Platform.OS === 'android') {
            backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (router.canGoBack()) {
                    router.back();
                    return true;
                }
                return false;
            });
        }
        return () => {
            if (backHandler) {
                backHandler.remove();
            }
        };
    }, []);

    const handleGoBack = () => {
        try {
            if (onBack) {
                onBack();
                return;
            }

            // Try Expo Router first
            if (router.canGoBack()) {
                router.back();
                return;
            }

            // Try Expo navigation
            if (expoNavigation?.canGoBack()) {
                expoNavigation.goBack();
                return;
            }

            // Try React Navigation as fallback
            if (reactNavigation?.canGoBack()) {
                reactNavigation.goBack();
                return;
            }

            // Try dismiss if available
            if (router.canDismiss()) {
                router.dismiss();
                return;
            }

            // If all navigation attempts fail, at least we still have the Android hardware back button handler
            return;
        } catch (error) {
            // Final fallback - try all navigation methods one last time
            try {
                if (reactNavigation?.goBack) {
                    reactNavigation.goBack();
                } else if (expoNavigation?.goBack) {
                    expoNavigation.goBack();
                }
            } catch (innerError) {
                console.warn('All navigation attempts failed:', innerError);
            }
        }
    };

    return (
        <TouchableOpacity onPress={handleGoBack} className={cn('-left-5', className)}>
            <ChevronLeft color={isDarkColorScheme ? THEME_CONFIG.white : THEME_CONFIG.black} size={32} />
        </TouchableOpacity>
    );
};

export { NavButton };
