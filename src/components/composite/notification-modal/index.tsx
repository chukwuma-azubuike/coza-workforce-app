import { Card, Center, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import Modal from 'react-native-modal';
import { IModalProps } from '../../../../types/app';
import ButtonComponent from '../../atoms/button';

interface INotificationModalProps
    extends Pick<IModalProps, 'render' | 'message' | 'handleOpen' | 'open'> {
    button?: boolean;
}

const NotificationModal: React.FC<INotificationModalProps> = ({
    open,
    render,
    button,
    message,
    handleOpen,
}) => {
    const hideModal = () => {
        handleOpen(false);
    };

    useEffect(() => {
        handleOpen(true);
        // setTimeout(() => handleOpen(false), 5000);
    }, [message, render]);

    return (
        <Modal isVisible={open} onBackdropPress={hideModal}>
            <Center>
                <Card bgColor="gray.100" w="full">
                    <VStack space={2}>
                        {render ? (
                            render
                        ) : (
                            <Text fontSize="lg" textAlign="center">
                                {message}
                            </Text>
                        )}
                        {button && (
                            <ButtonComponent
                                title="Hide modal"
                                onPress={hideModal}
                            >
                                Close
                            </ButtonComponent>
                        )}
                    </VStack>
                </Card>
            </Center>
        </Modal>
    );
};

export default NotificationModal;
