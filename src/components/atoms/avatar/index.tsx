import React from 'react';
import { Avatar, Center, IAvatarProps, Text } from 'native-base';
import Loading from '../loading';

interface IAvatarComponentProps extends IAvatarProps {
    error?: string;
    badge?: boolean;
    imageUrl: string;
    lastName?: string;
    firstName?: string;
    isLoading?: boolean;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = props => {
    const { imageUrl, badge, error, firstName, lastName, isLoading } = props;

    return (
        <Center>
            <Avatar
                _dark={{ bg: 'gray.900' }}
                _light={{ bg: 'gray.100' }}
                _text={{ _light: { color: 'gray.700' } }}
                source={{
                    uri: isLoading ? undefined : imageUrl,
                }}
                {...props}
            >
                {isLoading ? (
                    <Loading marginLeft={1} marginTop={1} />
                ) : (
                    `${firstName ? firstName.substring(0, 1) : ''}${lastName ? lastName.substring(0, 1) : ''}`
                )}
                {badge && <Avatar.Badge bg="green.500" />}
            </Avatar>
            {error && (
                <Text fontSize="sm" color="error.500">
                    {error}
                </Text>
            )}
        </Center>
    );
};

export default AvatarComponent;

export const AvatarComponentWithoutBadge: React.FC<IAvatarComponentProps> = ({ imageUrl }) => {
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
