import { Ref, forwardRef } from 'react';

import { TabListProps } from 'expo-router/ui';
import { Platform, View } from 'react-native';
import { cn } from '~/lib/utils';

export type NavTabBackgroundProps = TabListProps & {};

const NavTabBackground = forwardRef(({ children, className, ...props }: NavTabBackgroundProps, ref: Ref<View>) => {
    const isAndroid = Platform.OS == 'android';

    return (
        <View
            ref={ref}
            {...props}
            style={{ backgroundColor: 'transparent' }}
            className={cn(
                `w-full !bg-transparent flex-row !justify-around pt-4 border-t border-border/60`,
                isAndroid && 'pb-4',
                className
            )}
        >
            {children}
        </View>
    );
});

export { NavTabBackground };

NavTabBackground.displayName = 'NavTabBackground';
