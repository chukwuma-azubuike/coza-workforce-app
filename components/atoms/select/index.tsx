import React from 'react';
import { Picker, PickerItemProps, PickerProps } from '@react-native-picker/picker';
import { THEME_CONFIG } from '@config/appConfig';
import { Icon } from '@rneui/themed';
import { IIconTypes } from '@utils/types';
import useAppColorMode from '@hooks/theme/colorMode';
import { Button, Modal, Platform, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import HStackComponent from '@components/layout/h-stack';
import TextComponent from '@components/text';
import getDeepField from '@utils/getDeepField';
import moment from 'moment';
import isValidDate from '@utils/isValidDate';
import ErrorBoundary from '@components/composite/error-boundary';
import spreadDependencyArray from '@utils/spreadDependencyArray';

interface ISelectComponent extends PickerProps {
    items: Array<any>;
    valueKey?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    formFieldKey?: string;
    labelSeparator?: string;
    containerStyle?: StyleProp<ViewStyle>;
    setFieldValue?: (field: string, value: any) => void;
    displayKey?: string | Array<string | { key: string; path: string }>;
}
interface ISelectItemComponent extends PickerItemProps {
    icon?: { name: string; type: IIconTypes };
    isLoading?: boolean;
}

interface ISelectButtonProps {
    enabled: boolean;
    togglePicker: () => void;
    label?: string;
    isLoading?: boolean;
    style?: StyleProp<ViewStyle>;
}

const SelectButton: React.FC<ISelectButtonProps> = React.memo(
    ({ enabled, togglePicker, label, style, isLoading }): React.ReactNode => {
        const { backgroundColor, textColor } = useAppColorMode();
        return (
            <TouchableOpacity
                disabled={!enabled}
                activeOpacity={0.4}
                onPress={togglePicker}
                style={{ opacity: !enabled ? 0.6 : 1, ...(style as {}) }}
            >
                <HStackComponent
                    style={{
                        backgroundColor: backgroundColor,
                        borderRadius: 8,
                        borderWidth: 0.1,
                        flex: 0,
                        paddingVertical: 6,
                        paddingRight: 10,
                        paddingLeft: 16,
                    }}
                >
                    <TextComponent size="lg" style={{ flex: 1, paddingVertical: 10 }}>
                        {isLoading ? 'Loading...' : label}
                    </TextComponent>
                    <Icon size={22} type="ant-design" style={{ marginLeft: 10 }} name="down" color={textColor} />
                </HStackComponent>
            </TouchableOpacity>
        );
    }
);

const SelectComponent = React.memo((props: ISelectComponent) => {
    const {
        isDisabled,
        displayKey,
        placeholder,
        selectedValue,
        valueKey,
        items = [],
        isLoading,
        labelSeparator,
    } = props;

    const [visible, setVisible] = React.useState<boolean>(false);
    const [selectedId, setSelectedId] = React.useState<any>(selectedValue);
    const [selectedItemLabel, setSelectedItemLabel] = React.useState<any>();

    const togglePicker = () => {
        setVisible(prev => !prev);
    };

    const formatLabel = (value: string | number) => {
        if (isValidDate(value)) {
            return moment(value).format('Do MMM YYYY');
        }
        return value;
    };

    const handleValueChange = React.useCallback(
        (value: any) => {
            setSelectedId(value);
            let selectedItemIndex: number = 0;

            if (typeof items[0] !== 'object') {
                props?.onValueChange && props?.onValueChange(value, selectedItemIndex);
                setSelectedItemLabel(formatLabel(value));
                return;
            }

            const selectedItem = items?.find((item, index) => {
                selectedItemIndex = index;
                return item[valueKey || '_id'] === value;
            });
            if (!!selectedItem) {
                if (Array.isArray(displayKey)) {
                    const concat = displayKey
                        ?.map<any>(item =>
                            formatLabel(
                                selectedItem[getDeepField(item, typeof item === 'string' ? item : item?.path) as string]
                            )
                        )
                        .join(labelSeparator || ' | ');
                    setSelectedItemLabel(concat);
                } else {
                    if (!!displayKey) {
                        setSelectedItemLabel(formatLabel(selectedItem[displayKey]));
                    }
                }
            }

            props?.onValueChange && props?.onValueChange(value, selectedItemIndex);
        },
        [items, valueKey, displayKey, props?.onValueChange]
    );

    const handleChange = (itemValue: string | number, itemIndex: number) => {
        props?.onValueChange && props.onValueChange(itemValue, itemIndex);
        props?.setFieldValue && props?.formFieldKey && props.setFieldValue(props?.formFieldKey, itemValue);
    };

    React.useEffect(() => {
        if (!selectedValue && isIOS) {
            setSelectedItemLabel(placeholder);
        }

        props?.setFieldValue && props?.formFieldKey && props.setFieldValue(props?.formFieldKey, selectedValue);
    }, [selectedValue]);

    React.useEffect(() => {
        if (isIOS) {
            setSelectedId(undefined);
            setSelectedItemLabel(placeholder);
        }
    }, [...spreadDependencyArray(items, valueKey)]);

    // Initialise button label
    React.useEffect(() => {
        if (isIOS && !!selectedValue) {
            handleValueChange(selectedValue);
        }
    }, [selectedValue]);

    const handleClose = () => {
        setVisible(false);
    };

    const isIOS = Platform.OS === 'ios';
    const { backgroundColor, textColor } = useAppColorMode();

    return (
        <ErrorBoundary>
            <View style={props.containerStyle}>
                {isIOS && (
                    <SelectButton
                        style={props.style}
                        isLoading={isLoading}
                        togglePicker={togglePicker}
                        enabled={!isDisabled && !isLoading}
                        label={selectedItemLabel || placeholder}
                    />
                )}
                {isIOS ? (
                    <Modal
                        visible={visible}
                        presentationStyle="formSheet"
                        animationType="slide"
                        style={{ backgroundColor: backgroundColor }}
                    >
                        <View
                            style={{
                                backgroundColor: backgroundColor,
                            }}
                        >
                            <Picker
                                {...props}
                                style={{
                                    borderRadius: 20,
                                    color: textColor,
                                }}
                                itemStyle={{
                                    height: '100%',
                                    color: textColor,
                                }}
                                selectedValue={selectedId}
                                mode="dialog"
                                prompt={props.placeholder}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    bottom: 60,
                                    width: '100%',
                                    position: 'absolute',
                                    justifyContent: 'center',
                                }}
                            >
                                <Button title="Done" onPress={handleClose} />
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <Picker
                        {...props}
                        style={{
                            ...(props.style as {}),
                            padding: 4,
                            borderRadius: 20,
                            backgroundColor: backgroundColor,
                        }}
                        selectedValue={!!selectedValue ? selectedValue : (null as any)}
                        onValueChange={handleChange}
                        enabled={!isDisabled && !isLoading}
                        mode="dialog"
                        prompt={props.placeholder}
                        selectionColor={THEME_CONFIG.primaryLight}
                    />
                )}
            </View>
        </ErrorBoundary>
    );
});

const SelectItemComponent = React.memo((props: ISelectItemComponent) => {
    const { icon, isLoading, label } = props;
    const { isLightMode } = useAppColorMode();

    return (
        <Picker.Item
            {...props}
            // leftIcon={
            //     icon ? (
            //         <Icon
            //             size={22}
            //             name={icon.name}
            //             type={icon.type}
            //             style={{ marginLeft: 14 }}
            //             color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.veryLightGray}
            //         />
            //     ) : undefined
            // }
        />
    );
});

export { SelectComponent, SelectItemComponent };
