import { Center, Modal, Text, VStack } from 'native-base';
import React, { useEffect } from 'react';
import { IModalProps } from '../../../../types/app';
import ButtonComponent from '../../atoms/button';
import If from '../if-container';
import ModalAlertComponent from '../modal-alert';

interface INotificationModalProps extends IModalProps {}

const NotificationModal: React.FC<INotificationModalProps> = ({ modalState, setModalState }) => {
    const { open, render, button, message, status, duration, defaultRender = true } = modalState;

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
            duration ? duration * 1000 : 3000 // Modal timeout
        );
    }, [message, render]);

    return (
        <Modal w="full" isOpen={open} onClose={hideModal}>
            <Modal.Content w="90%" h={300}>
                <Center>
                    <VStack w="full" space={2} borderRadius="2xl" backgroundColor="transparent">
                        {render ? (
                            render
                        ) : defaultRender ? (
                            <ModalAlertComponent
                                description={message}
                                iconName={
                                    status === 'success'
                                        ? 'checkmark-circle-outline'
                                        : status === 'info'
                                        ? 'info'
                                        : status === 'warning'
                                        ? 'warning-outline'
                                        : status === 'error'
                                        ? 'error-outline'
                                        : ''
                                }
                                iconType={
                                    status === 'success'
                                        ? 'ionicon'
                                        : status === 'info'
                                        ? 'feather'
                                        : status === 'warning'
                                        ? 'ionicon'
                                        : status === 'error'
                                        ? 'material'
                                        : 'ionicon'
                                }
                                status={status}
                            />
                        ) : (
                            <Text my={4} fontSize="xl" textAlign="center">
                                {message}
                            </Text>
                        )}
                        <If condition={button}>
                            <ButtonComponent title="Hide modal" onPress={hideModal}>
                                Close
                            </ButtonComponent>
                        </If>
                    </VStack>
                </Center>
            </Modal.Content>
        </Modal>
    );
};

export default React.memo(NotificationModal);
