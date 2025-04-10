import { Ref, forwardRef } from 'react';

import { TabListProps } from 'expo-router/ui';
import { useColorScheme } from '~/lib/useColorScheme';
import { ScrollView, View } from 'react-native';

export type NavTabBackgroundProps = TabListProps & {};

const NavTabBackground = forwardRef(({ children, ...props }: NavTabBackgroundProps, ref: Ref<View>) => {
    const { isDarkColorScheme } = useColorScheme();

    return (
        <View
            ref={ref}
            {...props}
            style={{ backgroundColor: 'transparent' }}
            className={`w-full !bg-transparent flex-row pb-10 !justify-around pt-4 border-t border-border/60`}
        >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                {children}
            </ScrollView>
        </View>
    );
});

export { NavTabBackground };

NavTabBackground.displayName = 'NavTabBackground';
