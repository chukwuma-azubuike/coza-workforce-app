import { Center, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import Modal from 'react-native-modal';
import { IModalProps } from '../../../../types/app';
import ButtonComponent from '../../atoms/button';

interface INotificationModalProps extends IModalProps {}

const NotificationModal: React.FC<INotificationModalProps> = ({
    modalState,
    setModalState,
}) => {
    const { open, render, button, message, duration } = modalState;

    const hideModal = () => {
        setModalState(prev => {
            return { ...prev, open: false };
        });
    };

    useEffect(() => {
        if (message || render) {
            setModalState(prev => {
                return { ...prev, open: true };
            });
        }
        setTimeout(
            () => {
                setModalState({ open: false });
            },
            duration ? duration * 1000 : 5000 // Modal timeout
        );
    }, [message, render]);

    return (
        <Modal isVisible={open} onBackdropPress={hideModal}>
            <Center>
                <VStack
                    w="full"
                    space={2}
                    borderRadius="2xl"
                    backgroundColor="transparent"
                >
                    {render ? (
                        render
                    ) : (
                        <Text my={4} fontSize="xl" textAlign="center">
                            {message}
                        </Text>
                    )}
                    {button && (
                        <ButtonComponent title="Hide modal" onPress={hideModal}>
                            Close
                        </ButtonComponent>
                    )}
                </VStack>
            </Center>
        </Modal>
    );
};

export default NotificationModal;
