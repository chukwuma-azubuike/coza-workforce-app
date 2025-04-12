import React, { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { THEME_CONFIG } from '@config/appConfig';
import { Info, LucideIcon } from 'lucide-react-native';
import { Icon } from '@rneui/base';

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
        <Alert icon={icon} className="max-w-sm h-48">
            <AlertTitle className="justify-center">
                <Icon
                    size={90}
                    type={iconType}
                    name={iconName as string}
                    color={color ? color : THEME_CONFIG[status || 'info']}
                />
            </AlertTitle>
            {typeof description === 'string' ? <AlertDescription>{description}</AlertDescription> : description}
        </Alert>
    );
};

export default React.memo(ModalAlertComponent);
