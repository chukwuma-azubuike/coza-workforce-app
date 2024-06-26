import React from 'react';
import { Avatar, Center, IAvatarProps, Text } from 'native-base';
import FastImage from 'react-native-fast-image';
import { SIZE } from '@config/appConfig';

interface IAvatarComponentProps extends IAvatarProps {
    error?: string;
    badge?: boolean;
    imageUrl: string;
    lastName?: string;
    firstName?: string;
    isLoading?: boolean;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = props => {
    const { imageUrl, badge, error, isLoading } = props;

    return (
        <Center>
            <FastImage
                style={{
                    width: SIZE[props.size as any] || 32,
                    height: SIZE[props.size as any] || 32,
                    borderRadius: 100,
                }}
                source={{
                    uri: isLoading ? undefined : imageUrl,
                    priority: FastImage.priority.normal,
                }}
            >
                {badge && <Avatar.Badge right={0.9} bottom={0.9} bg="green.500" />}
            </FastImage>

            {error && (
                <Text fontSize="sm" color="error.500">
                    {error}
                </Text>
            )}
        </Center>
    );
};

export default React.memo(AvatarComponent);

export const AvatarComponentWithoutBadge: React.FC<IAvatarComponentProps> = React.memo(
    ({ imageUrl, isLoading, ...props }) => {
        return (
            <FastImage
                style={{
                    width: SIZE[props.size as any] || 32,
                    height: SIZE[props.size as any] || 32,
                    borderRadius: 100,
                }}
                source={{
                    uri: isLoading ? undefined : imageUrl,
                    priority: FastImage.priority.normal,
                }}
            />
        );
    }
);
