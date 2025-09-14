import React, { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { THEME_CONFIG } from '@config/appConfig';
import { Info, LucideIcon } from 'lucide-react-native';
import { Icon } from '@rneui/base';
import { View } from 'react-native';

interface IModalAlertComponentProps {
    status?: 'info' | 'warning' | 'success' | 'error';
    description: string | JSX.Element | null | undefined;
    iconType?: string;
    iconName?: string;
    icon?: LucideIcon;
    color?: string;
    backgroundColor?: string;
    children?: ReactNode;
}

const ModalAlertComponent: React.FC<IModalAlertComponentProps> = props => {
    const { status, description, iconName, iconType, color, backgroundColor, icon = Info } = props;

    return (
        <Alert iconClassName="hidden" className="max-w-sm shadow-none border-0">
            {typeof description === 'string' ? (
                <View className="w-full h-full justify-center gap-6">
                    <Icon
                        size={90}
                        type={iconType}
                        name={iconName as string}
                        color={color ? color : THEME_CONFIG[status || 'info']}
                    />
                    <AlertDescription className="text-xl">{description}</AlertDescription>
                </View>
            ) : (
                description
            )}
        </Alert>
    );
};

export default React.memo(ModalAlertComponent);
