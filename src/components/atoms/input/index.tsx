import React from 'react';
import { Input, INumberInputProps, NumberInput, Pressable } from 'native-base';
import { IInputProps } from 'native-base/lib/typescript/components/primitives/Input/types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IIconTypes } from '../../../utils/types';
import { StyleSheet } from 'react-native';
// import { Input as RNInput } from 'react-native-elements';

export interface IInputComponentProps extends IInputProps {
    leftIcon?: { name: string; type?: IIconTypes };
    rightIcon?: { name: string; type?: IIconTypes };
    onIconPress?: () => void;
}

type INumberInputComponentProps = INumberInputProps & {
    leftIcon?: { name: string; type?: IIconTypes };
    rightIcon?: { name: string; type?: IIconTypes };
    onIconPress?: () => void;
};

const InputComponent = (props: IInputComponentProps) => {
    const { leftIcon, rightIcon, onIconPress } = props;

    return (
        <>
            {/* <RNInput
                style={style.base}
                leftIcon={
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
                rightIcon={
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
            /> */}
            <Input
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
                leftIcon={
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
                rightIcon={
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
        </>
    );
};

const NumberInputComponent = (props: INumberInputComponentProps) => {
    const { leftIcon, rightIcon, onIconPress } = props;

    return (
        <NumberInput
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

const style = StyleSheet.create({
    base: {
        height: 54,
        padding: 3,
        fontSize: 20,
        width: '100%',
        borderWidth: 1,
        paddingStart: 16,
        borderRadius: 10,
        borderColor: THEME_CONFIG.primary,
        backgroundColor: THEME_CONFIG.veryLightGray,
    },
});

export { InputComponent, NumberInputComponent };
