import React, { ReactNode } from 'react';
import { ViewProps, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import useAppColorMode from '@hooks/theme/colorMode';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

interface IModalProps extends ViewProps {
    isOpen?: boolean;
    header?: ReactNode;
    onClose: (args?: any) => void;
}

const ModalComponent: React.FC<IModalProps> = props => {
    const { isOpen, children, onClose, header } = props;
    const { backgroundColor } = useAppColorMode();

    const animationValue = React.useRef(new Animated.Value(0)).current;

    const slideUp = () => {
        Animated.timing(animationValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const slideDown = () => {
        Animated.timing(animationValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    React.useEffect(() => {
        if (isOpen) {
            slideUp();
        } else if (!isOpen) {
            slideDown();
        }
    }, [isOpen]);

    const handleClose = () => {
        slideDown();
    };

    const modalStyle: ViewProps['style'] = {
        opacity: animationValue as any,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        flex: 1,
        width: '100%',
        height: '100%',
        transform: [{ translateY: animationValue.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] as any,
    };

    return isOpen ? (
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={handleClose} {...props}>
            <Animated.View style={modalStyle as any}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.headerContainer, { backgroundColor: backgroundColor }]}>
                        <View className="flex-1">{header}</View>
                        <TouchableOpacity onPress={handleClose}>
                            <Text className="text-xl text-muted-foreground">Close</Text>
                        </TouchableOpacity>
                    </View>
                    <View>{children}</View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    ) : null;
};

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    headerContainer: {
        gap: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 12,
    },
});

export default ModalComponent;
