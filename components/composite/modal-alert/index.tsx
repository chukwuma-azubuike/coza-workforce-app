import React, { ReactNode } from 'react';
import { AlertDescription } from '~/components/ui/alert';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/base';
import { View } from 'react-native';
import { cn } from '~/lib/utils';
import { ModalStatus } from '~/types/app';

/** Default icon per status, so callers only have to pass a status. */
export const STATUS_ICON: Record<ModalStatus, { name: string; type: string }> = {
    success: { name: 'checkmark-circle-outline', type: 'ionicon' },
    info: { name: 'info', type: 'feather' },
    warning: { name: 'warning-outline', type: 'ionicon' },
    error: { name: 'error-outline', type: 'material' },
};

interface IModalAlertComponentProps {
    status?: ModalStatus;
    description: string | React.JSX.Element | null | undefined;
    iconType?: string;
    iconName?: string;
    color?: string;
    iconSize?: number;
    className?: string;
    children?: ReactNode;
}

const ModalAlertComponent: React.FC<IModalAlertComponentProps> = props => {
    const { status = 'info', description, iconName, iconType, color, iconSize = 72, className, children } = props;

    const icon = STATUS_ICON[status];
    const name = iconName || icon.name;
    const type = iconType || icon.type;

    if (typeof description !== 'string') {
        return <View className={cn('w-full items-center gap-5', className)}>{description || children}</View>;
    }

    return (
        <View className={cn('w-full items-center gap-5', className)}>
            <Icon size={iconSize} type={type} name={name} color={color || THEME_CONFIG[status]} />
            <AlertDescription className="line-clamp-none text-center">{description}</AlertDescription>
            {children}
        </View>
    );
};

export default React.memo(ModalAlertComponent);
