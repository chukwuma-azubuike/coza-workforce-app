import React from 'react';
import { Avatar, IAvatarProps } from 'native-base';

interface IAvatarComponentProps extends IAvatarProps {
    imageUrl: string;
    badge?: boolean;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = props => {
    const { imageUrl, badge } = props;

    return (
        <Avatar
            bg="amber.500"
            source={{
                uri: imageUrl,
            }}
            {...props}
            size="sm"
        >
            NB
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
            shadow={9}
            size="sm"
        />
    );
};
