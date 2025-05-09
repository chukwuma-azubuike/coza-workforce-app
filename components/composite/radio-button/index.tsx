import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import React from 'react';
import { View } from 'react-native';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

interface IRadioButtonProps extends RadioGroupPrimitive.RootProps {
    radioButtons: Array<RadioGroupPrimitive.ItemProps>;
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
    return (
        <View className="flex-1 justify-center items-center py-4">
            <RadioGroup
                className="gap-3"
                onValueChange={props.onValueChange as () => void}
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

function RadioGroupItemWithLabel({ value, onLabelPress }: { value: string; onLabelPress: () => void }) {
    return (
        <View className={'flex-row gap-2 items-center'}>
            <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
            <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
                {value}
            </Label>
        </View>
    );
}
