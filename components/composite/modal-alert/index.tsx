import React, { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { THEME_CONFIG } from '@config/appConfig';
import { IIconTypes } from '@utils/types';
import { Ionicons } from '@expo/vector-icons';
import { IoniconTypes } from '~/types/app';
import { Dialog } from '~/components/ui/dialog';
import { LucideIcon } from 'lucide-react-native';

interface IModalAlertComponentProps {
    status: 'info' | 'warning' | 'success' | 'error';
    description: string | JSX.Element | null | undefined;
    iconType?: IIconTypes;
    iconName?: IoniconTypes;
    icon: LucideIcon;
    color?: string;
    backgroundColor?: string;
    children?: ReactNode;
}

const ModalAlertComponent: React.FC<IModalAlertComponentProps> = props => {
    const { status, description, iconName, iconType, color, backgroundColor, icon } = props;

    return (
        <Alert icon={icon} className="max-w-sm">
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can use a terminal to run commands on your computer.</AlertDescription>
        </Alert>
        // <Dialog open={modalVisible} onOpenChange={hideModal}>
        //     <DialogConten className="max-w-md">
        //         <VStack justifyContent="center" h="full">
        //             <Ionicons size={90} type={iconType} name={iconName} color={color ? color : THEME_CONFIG[status]} />
        //             {typeof description === 'string' ? (
        //                 <Text py={6} semi-bold fontSize="xl" textAlign="center" color={color ? color : 'white'}>
        //                     {description}
        //                 </Text>
        //             ) : (
        //                 description
        //             )}
        //         </VStack>
        //     </DialogConten>
        // </Dialog>
    );
};

export default React.memo(ModalAlertComponent);
