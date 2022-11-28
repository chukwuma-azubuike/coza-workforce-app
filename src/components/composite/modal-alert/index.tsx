import { Alert, Text } from 'native-base';
import { Icon } from '@rneui/themed';
import React from 'react';
import { THEME_CONFIG } from '../../../config/appConfig';

interface IModalAlertComponentProps {
    status: 'info' | 'warning' | 'success' | 'error';
    description: string;
    iconName: string;
    iconType: string;
}

const ModalAlertComponent = (props: IModalAlertComponentProps) => {
    const { status, description, iconName, iconType } = props;

    return (
        <Alert w="100%" status={status} variant="outline-light">
            <Icon
                size={60}
                type={iconType}
                name={iconName}
                color={THEME_CONFIG[status]}
            />
            <Text py={2} fontSize="md" textAlign="center" color="gray.600">
                {description}
            </Text>
        </Alert>
    );
};

export default ModalAlertComponent;
