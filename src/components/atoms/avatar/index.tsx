import React from 'react';
import { Avatar, IAvatarProps } from 'native-base';

interface IAvatarComponentProps extends IAvatarProps {
    imageUrl: string;
    badge?: boolean;
    firstName?: string;
    lastName?: string;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = props => {
    const { imageUrl, badge, firstName, lastName } = props;

    return (
        <Avatar
            _dark={{ bg: 'gray.900' }}
            _light={{ bg: 'gray.100' }}
            source={{
                uri: imageUrl,
            }}
            {...props}
        >
            {`${firstName && firstName.substring(0, 1)}${
                lastName && lastName.substring(0, 1)
            }`}
            {badge && <Avatar.Badge bg="green.500" />}
        </Avatar>
    );
};

export default AvatarComponent;

export const AvatarComponentWithoutBadge: React.FC<IAvatarComponentProps> = ({
    imageUrl,
}) => {
    return (
        <Avatar
            bg="amber.500"
            source={{
                uri: imageUrl,
            }}
            size="sm"
        />
    );
};
