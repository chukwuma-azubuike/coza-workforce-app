import React, { useCallback, useMemo, useState } from 'react';
import RNPickerSelect, { PickerSelectProps } from 'react-native-picker-select';
import { Text } from './text';
import { ChevronDown } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Colors } from '~/constants/Colors';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';

interface PickerSelectComponentProps<T> extends Omit<PickerSelectProps, 'items'> {
    items: T[];
    value?: string;
    labelKey?: keyof T;
    valueKey?: keyof T;
    className?: string;
    customLabel?: (arg: T) => string;
    isLoading?: boolean;
}

function PickerSelect<T = any>({
    items = [],
    labelKey,
    valueKey,
    isLoading,
    customLabel,
    onValueChange,
    className,
    value: inputValue,
    placeholder = 'Select',
    ...props
}: PickerSelectComponentProps<T>) {
    const [value, setValue] = useState<string | undefined>(inputValue !== undefined ? `${inputValue}` : undefined);

    // Keep internal value in sync with prop changes
    React.useEffect(() => {
        setValue(inputValue !== undefined ? `${inputValue}` : undefined);
    }, [inputValue]);

    const selectedItem = useMemo(
        () => items?.find(item => (valueKey ? `${item[valueKey]}` === `${inputValue ?? value}` : item === inputValue)),
        [items, value, valueKey, inputValue]
    );

    const options = useMemo(() => {
        const seen = new Set<string>();
        const mapped =
            items?.map(item => {
                const rawLabel = labelKey ? (customLabel ? customLabel(item) : (item[labelKey] as any)) : (item as any);
                const rawValue = valueKey ? (item[valueKey] as any) : (item as any);

                const label = rawLabel != null ? String(rawLabel) : '';
                const val = rawValue != null ? String(rawValue) : '';

                return { label, value: val };
            }) || [];

        return mapped.filter(opt => {
            if (!opt.value) return false;
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
        });
    }, [items, valueKey, labelKey, customLabel]);

    const { isDarkColorScheme } = useColorScheme();

    const handleValueChange = useCallback(
        (nextValue: any, index: number) => {
            const strVal = nextValue == null ? undefined : String(nextValue);

            if (typeof strVal === 'string') {
                setValue(strVal);
                onValueChange(strVal as any, index);
            }
        },
        [onValueChange]
    );

    return (
        <RNPickerSelect
            pickerProps={{
                accessibilityLabel: (selectedItem
                    ? customLabel
                        ? customLabel(selectedItem as T)
                        : String((selectedItem || {})[labelKey as string])
                    : String(placeholder)) as string,
            }}
            value={value}
            items={options}
            onValueChange={handleValueChange}
            darkTheme={isDarkColorScheme}
            style={{
                modalViewBottom: {
                    height: 300,
                    backgroundColor: Colors.light.background,
                },
                modalViewBottomDark: {
                    height: 300,
                    backgroundColor: Colors.dark.background,
                },
                done: {
                    color: THEME_CONFIG.black,
                },
                doneDark: {
                    color: THEME_CONFIG.white,
                },
                chevron: {
                    display: 'none',
                },
                chevronDark: {
                    display: 'none',
                },
            }}
            {...props}
        >
            <View
                className={cn(
                    'rounded-xl !h-16 justify-between items-center flex-row !px-3 border border-input',
                    className
                )}
            >
                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <Text className="!text-lg flex-1">
                        {customLabel && selectedItem
                            ? customLabel((selectedItem || {}) as T)
                            : ((!!selectedItem ? (selectedItem || {})[labelKey as string] : placeholder) as string)}
                    </Text>
                )}
                <View className="pl-1">
                    <ChevronDown
                        size={16}
                        color={THEME_CONFIG.lightGray}
                        aria-hidden={true}
                        className="text-foreground opacity-50"
                    />
                </View>
            </View>
        </RNPickerSelect>
    );
}

export default PickerSelect;
