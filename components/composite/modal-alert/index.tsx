import React, { ReactNode } from 'react';
import { Alert, VStack, Text } from 'native-base';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { IIconTypes } from '@utils/types';

interface IModalAlertComponentProps {
    status: 'info' | 'warning' | 'success' | 'error';
    description: string | JSX.Element | null | undefined;
    iconType: IIconTypes;
    iconName: string;
    color?: string;
    backgroundColor?: string;
    children?: ReactNode;
}

const ModalAlertComponent: React.FC<IModalAlertComponentProps> = props => {
    const { status, description, iconName, iconType, color, backgroundColor = 'gray.800' } = props;

    return (
        <Alert
            w="100%"
            height="xs"
            status={status}
            backgroundColor={backgroundColor}
            borderRadius={THEME_CONFIG.borderRadius}
        >
            <VStack justifyContent="center" h="full">
                <Icon size={90} type={iconType} name={iconName} color={color ? color : THEME_CONFIG[status]} />
                {typeof description === 'string' ? (
                    <Text py={6} semi-bold fontSize="xl" textAlign="center" color={color ? color : 'white'}>
                        {description}
                    </Text>
                ) : (
                    description
                )}
            </VStack>
        </Alert>
    );
};

export default React.memo(ModalAlertComponent);
