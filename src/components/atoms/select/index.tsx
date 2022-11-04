import { ISelectItemProps, ISelectProps, Select } from 'native-base';
import React from 'react';

interface ISelectComponent extends ISelectProps {}
interface ISelectItemComponent extends ISelectItemProps {}

const SelectComponent = (props: ISelectComponent) => {
    return (
        <Select
            _light={{
                bg: 'coolGray.100',
            }}
            _dark={{
                bg: 'coolGray.800',
            }}
            {...props}
        >
            {props.children}
        </Select>
    );
};

const SelectItemComponent = (props: ISelectItemComponent) => {
    return <Select.Item {...props} />;
};

export { SelectComponent, SelectItemComponent };
