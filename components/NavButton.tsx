import React from 'react';

import { ChevronLeft } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

interface NavButtonProps {
    onBack?: () => void;
    className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ onBack, className }) => {
    const { isDarkColorScheme } = useColorScheme();

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else {
            if (router.canGoBack()) {
                router.back();
            } else {
                if (router.canDismiss()) {
                    router.dismiss();
                }
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
