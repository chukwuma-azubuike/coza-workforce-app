import React from 'react';
import { TextInput, TouchableOpacity, View, ViewProps } from 'react-native';
import { IInputProps } from 'native-base/lib/typescript/components/primitives/Input/types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import { IIconTypes } from '@utils/types';
import useAppColorMode from '@hooks/theme/colorMode';
import useDevice from '@hooks/device';
export interface IInputComponentProps extends IInputProps {
    leftIcon?: { name: string; type?: IIconTypes };
    rightIcon?: { name: string; type?: IIconTypes };
    onIconPress?: () => void;
}

interface IInputContainerProps extends ViewProps, Pick<IInputProps, 'leftIcon' | 'rightIcon'> {
    onIconPress?: () => void;
    isActive: boolean;
}

const InputContainer: React.FC<IInputContainerProps> = props => {
    const { leftIcon, rightIcon, onIconPress, children, isActive } = props;

    const { backgroundColor } = useAppColorMode();

    return (
        <View
            style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: backgroundColor,
                borderColor: isActive ? THEME_CONFIG.primaryLight : THEME_CONFIG.transparentGray,
                ...(props.style as any),
            }}
        >
            {leftIcon && <Icon size={22} name={leftIcon.name} type={leftIcon.type} color={THEME_CONFIG.gray} />}
            <View style={{ flex: 1, paddingHorizontal: 8 }}>{children}</View>
            {rightIcon && (
                <TouchableOpacity onPress={onIconPress}>
                    <Icon size={22} type={rightIcon.type} name={rightIcon.name} color={THEME_CONFIG.gray} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const InputComponent: React.FC<IInputComponentProps> = React.memo(props => {
    const { backgroundColor, textColor } = useAppColorMode();
    const [isActive, setIsActive] = React.useState(false);
    const { isIOS } = useDevice();

    const handleFocus = () => {
        setIsActive(true);
    };

    const handleBlur = () => {
        setIsActive(false);
    };

    return (
        <InputContainer {...(props as IInputContainerProps)} isActive={isActive}>
            <TextInput
                onBlur={handleBlur}
                onFocus={handleFocus}
                autoComplete="off"
                autoCorrect={false}
                autoCapitalize="none"
                editable={!props?.isDisabled}
                selectTextOnFocus={!props?.isDisabled}
                secureTextEntry={props.type === 'password'}
                returnKeyType={isIOS ? 'done' : 'default'}
                {...(props as any)}
                style={{
                    height: 36,
                    fontSize: 17,
                    color: textColor,
                    paddingVertical: 0,
                    backgroundColor: backgroundColor,
                    ...(props.style as any),
                }}
            />
        </InputContainer>
    );
});

const NumberInputComponent: React.FC<IInputComponentProps> = React.memo(props => {
    const [isActive, setIsActive] = React.useState(false);
    const { isIOS } = useDevice();
    const { backgroundColor, textColor } = useAppColorMode();

    const handleFocus = () => {
        setIsActive(true);
    };

    const handleBlur = () => {
        setIsActive(false);
    };

    return (
        <InputContainer {...(props as IInputContainerProps)} isActive={isActive}>
            <InputComponent
                {...props}
                borderRadius={THEME_CONFIG.borderRadius}
                _ios={{ returnKeyType: 'done' }}
                enablesReturnKeyAutomatically
                onBlur={handleBlur}
                onFocus={handleFocus}
                style={{
                    fontSize: 17,
                    color: textColor,
                    backgroundColor: backgroundColor,
                    ...(props.style as any),
                }}
                autoComplete="off"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType={isIOS ? 'done' : 'default'}
                {...(props as any)}
            />
        </InputContainer>
    );
});

export { InputComponent, NumberInputComponent };
