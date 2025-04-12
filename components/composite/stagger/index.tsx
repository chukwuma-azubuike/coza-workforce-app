import { Icon } from '@rneui/themed';
import { IBoxProps, IconButton, Stagger, useDisclose } from 'native-base';
import { ColorType } from 'native-base/lib/typescript/components/types';
import React from 'react';
import { IIconTypes } from '@utils/types';
import { View } from 'react-native';

export interface IStaggerButtonComponentProps extends IBoxProps {
    buttons: {
        iconName: string;
        color: ColorType;
        iconType: IIconTypes;
        handleClick?: () => void;
    }[];
}

// You must include this component as the very last component in a view

const StaggerButtonComponent: React.FC<IStaggerButtonComponentProps> = props => {
    const { isOpen, onToggle } = useDisclose();

    return (
        <View style={{ right: 18, bottom: 36, position: 'absolute', zIndex: isOpen ? 12 : 0 }}>
            <View alignItems="center">
                <Stagger
                    visible={isOpen}
                    initial={{
                        opacity: 0,
                        scale: 0,
                        translateY: 34,
                    }}
                    animate={{
                        translateY: 0,
                        scale: 1,
                        opacity: 1,
                        transition: {
                            type: 'spring',
                            mass: 0.8,
                            stagger: {
                                offset: 30,
                                reverse: true,
                            },
                        },
                    }}
                    exit={{
                        translateY: 34,
                        scale: 0.5,
                        opacity: 0,
                        transition: {
                            duration: 100,
                            stagger: {
                                offset: 30,
                                reverse: true,
                            },
                        },
                    }}
                >
                    {props?.buttons?.map((elm, idx) => (
                        <IconButton
                            mb="4"
                            key={idx}
                            size={65}
                            bg={elm.color}
                            borderRadius="full"
                            onPress={elm.handleClick}
                            icon={<Icon size={28} color="white" name={elm.iconName} type={elm.iconType} />}
                        />
                    ))}
                </Stagger>
            </View>
            <View justifyContent="center">
                <IconButton
                    size="lg"
                    variant="solid"
                    bg="primary.600"
                    borderRadius="full"
                    onPress={onToggle}
                    icon={<Icon size={38} color="white" type="entypo" name={isOpen ? 'minus' : 'plus'} />}
                />
            </View>
        </View>
    );
};

export default React.memo(StaggerButtonComponent);
