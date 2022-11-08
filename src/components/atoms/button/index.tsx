import React from 'react';
import { Button, IButtonProps } from 'native-base';

interface IButtonComponent extends IButtonProps {}

const ButtonComponent = (props: IButtonComponent) => {
    return (
        <Button width="full" {...props}>
            {props.children}
        </Button>
    );
};

export { ButtonComponent };
