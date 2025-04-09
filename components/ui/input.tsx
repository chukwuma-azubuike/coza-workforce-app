import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { TextInput, TouchableOpacity, View, type TextInputProps } from 'react-native';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';
import { IoniconTypes } from '~/types/app';
import * as Haptics from 'expo-haptics';

export interface ITextInputProps {
    leftIcon?: { name?: IoniconTypes };
    rightIcon?: { name?: IoniconTypes };
    onIconPress?: () => void;
    isDisabled?: boolean;
    isPassword?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps & ITextInputProps>(
    ({ className, placeholderClassName, onIconPress, leftIcon, rightIcon, isDisabled, isPassword, ...props }, ref) => {
        const [secureTextEntry, setSecureTextEntry] = React.useState(isPassword);

        const togglePasswordVisibility = () => {
            setSecureTextEntry(!secureTextEntry);
        };

        return (
            <View className={cn('relative', (props.editable === false || isDisabled) && 'opacity-40')}>
                {leftIcon && (
                    <Ionicons
                        size={24}
                        name={leftIcon.name}
                        color={THEME_CONFIG.gray}
                        className="absolute left-0 top-5 translate-x-1/2 z-10"
                    />
                )}

                <TextInput
                    ref={ref}
                    editable={!isDisabled}
                    secureTextEntry={secureTextEntry}
                    className={cn(
                        'web:flex h-10 native:h-16 web:w-full rounded-xl border border-input bg-background px-4 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
                        (props.editable === false || isDisabled) && 'web:cursor-not-allowed',
                        (!!leftIcon || !!rightIcon) && 'px-12',
                        className
                    )}
                    placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onIconPress}>
                        <Ionicons
                            size={24}
                            type={rightIcon.name}
                            color={THEME_CONFIG.gray}
                            className="absolute right-0 top-5 translate-x-1/2 z-10"
                        />
                    </TouchableOpacity>
                )}

                {isPassword && (
                    <TouchableOpacity
                        onPress={event => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            togglePasswordVisibility();
                        }}
                        className="absolute top-5 right-3"
                    >
                        <Ionicons name={secureTextEntry ? 'eye-off' : 'eye'} size={24} color="gray" />
                    </TouchableOpacity>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';

export { Input };
