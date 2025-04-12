import React from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import If from '../if-container';
import ModalAlertComponent from '../modal-alert';
import { View } from 'react-native';
import useModal from '~/hooks/modal/useModal';

const NotificationModal: React.FC = () => {
    const { modalState, setModalState } = useModal();
    const { open, render, button, message, status, defaultRender = true } = modalState;

    const hideModal = () => {
        setModalState({ ...modalState, open: false });
    };

    return (
        <Dialog open={typeof open === 'boolean' ? open : !!(render || message)} onOpenChange={hideModal}>
            <DialogContent className="w-11/12 h-72">
                <View className="justify-center">
                    <View className="w-full gap-2 rounded-2xl bg-transparent">
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
                            <Text className="my-4 text-3xl text-center">{message}</Text>
                        )}
                        <If condition={button}>
                            <Button variant="destructive" onPress={hideModal}>
                                Close
                            </Button>
                        </If>
                    </View>
                </View>
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(NotificationModal);
