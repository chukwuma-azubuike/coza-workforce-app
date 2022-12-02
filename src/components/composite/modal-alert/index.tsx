import React from 'react';
import { Alert, VStack, Text } from 'native-base';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IIconTypes } from '../../../utils/types';

interface IModalAlertComponentProps {
    status: 'info' | 'warning' | 'success' | 'error';
    description: string | JSX.Element;
    iconType: IIconTypes;
    iconName: string;
    color?: string;
}

const ModalAlertComponent: React.FC<IModalAlertComponentProps> = props => {
    const { status, description, iconName, iconType, color } = props;

    return (
        <Alert
            w="100%"
            height="xs"
            status={status}
            backgroundColor="gray.800"
            borderRadius={THEME_CONFIG.borderRadius}
        >
            <VStack justifyContent="center" h="full">
                <Icon
                    size={90}
                    type={iconType}
                    name={iconName}
                    color={color ? color : THEME_CONFIG[status]}
                />
                {typeof description === 'string' ? (
                    <Text
                        py={6}
                        semi-bold
                        fontSize="xl"
                        textAlign="center"
                        color={color ? color : 'white'}
                    >
                        {description}
                    </Text>
                ) : (
                    description
                )}
            </VStack>
        </Alert>
    );
};

export default ModalAlertComponent;
