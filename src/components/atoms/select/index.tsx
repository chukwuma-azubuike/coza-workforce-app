import React from 'react';
import {
    Picker,
    PickerItemProps,
    PickerProps,
} from '@react-native-picker/picker';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IIconTypes } from '../../../utils/types';
import useAppColorMode from '../../../hooks/theme/colorMode';

interface ISelectComponent extends PickerProps {}
interface ISelectItemComponent extends PickerItemProps {
    icon?: { name: string; type: IIconTypes };
}

const SelectComponent = (props: ISelectComponent) => {
    const { isLightMode } = useAppColorMode();

    return (
        <Picker
            style={{
                backgroundColor: isLightMode
                    ? THEME_CONFIG.veryLightGray
                    : THEME_CONFIG.darkGray,
                color: isLightMode
                    ? THEME_CONFIG.darkGray
                    : THEME_CONFIG.veryLightGray,
                borderRadius: 100,
                borderWidth: 2,
                borderColor: isLightMode
                    ? THEME_CONFIG.lightGray
                    : THEME_CONFIG.darkGray,
            }}
            // {...props}
            itemStyle={{
                backgroundColor: 'red',
                color: isLightMode
                    ? THEME_CONFIG.darkGray
                    : THEME_CONFIG.veryLightGray,
                borderRadius: 100,
            }}
        >
            {props.children}
        </Picker>
    );
};

const SelectItemComponent = (props: ISelectItemComponent) => {
    const { icon } = props;
    const { isLightMode } = useAppColorMode();

    return (
        <Picker.Item
            label={props.label}
            value={props.value}
            color={
                isLightMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray
            }
        />
    );
};

export { SelectComponent, SelectItemComponent };
