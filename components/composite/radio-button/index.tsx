import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import React from 'react';
import { View } from 'react-native';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import * as Haptics from 'expo-haptics';

interface IRadioButtonProps extends RadioGroupPrimitive.RootProps {
    radioButtons: Array<RadioGroupPrimitive.ItemProps & { label?: string }>;
    onChange?: (value?: string) => void;
    defaultSelected?: string;
    onLabelPress: () => void;
}

const RadioButtonGroup: React.FC<Partial<IRadioButtonProps>> = ({
    onChange,
    onLabelPress,
    defaultSelected,
    radioButtons,
    ...props
}) => {
    const handleValueChange = (val: string) => {
        if (props.onValueChange) {
            props.onValueChange(val);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return (
        <View className="flex-1 justify-center items-center py-4">
            <RadioGroup
                className="gap-3"
                onValueChange={handleValueChange as () => void}
                value={props.value}
                {...props}
            >
                {radioButtons?.map(button => (
                    <RadioGroupItemWithLabel onLabelPress={onLabelPress as () => void} {...button} />
                ))}
            </RadioGroup>
        </View>
    );
};

export default RadioButtonGroup;

function RadioGroupItemWithLabel({
    value,
    label,
    onLabelPress,
}: {
    value: string;
    label?: string;
    onLabelPress: () => void;
}) {
    return (
        <View className={'flex-row gap-2 items-center'}>
            <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} id={`label-for-${value}`} />
            <Label
                nativeID={`label-for-${value}`}
                htmlFor={`label-for-${value}`}
                onPress={onLabelPress}
                className="text-lg"
            >
                {label || value}
            </Label>
        </View>
    );
}
