import { HStack, ScrollView } from 'native-base';
import React from 'react';
import ButtonComponent from '../../atoms/button';

interface IButtonSelectorProps {
    items: {
        title: string | React.ReactNode;
    }[];
    focused: number;
    setFocused: React.Dispatch<React.SetStateAction<number>>;
}

export const useButtonSelector = () => {
    const [focused, setFocused] = React.useState<number>(0);

    return {
        focused,
        setFocused,
    };
};

const ButtonSelector = (props: IButtonSelectorProps) => {
    const { items, focused, setFocused } = props;

    return (
        <ScrollView
            mb={2}
            flex={1}
            horizontal
            maxHeight={10}
            flexDirection="row"
            showsHorizontalScrollIndicator={false}
        >
            <HStack justifyContent="space-evenly" space={2} h="10" mx={2}>
                {items.map((item, index) => (
                    <ButtonComponent
                        secondary={focused !== index}
                        onPress={() => {
                            setFocused(index);
                        }}
                        key={index}
                    >
                        {item.title}
                    </ButtonComponent>
                ))}
            </HStack>
        </ScrollView>
    );
};

export default ButtonSelector;
