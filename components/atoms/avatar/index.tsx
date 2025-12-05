import React from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { THEME_CONFIG } from '~/config/appConfig';
import { IStatusColors } from '~/types/app';
import { STATUS_COLORS } from '~/constants/notification-types';
import Loading from '../loading';
import { Text } from '~/components/ui/text';
import AvatarPrimitive from '@rn-primitives/avatar';
import { cn } from '~/lib/utils';
import { AVATAR_FALLBACK_URL } from '~/constants';

interface IAvatarComponentProps extends AvatarPrimitive.RootProps {
    size?: number;
    error?: string;
    badge?: boolean;
    badgeColor?: IStatusColors;
    imageUrl: string;
    lastName?: string;
    firstName?: string;
    isLoading?: boolean;
    className?: string;
}

const AvatarComponent: React.FC<IAvatarComponentProps> = props => {
    const { imageUrl: inittialImageUrl, className, badge, error, isLoading, badgeColor = STATUS_COLORS.ACTIVE } = props;
    const [loading, setLoading] = React.useState<boolean>();
    const [imageUrl, setImageUrl] = React.useState<string>(inittialImageUrl);

    const handleLoading = (value: boolean) => () => {
        setLoading(value);
    };

    const handleError = () => {
        setImageUrl(AVATAR_FALLBACK_URL);
    };

    return (
        <View className={cn('w-12 h-12 justify-center relative', className)}>
            {imageUrl && (
                <FastImage
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                    }}
                    source={{
                        uri: imageUrl,
                        cache: 'immutable',
                        priority: FastImage.priority.normal,
                    }}
                    onError={handleError}
                    onLoadEnd={handleLoading(false)}
                    onLoadStart={handleLoading(true)}
                    className={cn('!w-12 !h-12 justify-center relative', className)}
                />
            )}
            {badge && <View className="absolute right-1 bottom-1" style={{ backgroundColor: badgeColor }} />}
            {(loading || isLoading) && (
                <Loading
                    spinnerProps={{ color: THEME_CONFIG.white, size: 'small' }}
                    style={{
                        right: '50%',
                        borderRadius: 50,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        position: 'absolute',
                        transform: [{ translateX: '50%' }],
                    }}
                />
            )}
            {error && <Text className="text-sm text-destructive">{error}</Text>}
        </View>
    );
};

export default AvatarComponent;

AvatarComponent.displayName = 'AvatarComponent';
