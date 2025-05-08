import { Ref, forwardRef } from 'react';

import { TouchableOpacity, View } from 'react-native';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { Text } from './ui/text';
import useAppColorMode from '~/hooks/theme/colorMode';
import { THEME_CONFIG } from '~/config/appConfig';
import { Icon } from '@rneui/themed';

export type TabButtonProps = TabTriggerSlotProps & {
    iconName: string;
    iconType: string;
};

const TabButton = forwardRef(
    ({ children, iconName, iconType, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
        const { isLightMode } = useAppColorMode();

        return (
            <TouchableOpacity
                ref={ref}
                activeOpacity={0.6}
                {...(props as any)}
                className="gap-1 !flex-col items-center justify-between w-24"
            >
                <Icon
                    size={22}
                    name={iconName}
                    type={iconType}
                    color={
                        isFocused
                            ? isLightMode
                                ? THEME_CONFIG.primary
                                : THEME_CONFIG.primaryLight
                            : THEME_CONFIG.lightGray
                    }
                />
                <Text
                    className={`!text-xs ${isFocused ? 'text-primary dark:text-purple-400' : 'text-muted-foreground'}`}
                >
                    {children}
                </Text>
            </TouchableOpacity>
        );
    }
);

export { TabButton };

TabButton.displayName = 'TabButton';
