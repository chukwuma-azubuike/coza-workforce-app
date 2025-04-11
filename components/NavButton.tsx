import React from 'react';

import { ChevronLeft } from 'lucide-react-native';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';
import { THEME_CONFIG } from '~/config/appConfig';

interface NavButtonProps {
    onBack?: () => void;
    className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ onBack, className }) => {
    return (
        <Button onPress={onBack} className={cn('rounded-full bg-accent-light !w-12 !h-12 mt-4', className)}>
            <ChevronLeft color={THEME_CONFIG.primary} size={32} />
        </Button>
    );
};

export { NavButton };
