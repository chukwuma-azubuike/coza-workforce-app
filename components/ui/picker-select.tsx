import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './text';
import { Input } from './input';
import { Button } from './button';
import { THEME_CONFIG } from '~/config/appConfig';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import ErrorBoundary from '~/components/composite/error-boundary';

/**
 * List-based replacement for the native iOS `UIPickerView` wheel.
 *
 * The wheel could not be made safe: `RNCPicker.setItems:` never calls
 * `reloadAllComponents`, so `UIPickerView` keeps a stale row count and indexes
 * out of bounds (an uncatchable NSRangeException) whenever the item array is
 * swapped mid-scroll. Compounding it, `PickerIOS` re-pushes `selectedIndex`
 * declaratively on every render, forcing a `selectRow:` that interrupts the
 * in-flight deceleration and emits yet more change events. Selecting from a
 * plain list makes every one of those conditions unreachable, and reads far
 * better for the several-hundred-entry campus/department/user lists this app
 * feeds it.
 *
 * Pass `multiple` to switch to checkbox rows that keep the sheet open, with
 * removable chips under the trigger. Single-select behaviour is untouched.
 */

interface ValidPickerItem {
    [key: string]: any;
}

interface PickerSelectComponentProps<T extends ValidPickerItem> {
    items: T[];
    value?: string;
    labelKey?: keyof T;
    valueKey?: keyof T;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    customLabel?: (arg: T) => string;
    /**
     * Fires only when the selection actually moves — re-picking the current row
     * closes the sheet without announcing a change. Always invoked with a
     * string, typed loosely so callers can narrow the parameter to the union
     * their own `items` are drawn from. `index` is the position of the
     * selection within the `items` prop.
     */
    onValueChange?: (value: any, index: number) => void;
    onError?: (error: Error) => void;
    /** Force the search field on or off. Defaults to on for lists over 10 entries. */
    searchable?: boolean;
    testID?: string;

    /** Toggle rows instead of picking one, and keep the sheet open while choosing. */
    multiple?: boolean;
    /** Selected values in `multiple` mode. Leave undefined to let the picker hold its own. */
    values?: string[];
    /** `multiple` mode only. Receives the selected values and the items they came from. */
    onValuesChange?: (values: any[], items: T[]) => void;
    /** `multiple` mode only. Further selections are refused once this many are held. */
    maxSelections?: number;
    /** Hide the removable chips the picker renders below its trigger in `multiple` mode. */
    showSelectedChips?: boolean;
    /**
     * What the selection hangs off — the parent in a cascade, e.g. the campus id
     * a department list belongs to. On a change the current selection is parked
     * under the outgoing scope and whatever was held for the incoming one is
     * restored, announced through `onValueChange` / `onValuesChange`. Scopes
     * never visited restore as empty, which is the usual cascade clear.
     */
    scopeKey?: string;
}

interface Option {
    label: string;
    value: string;
    index: number;
}

/** Below this, the search field costs more screen than it saves scrolling. */
const SEARCH_THRESHOLD = 10;

/** Must track the row's `py-4` padding and text line height — see `renderItem`. */
const OPTION_ROW_HEIGHT = 57;

/*
 * Sheet chrome, i.e. everything competing with the list for vertical space.
 * These track the markup below and need revisiting if it is restyled.
 */
const GRAB_HANDLE_HEIGHT = 20;
const HEADER_HEIGHT = 56;
const SEARCH_FIELD_HEIGHT = 68;
const SELECTION_BAR_HEIGHT = 44;
const FOOTER_HEIGHT = 84;
const SHEET_BOTTOM_PADDING = 32;

/** Always leave this much backdrop tappable above the sheet. */
const MIN_BACKDROP_HEIGHT = 80;

/** Floor for the list so it stays usable on small screens with the keyboard up. */
const MIN_LIST_HEIGHT = 120;

const EMPTY_VALUES: string[] = [];

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
    disabled,
    onError,
    searchable,
    testID,
    multiple,
    values,
    onValuesChange,
    maxSelections,
    showSelectedChips = true,
    scopeKey,
}: PickerSelectComponentProps<T>) {
    const [value, setValue] = useState<string | undefined>(inputValue !== undefined ? `${inputValue}` : undefined);
    const [internalValues, setInternalValues] = useState<string[]>(EMPTY_VALUES);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const { isDarkColorScheme } = useColorScheme();

    // Callers pass `customLabel` as an inline arrow, so a direct dependency would
    // rebuild the option list on every render of the parent screen.
    const customLabelRef = useRef(customLabel);
    customLabelRef.current = customLabel;

    useEffect(() => {
        try {
            if (labelKey && !items.every(item => labelKey in item)) {
                throw new Error(`Some items are missing labelKey: ${String(labelKey)}`);
            }
            if (valueKey && !items.every(item => valueKey in item)) {
                throw new Error(`Some items are missing valueKey: ${String(valueKey)}`);
            }
        } catch (err) {
            onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    }, [items, labelKey, valueKey, onError]);

    // Keep internal value in sync with prop changes.
    useEffect(() => {
        if (inputValue !== undefined) {
            setValue(`${inputValue}`);
        }
    }, [inputValue]);

    const options = useMemo(() => {
        if (!items?.length) return [] as Option[];

        const seen = new Set<string>();

        return items.reduce<Option[]>((acc, item, index) => {
            try {
                const buildLabel = customLabelRef.current;

                let rawLabel: any;
                if (buildLabel && item) {
                    rawLabel = buildLabel(item);
                } else if (labelKey && item) {
                    rawLabel = item[labelKey];
                } else {
                    rawLabel = item;
                }

                const rawValue = valueKey && item ? item[valueKey] : item;

                const label = rawLabel != null ? String(rawLabel) : '';
                const optionValue = rawValue != null ? String(rawValue) : '';

                if (!optionValue || seen.has(optionValue)) return acc;
                seen.add(optionValue);

                acc.push({ label, value: optionValue, index });
                return acc;
            } catch (err) {
                return acc;
            }
        }, []);
    }, [items, valueKey, labelKey]);

    const optionsByValue = useMemo(() => new Map(options.map(option => [option.value, option])), [options]);

    // Controlled when the caller passes `values`, mirroring `value` in single mode.
    const currentValue = inputValue ?? value;
    const rawValues = multiple ? (values ?? internalValues) : EMPTY_VALUES;

    // Callers build `values` inline (`departments.map(d => d.id)`), so holding it
    // by content rather than identity keeps every memo below — and every visible
    // row — from rebuilding on each render of the parent screen.
    const valuesKey = JSON.stringify(rawValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentValues = useMemo(() => rawValues, [valuesKey]);
    const selectedSet = useMemo(() => new Set(currentValues), [currentValues]);

    // Read inside `handleOpen`, which must not rebuild whenever the selection moves.
    const selectedSetRef = useRef(selectedSet);
    selectedSetRef.current = selectedSet;

    // Selected entries lead the list so reopening a long picker shows what is
    // already held. Only ever applied to a snapshot, never to the live list, so
    // rows cannot reorder under a finger mid-scroll.
    const withSelectedFirst = useCallback(
        (source: Option[]) => {
            if (!multiple) return source;

            const selected = selectedSetRef.current;
            if (!selected.size) return source;

            const chosen = source.filter(option => selected.has(option.value));
            if (!chosen.length || chosen.length === source.length) return source;

            return [...chosen, ...source.filter(option => !selected.has(option.value))];
        },
        [multiple]
    );

    // Hold the list steady while the sheet is open so a background refetch can't
    // reorder rows under the user's finger. An empty snapshot still accepts
    // updates, for the cascading selects that load only after being opened.
    const [frozenOptions, setFrozenOptions] = useState<Option[] | null>(null);
    const visibleOptions = frozenOptions ?? options;

    useEffect(() => {
        if (isOpen && frozenOptions?.length === 0 && options.length > 0) {
            setFrozenOptions(withSelectedFirst(options));
        }
    }, [isOpen, frozenOptions, options, withSelectedFirst]);

    const selectedOption = useMemo(
        () => (currentValue ? options.find(option => option.value === currentValue) : undefined),
        [options, currentValue]
    );

    const selectedOptions = useMemo(
        () =>
            multiple
                ? currentValues.map(val => optionsByValue.get(val)).filter((option): option is Option => !!option)
                : [],
        [multiple, currentValues, optionsByValue]
    );

    // Every item this picker has ever resolved, kept for the life of the mount.
    // A parked selection has to be handed back as items, and by then its list has
    // usually been swapped out for the incoming scope's.
    const knownItems = useRef<Map<string, T>>(new Map());
    useEffect(() => {
        options.forEach(option => {
            const item = items[option.index];
            if (item) knownItems.current.set(option.value, item);
        });
    }, [options, items]);

    // The scope effect reads all of this but must run for a scope change alone,
    // so it takes the current values through refs rather than dependencies.
    const latest = useRef({ currentValue, currentValues, selectedOption, onValueChange, onValuesChange });
    latest.current = { currentValue, currentValues, selectedOption, onValueChange, onValuesChange };

    const parked = useRef<Map<string, { value?: string; index: number; values: string[] }>>(new Map());
    const lastScope = useRef(scopeKey);

    useEffect(() => {
        if (scopeKey === lastScope.current) return;

        const outgoing = lastScope.current;
        lastScope.current = scopeKey;

        const { currentValue: heldValue, currentValues: heldValues, selectedOption: heldOption } = latest.current;

        if (outgoing !== undefined) {
            parked.current.set(outgoing, {
                value: heldValue,
                index: heldOption?.index ?? -1,
                values: heldValues,
            });
        }

        const restored = scopeKey !== undefined ? parked.current.get(scopeKey) : undefined;

        // Options belonging to the outgoing scope must not survive into the new
        // one, or a sheet left open would offer the wrong list.
        setFrozenOptions(null);

        if (multiple) {
            const restoredValues = restored?.values ?? EMPTY_VALUES;
            setInternalValues(restoredValues);
            latest.current.onValuesChange?.(
                restoredValues,
                restoredValues.map(val => knownItems.current.get(val)).filter((item): item is T => !!item)
            );
            return;
        }

        setValue(restored?.value);
        latest.current.onValueChange?.(restored?.value, restored?.index ?? -1);
    }, [scopeKey, multiple]);

    const showSearch = searchable ?? visibleOptions.length > SEARCH_THRESHOLD;

    const filteredOptions = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return visibleOptions;
        return visibleOptions.filter(option => option.label.toLowerCase().includes(term));
    }, [visibleOptions, query]);

    const allFilteredSelected = useMemo(
        () => filteredOptions.length > 0 && filteredOptions.every(option => selectedSet.has(option.value)),
        [filteredOptions, selectedSet]
    );

    // Counted from resolved options, never from the raw values: while `items` is
    // still loading the two disagree, and a header reading "23 selected" over an
    // empty list is worse than reading zero.
    const selectedCount = selectedOptions.length;
    const atLimit = !!maxSelections && selectedCount >= maxSelections;

    // Lifting the whole sheet by the keyboard height would push its header off
    // the top, so track the keyboard and take the space out of the list instead.
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    useEffect(() => {
        if (!isOpen) return;

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const shown = Keyboard.addListener(showEvent, event => setKeyboardHeight(event.endCoordinates.height));
        const hidden = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

        return () => {
            shown.remove();
            hidden.remove();
        };
    }, [isOpen]);

    // FlashList virtualises, so it reports no intrinsic height and collapses to
    // zero inside an auto-height parent. Size the viewport ourselves: tall enough
    // for the rows we have, capped to what is left once the keyboard, the sheet
    // chrome, and a strip of backdrop have taken their share.
    const { height: windowHeight } = useWindowDimensions();
    const chromeHeight =
        GRAB_HANDLE_HEIGHT +
        HEADER_HEIGHT +
        SHEET_BOTTOM_PADDING +
        (showSearch ? SEARCH_FIELD_HEIGHT : 0) +
        (multiple ? SELECTION_BAR_HEIGHT + FOOTER_HEIGHT : 0);
    const maxListHeight = Math.max(
        Math.min(Math.round(windowHeight * 0.55), windowHeight - keyboardHeight - chromeHeight - MIN_BACKDROP_HEIGHT),
        MIN_LIST_HEIGHT
    );
    const listHeight = Math.min(filteredOptions.length * OPTION_ROW_HEIGHT, maxListHeight);

    const handleOpen = useCallback(() => {
        if (disabled || isLoading) return;
        setQuery('');
        setFrozenOptions(withSelectedFirst(options));
        setIsOpen(true);
    }, [disabled, isLoading, options, withSelectedFirst]);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        setIsOpen(false);
        setFrozenOptions(null);
        setQuery('');
        setKeyboardHeight(0);
    }, []);

    const commitValues = useCallback(
        (next: string[]) => {
            // Values with no matching item — a department deleted since the record
            // was saved, say — are dropped rather than reported back with a hole
            // in the items array, so the two arguments always line up.
            const resolved = next
                .map(val => optionsByValue.get(val))
                .filter((option): option is Option => !!option && !!items[option.index]);

            setInternalValues(resolved.map(option => option.value));
            onValuesChange?.(
                resolved.map(option => option.value),
                resolved.map(option => items[option.index] as T)
            );
        },
        [items, optionsByValue, onValuesChange]
    );

    const handleSelect = useCallback(
        (option: Option) => {
            if (multiple) {
                const isSelected = selectedSet.has(option.value);

                if (!isSelected && atLimit) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                    return;
                }

                Haptics.selectionAsync().catch(() => {});
                commitValues(
                    isSelected ? currentValues.filter(val => val !== option.value) : [...currentValues, option.value]
                );
                return;
            }

            setValue(option.value);
            handleClose();

            // Re-picking the row that is already current is not a change, and
            // announcing it as one is destructive: the cascading selects clear
            // their dependents on every campus change, so tapping the campus you
            // already had would wipe the departments under it.
            if (option.value !== currentValue) {
                onValueChange?.(option.value, option.index);
            }
        },
        [multiple, selectedSet, atLimit, currentValues, commitValues, handleClose, onValueChange, currentValue]
    );

    const handleSelectAll = useCallback(() => {
        Haptics.selectionAsync().catch(() => {});

        if (allFilteredSelected) {
            const filtered = new Set(filteredOptions.map(option => option.value));
            commitValues(currentValues.filter(val => !filtered.has(val)));
            return;
        }

        const merged = [...currentValues];
        filteredOptions.forEach(option => {
            if (!merged.includes(option.value)) merged.push(option.value);
        });

        commitValues(maxSelections ? merged.slice(0, maxSelections) : merged);
    }, [allFilteredSelected, filteredOptions, currentValues, commitValues, maxSelections]);

    const handleRemoveChip = useCallback(
        (optionValue: string) => {
            Haptics.selectionAsync().catch(() => {});
            commitValues(currentValues.filter(val => val !== optionValue));
        },
        [currentValues, commitValues]
    );

    const renderItem = useCallback(
        ({ item }: { item: Option }) => {
            const isSelected = multiple ? selectedSet.has(item.value) : item.value === currentValue;
            const isBlocked = multiple && !isSelected && atLimit;

            return (
                <TouchableOpacity
                    activeOpacity={0.6}
                    testID={`picker-option-${item.value}`}
                    accessibilityRole={multiple ? 'checkbox' : 'button'}
                    accessibilityState={{ checked: isSelected, selected: isSelected, disabled: isBlocked }}
                    onPress={() => handleSelect(item)}
                    className={cn(
                        'flex-row items-center gap-3 px-5 py-4',
                        isSelected && multiple && 'bg-muted/40',
                        isBlocked && 'opacity-40'
                    )}
                >
                    {multiple && (
                        <View
                            className={cn(
                                'w-6 h-6 rounded-md border items-center justify-center',
                                isSelected ? 'bg-foreground border-foreground' : 'border-input'
                            )}
                        >
                            {isSelected && (
                                <Check
                                    size={14}
                                    strokeWidth={3}
                                    color={isDarkColorScheme ? THEME_CONFIG.black : THEME_CONFIG.white}
                                />
                            )}
                        </View>
                    )}
                    <Text numberOfLines={1} className={cn('flex-1 !text-lg', isSelected && 'font-bold')}>
                        {item.label}
                    </Text>
                    {!multiple && isSelected && <Check size={20} color={THEME_CONFIG.lightGray} />}
                </TouchableOpacity>
            );
        },
        [multiple, selectedSet, currentValue, atLimit, isDarkColorScheme, handleSelect]
    );

    const triggerLabel = useMemo(() => {
        if (!multiple) return selectedOption?.label ?? placeholder;

        const [first] = selectedOptions;
        if (!first) return placeholder;

        return selectedOptions.length === 1 ? first.label : `${first.label}  +${selectedOptions.length - 1}`;
    }, [multiple, selectedOption, selectedOptions, placeholder]);

    const hasSelection = multiple ? selectedOptions.length > 0 : !!selectedOption;

    return (
        <>
            <TouchableOpacity
                testID={testID}
                activeOpacity={0.6}
                onPress={handleOpen}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={triggerLabel}
            >
                <View
                    className={cn(
                        disabled && 'opacity-50',
                        'rounded-full !h-16 justify-between items-center flex-row !px-6 border border-input',
                        className
                    )}
                >
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text className={cn('!text-lg flex-1', !hasSelection && 'text-muted-foreground')}>
                            {triggerLabel}
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
            </TouchableOpacity>

            {multiple && showSelectedChips && selectedOptions.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                    {selectedOptions.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            activeOpacity={0.6}
                            disabled={disabled}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${option.label}`}
                            onPress={() => handleRemoveChip(option.value)}
                            className="flex-row items-center gap-2 rounded-full border border-border bg-muted/50 pl-4 pr-3 py-2"
                        >
                            <Text numberOfLines={1} className="!text-sm max-w-[200px]">
                                {option.label}
                            </Text>
                            <X size={14} color={THEME_CONFIG.lightGray} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Modal
                transparent
                visible={isOpen}
                animationType="slide"
                onRequestClose={handleClose}
                supportedOrientations={['portrait', 'landscape']}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <Pressable className="flex-1 min-h-[80px]" onPress={handleClose} accessibilityLabel="Dismiss" />
                    <View
                        className="bg-background rounded-t-3xl overflow-hidden pb-8"
                        style={{ marginBottom: keyboardHeight }}
                    >
                        <View className="items-center pt-2.5 pb-1">
                            <View className="h-1 w-10 rounded-full bg-muted-foreground/40" />
                        </View>

                        <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
                            <Text className="!text-xl font-bold flex-1" numberOfLines={1}>
                                {placeholder}
                            </Text>
                            <TouchableOpacity onPress={handleClose} accessibilityRole="button" className="pl-4">
                                <Text className="!text-lg text-muted-foreground">Close</Text>
                            </TouchableOpacity>
                        </View>

                        {showSearch && (
                            <View className="px-5 pb-3">
                                <Input
                                    autoFocus
                                    value={query}
                                    onChangeText={setQuery}
                                    placeholder="Search"
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    returnKeyType="search"
                                    className="!h-14 pl-12 pr-12"
                                />
                                <View className="absolute left-9 top-4">
                                    <Search size={18} color={THEME_CONFIG.lightGray} />
                                </View>
                                {!!query && (
                                    <TouchableOpacity
                                        hitSlop={8}
                                        accessibilityRole="button"
                                        accessibilityLabel="Clear search"
                                        onPress={() => setQuery('')}
                                        className="absolute right-9 top-4"
                                    >
                                        <X size={18} color={THEME_CONFIG.lightGray} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {multiple && (
                            <View className="flex-row items-center justify-between px-5 pb-2">
                                <Text className="!text-sm text-muted-foreground" numberOfLines={1}>
                                    {selectedCount
                                        ? `${selectedCount} selected${maxSelections ? ` of ${maxSelections}` : ''}`
                                        : 'None selected'}
                                </Text>
                                {filteredOptions.length > 0 && (
                                    <TouchableOpacity
                                        hitSlop={8}
                                        onPress={handleSelectAll}
                                        accessibilityRole="button"
                                        disabled={!allFilteredSelected && atLimit}
                                        className={cn('pl-4', !allFilteredSelected && atLimit && 'opacity-40')}
                                    >
                                        <Text className="!text-sm font-semibold text-muted-foreground">
                                            {allFilteredSelected ? 'Clear' : query ? 'Select matches' : 'Select all'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {isLoading ? (
                            <View className="py-10 items-center gap-3">
                                <ActivityIndicator />
                                <Text className="text-muted-foreground">Loading options…</Text>
                            </View>
                        ) : filteredOptions.length ? (
                            <View style={{ height: listHeight }}>
                                <FlashList
                                    data={filteredOptions}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.value}
                                    keyboardShouldPersistTaps="handled"
                                    // Recycled cells hold their own last render, so the
                                    // checkboxes only follow a toggle if the selection is
                                    // declared as list data.
                                    extraData={valuesKey}
                                    ItemSeparatorComponent={() => <View className="h-px bg-border mx-5" />}
                                />
                            </View>
                        ) : (
                            <View className="py-10 items-center">
                                <Text className="text-muted-foreground">
                                    {query ? 'No matches.' : 'Nothing to choose from.'}
                                </Text>
                            </View>
                        )}

                        {multiple && (
                            <View className="px-5 pt-4">
                                <Button onPress={handleClose} accessibilityLabel="Done selecting">
                                    Done
                                </Button>
                            </View>
                        )}
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
