import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import { THEME_CONFIG } from '@config/appConfig';

interface ITextAreaComponent extends TextInputProps {
    isDisabled?: boolean;
}

const TextAreaComponent: React.FC<ITextAreaComponent> = props => {
    const { backgroundColor, textColor } = useAppColorMode();
    const [isActive, setIsActive] = React.useState(false);

    const handleFocus = () => {
        setIsActive(true);
    };

    const handleBlur = () => {
        setIsActive(false);
    };

    return (
        <TextInput
            {...props}
            multiline
            onBlur={handleBlur}
            onFocus={handleFocus}
            editable={!props?.isDisabled}
            selectTextOnFocus={!props?.isDisabled}
            style={{
                padding: 10,
                paddingTop: 10,
                borderRadius: 8,
                color: textColor,
                fontSize: 17,
                minHeight: 100,
                backgroundColor: backgroundColor,
                borderWidth: 1,
                borderColor: isActive ? THEME_CONFIG.primaryLight : THEME_CONFIG.transparentGray,
                ...(props.style as any),
            }}
        />
    );
};

export default React.memo(TextAreaComponent);
