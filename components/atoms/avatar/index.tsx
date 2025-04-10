import React from 'react';
import { View } from 'react-native';
import { THEME_CONFIG } from '~/config/appConfig';
import { IStatusColors } from '~/types/app';
import { STATUS_COLORS } from '~/constants/notification-types';
import Loading from '../loading';
import { Text } from '~/components/ui/text';
import AvatarPrimitive from '@rn-primitives/avatar';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import getFirstCharacter from '~/utils/getFirstCharacter';
import { cn } from '~/lib/utils';

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
    const {
        imageUrl,
        className,
        badge,
        error,
        isLoading,
        firstName,
        lastName,
        badgeColor = STATUS_COLORS.ACTIVE,
    } = props;
    const [loading, setLoading] = React.useState<boolean>();

    return (
        <>
            <Avatar className={cn('w-12 h-12 relative', className)} {...props}>
                <AvatarImage source={{ uri: imageUrl }} />
                <AvatarFallback>
                    <Text>
                        {getFirstCharacter(lastName)}
                        {getFirstCharacter(firstName)}
                    </Text>
                </AvatarFallback>
                {badge && <View className="absolute right-1 bottom-1" style={{ backgroundColor: badgeColor }} />}
                {(loading || isLoading) && (
                    <Loading
                        style={{ position: 'absolute', borderRadius: 50 }}
                        spinnerProps={{ color: THEME_CONFIG.white, size: 'large' }}
                    />
                )}
                {error && <Text className="text-sm text-destructive">{error}</Text>}
            </Avatar>
            {/* <FastImage
                style={{
                    width: SIZE[size as any] || 32,
                    height: SIZE[size as any] || 32,
                    borderRadius: 100,
                }}
                source={{
                    uri: imageUrl,
                    priority: FastImage.priority.normal,
                }}
                onLoadEnd={() => setLoading(false)}
                onLoadStart={() => setLoading(true)}
            /> */}
        </>
    );
};

export default AvatarComponent;

AvatarComponent.displayName = 'AvatarComponent';
