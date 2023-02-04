import React from 'react';
import { Picker, PickerIOS } from '@react-native-picker/picker';
import { ISelectItemProps, ISelectProps } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Icon } from '@rneui/themed';
import { IIconTypes } from '../../../utils/types';
import useAppColorMode from '../../../hooks/theme/colorMode';
import { Platform } from 'react-native';

interface ISelectComponent extends ISelectProps {}
interface ISelectItemComponent extends ISelectItemProps {
    icon?: { name: string; type: IIconTypes };
}

const SelectComponent = (props: ISelectComponent) => {
    const { isLightMode } = useAppColorMode();

    const PickerWrapper = Platform.OS === 'ios' ? PickerIOS : (Picker as any);

    return (
        <PickerWrapper
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
        </PickerWrapper>
    );
};

const SelectItemComponent = (props: ISelectItemComponent) => {
    const { icon } = props;
    const { isLightMode } = useAppColorMode();

    const PickerItem = Platform.OS === 'ios' ? PickerIOS.Item : Picker.Item;

    return (
        <PickerItem
            label={props.label}
            value={props.value}
            color={
                isLightMode ? THEME_CONFIG.darkGray : THEME_CONFIG.veryLightGray
            }
            // {...props}
            // leftIcon={
            //     icon ? (
            //         <Icon
            //             size={22}
            //             name={icon.name}
            //             type={icon.type}
            //             style={{ marginLeft: 14 }}
            //             color={
            //                 isLightMode
            //                     ? THEME_CONFIG.gray
            //                     : THEME_CONFIG.veryLightGray
            //             }
            //         />
            //     ) : undefined
            // }
        />
    );
};

export { SelectComponent, SelectItemComponent };
