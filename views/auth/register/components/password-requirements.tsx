import * as React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';

export interface IPasswordRule {
    label: string;
    test: (value: string) => boolean;
}

export const PASSWORD_RULES: IPasswordRule[] = [
    { label: 'At least 8 characters', test: v => v.length >= 8 },
    { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
    { label: 'One lowercase letter', test: v => /[a-z]/.test(v) },
    { label: 'One number', test: v => /[0-9]/.test(v) },
    { label: 'One special character', test: v => /\W/.test(v) },
];

/** True when every rule passes — handy for callers that want a single flag. */
export const isPasswordStrong = (value: string) => PASSWORD_RULES.every(rule => rule.test(value));

/**
 * Live checklist that ticks rules off as the user types, replacing the previous
 * one-error-at-a-time experience where users couldn't tell what was still wrong.
 */
const PasswordRequirements: React.FC<{ value?: string }> = ({ value = '' }) => {
    return (
        <View className="gap-2 rounded-2xl bg-muted/40 p-3">
            {PASSWORD_RULES.map(rule => {
                const passed = rule.test(value);
                return (
                    <View key={rule.label} className="flex-row items-center gap-2">
                        <Ionicons
                            size={16}
                            name={passed ? 'checkmark-circle' : 'ellipse-outline'}
                            color={passed ? THEME_CONFIG.success : THEME_CONFIG.lightGray}
                        />
                        <Text className={cn('text-sm', passed ? 'text-foreground' : 'text-muted-foreground')}>
                            {rule.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

export default React.memo(PasswordRequirements);
