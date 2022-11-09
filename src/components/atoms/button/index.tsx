import React from 'react';
import { Button, IButtonProps } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';

interface IButtonComponent extends IButtonProps {
    secondary?: boolean;
}

const ButtonComponent = (props: IButtonComponent) => {
    const { secondary, width } = props;
    return (
        <Button
            size="lg"
            shadow={2}
            {...props}
            width={width ? width : 'full'}
            padding={3}
            isLoadingText="Loading..."
            borderRadius={THEME_CONFIG.borderRadius}
            _text={{
                color: secondary ? 'primary.50' : 'white',
                fontSize: 'xl',
            }}
            background={`${secondary ? 'white' : 'primary.50'}`}
        >
            {props.children}
        </Button>
    );
};

export default ButtonComponent;
