import React, { useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import If from '../if-container';
import ModalAlertComponent from '../modal-alert';
import { View } from 'react-native';
import useModal from '~/hooks/modal/useModal';
import * as Haptics from 'expo-haptics';

const NotificationModal: React.FC = () => {
    const { modalState, setModalState } = useModal();
    const { open, render, button, message: raw, status, defaultRender = true } = modalState;
    const message = typeof raw === 'string' && raw ? raw : '';

    const hideModal = () => {
        setModalState({ ...modalState, open: false });
    };

    useEffect(() => {
        switch (status) {
            case 'error':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
            case 'warning':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                break;
            case 'success':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            default:
                break;
        }
    }, [status]);

    return (
        <Dialog open={open || !!render || !!message} onOpenChange={hideModal}>
            <DialogContent className="max-h-[60%] !w-20 p-3" showClose={false}>
                <View className="justify-center mx-auto w-full">
                    <View className="w-full gap-2 rounded-2xl bg-transparent">
                        {render ? (
                            <ModalAlertComponent
                                status={render?.status}
                                iconType={render?.iconType}
                                iconName={render?.iconName}
                                description={render?.description}
                            />
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
