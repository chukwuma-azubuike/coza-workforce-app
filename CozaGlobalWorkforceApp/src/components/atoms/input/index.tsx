import { Input } from 'native-base';
import { IInputProps } from 'native-base/lib/typescript/components/primitives/Input/types';
import React from 'react';

interface IInputComponentProps extends IInputProps {}
const InputComponent = (props: IInputComponentProps) => {
    return (
        <Input
            w="100%"
            size="2xl"
            _light={{
                bg: 'coolGray.100',
            }}
            _dark={{
                bg: 'coolGray.800',
            }}
            {...props}
        />
    );
};

export { InputComponent };
