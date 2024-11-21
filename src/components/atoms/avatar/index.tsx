import React from 'react';
import { Avatar, Center, IAvatarProps, Text } from 'native-base';
import FastImage from 'react-native-fast-image';
import { SIZE, THEME_CONFIG } from '@config/appConfig';
import { IStatusColors } from '@types/app';
import { STATUS_COLORS } from '@constants/notification-types';
import Loading from '../loading';

interface IAvatarComponentProps extends IAvatarProps {
    error?: string;
    badge?: boolean;
    badgeColor?: IStatusColors;
    imageUrl: string;
    lastName?: string;
    firstName?: string;
    isLoading?: boolean;
    onLoadEnd?: () => void;
    onLoadStart?: () => void;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = props => {
    const { imageUrl, badge, error, isLoading, badgeColor = STATUS_COLORS.ACTIVE, onLoadEnd, onLoadStart } = props;
    const [loading, setLoading] = React.useState<boolean>();

    return (
        <Center>
            <FastImage
                style={{
                    width: SIZE[props.size as any] || 32,
                    height: SIZE[props.size as any] || 32,
                    borderRadius: 100,
                }}
                source={{
                    uri: imageUrl,
                    priority: FastImage.priority.normal,
                }}
                onLoadEnd={() => setLoading(false)}
                onLoadStart={() => setLoading(true)}
            >
                {badge && <Avatar.Badge right={0.9} bottom={0.9} bg={badgeColor} />}
            </FastImage>

            {error && (
                <Text fontSize="sm" color="error.500">
                    {error}
                </Text>
            )}
            {(loading || isLoading) && (
                <Loading
                    style={{ position: 'absolute', borderRadius: 50 }}
                    spinnerProps={{ color: THEME_CONFIG.white, size: 'large' }}
                />
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
