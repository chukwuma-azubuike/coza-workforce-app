import React from 'react';
import { Button, IButtonProps } from 'native-base';

interface IButtonComponent extends IButtonProps {}

const ButtonComponent = (props: IButtonComponent) => {
    return <Button {...props}>{props.children}</Button>;
};

export { ButtonComponent };
