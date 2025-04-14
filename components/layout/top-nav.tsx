// TopNav.tsx
import React from 'react';
import { Pressable, SafeAreaView } from 'react-native';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppColorMode from '@hooks/theme/colorMode';
import { router, usePathname } from 'expo-router';
import { Icon } from '@rneui/themed';
import { cn } from '~/lib/utils';
import capitalize from 'lodash/capitalize';
import { Text } from '../ui/text';

interface TopNavProps {
    title?: string;
    onBackPress?: () => void;
    rightIcon?: { type: string; name: string }; // Ionicons icon name, e.g., "search" or "settings"
    onRightPress?: () => void;
    // Optional overrides if you want to define your own themed colors.
    className?: string;
    lightIconColor?: string;
    darkIconColor?: string;
}

const TopNav: React.FC<TopNavProps> = ({ title, onBackPress, rightIcon, onRightPress, className }) => {
    const { isLightMode } = useAppColorMode();

    const currentPathName = usePathname().split('/');
    const pathname = capitalize(currentPathName[currentPathName.length - 1]);

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            if (router.canGoBack()) {
                router.back();
            }
        }
    };

    return (
        <SafeAreaView className={cn('bg-background', className)}>
            <View className="flex-row items-center justify-between px-2">
                {/* Back Button */}
                <Pressable onPress={handleBack} className="p-2">
                    <Ionicons name="chevron-back" size={24} color={isLightMode ? '#000' : 'white'} />
                </Pressable>

                {/* Title */}
                <Text className="text-xl font-semibold">{title || pathname}</Text>

                {/* Right Icon or Placeholder */}
                {rightIcon ? (
                    <Pressable onPress={onRightPress} className="p-2">
                        <Icon
                            size={24}
                            type={rightIcon.type}
                            name={rightIcon.name}
                            color={isLightMode ? 'black' : 'white'}
                        />
                    </Pressable>
                ) : (
                    // Keep layout balanced if no right icon is provided.
                    <View className="w-10" />
                )}
            </View>
        </SafeAreaView>
    );
};

export default TopNav;
