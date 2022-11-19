import React from 'react';
import { Input, Pressable } from 'native-base';
import { IInputProps } from 'native-base/lib/typescript/components/primitives/Input/types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IIconTypes } from '../../../utils/types';

export interface IInputComponentProps extends IInputProps {
    leftIcon?: { name: string; type?: IIconTypes };
    rightIcon?: { name: string; type?: IIconTypes };
    onIconPress?: () => void;
}

const InputComponent = (props: IInputComponentProps) => {
    const { leftIcon, rightIcon, onIconPress } = props;

    return (
        <Input
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
            InputLeftElement={
                leftIcon ? (
                    <Icon
                        size={22}
                        name={leftIcon.name}
                        type={leftIcon.type}
                        color={THEME_CONFIG.gray}
                        style={{ marginLeft: 14 }}
                    />
                ) : undefined
            }
            InputRightElement={
                rightIcon ? (
                    <Pressable onPress={onIconPress}>
                        <Icon
                            size={22}
                            type={rightIcon.type}
                            name={rightIcon.name}
                            color={THEME_CONFIG.gray}
                            style={{ marginRight: 14 }}
                        />
                    </Pressable>
                ) : undefined
            }
        />
    );
};

export { InputComponent };
