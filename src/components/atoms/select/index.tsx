import React from 'react';
import { ISelectItemProps, ISelectProps, Select } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Icon } from '@rneui/themed';
import { IIconTypes } from '../../../utils/types';
import useAppColorMode from '../../../hooks/theme/colorMode';
import Loading from '../loading';

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
                bg: 'gray.100',
            }}
            _dark={{
                bg: 'gray.900',
            }}
            {...props}
            borderRadius={THEME_CONFIG.borderRadius}
        >
            {props?.children?.length ? (
                props?.children
            ) : (
                <SelectItemComponent
                    w="100%"
                    value="loading"
                    label={(<Loading color="gray.400" mx="auto" />) as unknown as string}
                />
            )}
        </Select>
    );
};

const SelectItemComponent = (props: ISelectItemComponent) => {
    const { icon } = props;
    const { isLightMode } = useAppColorMode();

    return (
        <Select.Item
            {...props}
            leftIcon={
                icon ? (
                    <Icon
                        size={22}
                        name={icon.name}
                        type={icon.type}
                        style={{ marginLeft: 14 }}
                        color={isLightMode ? THEME_CONFIG.gray : THEME_CONFIG.veryLightGray}
                    />
                ) : undefined
            }
        />
    );
};

export { SelectComponent, SelectItemComponent };
