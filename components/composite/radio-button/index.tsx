import useAppColorMode from '@hooks/theme/colorMode';
import React, { useState } from 'react';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';

interface IRadioButtonProps extends RadioButtonProps {
    radioButtons: Array<RadioButtonProps>;
    onChange?: (value?: string) => void;
    defaultSelected?: string;
}

const RadioButton: React.FC<Partial<IRadioButtonProps>> = ({ onChange, defaultSelected, ...props }) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelected);
    const { textColor } = useAppColorMode();

    React.useEffect(() => {
        if (!!onChange && !!selectedId) {
            onChange(props?.radioButtons?.find(button => button.id === selectedId)?.value);
        }
    }, [selectedId]);

    return (
        <RadioGroup
            onPress={setSelectedId}
            selectedId={selectedId}
            labelStyle={{ color: textColor, fontSize: 16 }}
            containerStyle={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
            {...(props as IRadioButtonProps)}
        />
    );
};

export default RadioButton;
