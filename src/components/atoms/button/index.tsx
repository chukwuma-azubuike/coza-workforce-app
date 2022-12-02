import React from 'react';
import { Button, IButtonProps } from 'native-base';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Icon } from '@rneui/themed';
import {
    ResponsiveValue,
    ThemeComponentSizeType,
} from 'native-base/lib/typescript/components/types';

interface IButtonComponent extends IButtonProps {
    size?: ThemeComponentSizeType<'Button'>;
    secondary?: boolean;
    borderRadius?: ResponsiveValue<
        | 'lg'
        | 'md'
        | 'sm'
        | 'xs'
        | 'xl'
        | '2xl'
        | (string & {})
        | (number & {})
        | 'none'
        | '3xl'
        | 'full'
    >;
    shadow?: ResponsiveValue<
        | (string & {})
        | (number & {})
        | 'none'
        | '0'
        | '1'
        | '2'
        | '3'
        | '4'
        | '5'
        | '6'
        | '7'
        | '8'
        | '9'
    >;
}

const ButtonComponent: React.FC<IButtonComponent> = props => {
    const { borderRadius, secondary, shadow, size, width, isLoadingText } =
        props;
    return (
        <Button
            {...props}
            flex={1}
            size={size ? size : 'lg'}
            // padding={size ? 2 : 3}
            width={width ? width : 'full'}
            isLoadingText={isLoadingText ? isLoadingText : 'Loading...'}
            borderRadius={
                borderRadius ? borderRadius : THEME_CONFIG.borderRadius
            }
            _text={{
                color: secondary ? 'primary.900' : 'white',
            }}
            variant={secondary ? 'outline' : 'solid'}
            shadow={shadow ? shadow : secondary ? 'none' : 2}
        >
            {props.children}
        </Button>
    );
};

export const AddButtonComponent: React.FC<IButtonComponent> = props => {
    return (
        <ButtonComponent
            {...props}
            right={6}
            bottom={6}
            width={60}
            height={60}
            shadow={6}
            borderRadius="full"
            position="absolute"
            justifyContent="center"
            alignItems="center"
            size="md"
        >
            <Icon name="plus" type="entypo" size={36} color="white" />
        </ButtonComponent>
    );
};

export default ButtonComponent;
