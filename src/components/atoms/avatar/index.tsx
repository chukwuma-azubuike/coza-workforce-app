import React from 'react';
import { Avatar, IAvatarProps } from 'native-base';

interface IAvatarComponentProps extends IAvatarProps {
    imageUrl: string;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = ({ imageUrl }) => {
    return (
        <Avatar
            bg="amber.500"
            source={{
                uri: imageUrl,
            }}
            shadow={9}
            size="sm"
        >
            NB
            <Avatar.Badge bg="green.500" />
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
            shadow={9}
            size="sm"
        />
    );
};
