import { useCallback, useEffect, useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Text } from './text';
import { ChevronDown } from 'lucide-react-native';
import { ActivityIndicator, View, Modal, Pressable } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Colors } from '~/constants/Colors';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';
import ErrorBoundary from '~/components/composite/error-boundary';

interface ValidPickerItem {
    [key: string]: any;
}

interface PickerSelectComponentProps<T extends ValidPickerItem> {
    items: T[];
    value?: string;
    labelKey?: keyof T;
    valueKey?: keyof T;
    className?: string;
    customLabel?: (arg: T) => string;
    isLoading?: boolean;
    onError?: (error: Error) => void;
    onValueChange?: (value: any, index: number) => void;
    placeholder?: string;
    // allow other props to maintain compatibility with previous API
    [key: string]: any;
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
    const [_error, setError] = useState<Error | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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
        if (!items?.length) return [] as { label: string; value: string }[];

        const seen = new Set<string>();

        return items.reduce<{ label: string; value: string }[]>((acc, item) => {
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
    const modalBg = isDarkColorScheme ? Colors.dark.background : Colors.light.background;

    const handleValueChange = useCallback(
        (nextValue: any, index: number) => {
            const strVal = nextValue === null ? undefined : String(nextValue);

            if (typeof strVal === 'string') {
                setValue(strVal);
                onValueChange?.(strVal as any, index);
            }
        },
        [onValueChange, setValue]
    );

    const handleModalVisibilityChange = useCallback(
        (visible: boolean) => () => {
            setModalVisible(visible);
        },
        [setModalVisible]
    );

    // Render a touchable control that opens a modal containing the native Picker.
    return (
        <>
            <Pressable
                onPress={handleModalVisibilityChange(true)}
                {...props}
                accessibilityRole="button"
                accessibilityLabel={
                    (selectedItem
                        ? customLabel
                            ? customLabel(selectedItem as T)
                            : String((selectedItem || {})[labelKey as string])
                        : String(placeholder)) as string
                }
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
            </Pressable>

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={handleModalVisibilityChange(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: modalBg }}>
                        {/* top bar with Done */}
                        <View className="bg-muted-background py-1 justify-end flex-row">
                            <Pressable
                                accessibilityRole="button"
                                onPress={handleModalVisibilityChange(false)}
                                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                            >
                                <Text className="font-bold text-xl">Done</Text>
                            </Pressable>
                        </View>

                        <Picker
                            selectedValue={value}
                            onValueChange={(val, index) => {
                                // Picker gives value and index
                                handleValueChange(val, index);
                            }}
                        >
                            {/* placeholder option */}
                            <Picker.Item label={placeholder} value={undefined} key="__placeholder" />
                            {options.map((opt, idx) => (
                                <Picker.Item label={opt.label} value={opt.value} key={opt.value ?? idx} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </Modal>
        </>
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
