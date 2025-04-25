import React from 'react';

import { ChevronLeft } from 'lucide-react-native';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { router } from 'expo-router';

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
            }
        }
    };

    return (
        <Button onPress={handleGoBack} className={cn('rounded-full bg-accent-light h-12 w-12', className)}>
            <ChevronLeft color={isDarkColorScheme ? THEME_CONFIG.white : THEME_CONFIG.black} size={32} />
        </Button>
    );
};

export { NavButton };
