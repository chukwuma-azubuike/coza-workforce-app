import React from 'react';
import { ISelectItemProps, ISelectProps, Select } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Icon } from '@rneui/themed';
import { IIconTypes } from '../../../utils/types';

interface ISelectComponent extends ISelectProps {}
interface ISelectItemComponent extends ISelectItemProps {
    icon?: { name: string; type: IIconTypes };
}

const SelectComponent = (props: ISelectComponent) => {
    return (
        <Select
            p={3}
            w="100%"
            size="lg"
            _light={{
                bg: 'coolGray.100',
            }}
            _dark={{
                bg: 'coolGray.800',
            }}
            {...props}
            borderRadius={THEME_CONFIG.borderRadius}
        >
            {props.children}
        </Select>
    );
};

const SelectItemComponent = (props: ISelectItemComponent) => {
    const { icon } = props;

    return (
        <Select.Item
            {...props}
            leftIcon={
                icon ? (
                    <Icon
                        size={22}
                        name={icon.name}
                        type={icon.type}
                        color={THEME_CONFIG.gray}
                        style={{ marginLeft: 14 }}
                    />
                ) : undefined
            }
        />
    );
};

export { SelectComponent, SelectItemComponent };
