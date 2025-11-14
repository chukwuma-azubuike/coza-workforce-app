import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RNPickerSelect, { PickerSelectProps } from 'react-native-picker-select';
import { Text } from './text';
import { ChevronDown } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Colors } from '~/constants/Colors';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';
import ErrorBoundary from '~/components/composite/error-boundary';
import type { Item } from 'react-native-picker-select';

interface ValidPickerItem {
    [key: string]: any;
}

interface PickerSelectComponentProps<T extends ValidPickerItem> extends Omit<PickerSelectProps, 'items'> {
    items: T[];
    value?: string;
    labelKey?: keyof T;
    valueKey?: keyof T;
    className?: string;
    customLabel?: (arg: T) => string;
    isLoading?: boolean;
    onError?: (error: Error) => void;
}

function PickerSelect<T extends ValidPickerItem>({
    items = [],
    labelKey,
    valueKey,
    isLoading,
    customLabel,
    onValueChange,
    className,
    value: inputValue,
    placeholder = 'Select',
    onError,
    ...props
}: PickerSelectComponentProps<T>) {
    const [value, setValue] = useState<string | undefined>(inputValue !== undefined ? `${inputValue}` : undefined);
    const [error, setError] = useState<Error | null>(null);

    // Validate items and props
    useEffect(() => {
        try {
            if (labelKey && !items.every(item => labelKey in item)) {
                throw new Error(`Some items are missing labelKey: ${String(labelKey)}`);
            }
            if (valueKey && !items.every(item => valueKey in item)) {
                throw new Error(`Some items are missing valueKey: ${String(valueKey)}`);
            }
            setError(null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onError?.(error);
        }
    }, [items, labelKey, valueKey, onError]);

    // Keep internal value in sync with prop changes
    useEffect(() => {
        let mounted = true;
        if (mounted && inputValue !== undefined) {
            setValue(`${inputValue}`);
        }
        return () => {
            mounted = false;
        };
    }, [inputValue]);

    const selectedItem = useMemo(() => {
        if (!items?.length) return null;
        const currentValue = inputValue ?? value;
        if (!currentValue) return null;

        return items.find(item => {
            if (valueKey) {
                const itemValue = item[valueKey];
                return itemValue != null && `${itemValue}` === currentValue;
            }
            return false;
        });
    }, [items, value, valueKey, inputValue]);

    const options = useMemo(() => {
        if (!items?.length) return [] as Item[];

        const seen = new Set<string>();

        return items.reduce<Item[]>((acc, item) => {
            try {
                let rawLabel: any;
                if (customLabel && item) {
                    rawLabel = customLabel(item);
                } else if (labelKey && item) {
                    rawLabel = item[labelKey];
                } else {
                    rawLabel = item;
                }

                const rawValue = valueKey && item ? item[valueKey] : item;

                const label = rawLabel != null ? String(rawLabel) : '';
                const value = rawValue != null ? String(rawValue) : '';

                if (!value || seen.has(value)) return acc;
                seen.add(value);

                acc.push({ label, value });
                return acc;
            } catch (err) {
                return acc;
            }
        }, []);
    }, [items, valueKey, labelKey, customLabel]);

    const { isDarkColorScheme } = useColorScheme();

    const handleValueChange = useCallback(
        (nextValue: any, index: number) => {
            const strVal = nextValue === null ? undefined : String(nextValue);

            setValue(strVal);
            onValueChange?.(strVal as any, index);
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

const PickerSelectWithErrorBoundary = <T extends ValidPickerItem>(props: PickerSelectComponentProps<T>) => (
    <ErrorBoundary>
        <PickerSelect<T> {...props} />
    </ErrorBoundary>
);

export type { PickerSelectComponentProps };
export { PickerSelect };
export default PickerSelectWithErrorBoundary;
