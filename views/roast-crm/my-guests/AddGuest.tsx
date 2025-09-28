import { X } from 'lucide-react-native';
import React, { Suspense } from 'react';
import { Modal, View } from 'react-native';
import Loading from '~/components/atoms/loading';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

const GuestCaptureForm = React.lazy(() => import('./guests/GuestCaptureForm'));

interface AddGuestModalProps {
    modalVisible: boolean;
    setModalVisible: () => void;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ modalVisible, setModalVisible }) => {
    return (
        <Modal
            animationType="slide"
            visible={modalVisible}
            className="!bg-background"
            presentationStyle="formSheet"
            onRequestClose={setModalVisible}
        >
            <View
                style={{ justifyContent: 'flex-end' }}
                className="bg-secondary dark:bg-background rounded-t-lg pb-8 flex-1"
            >
                <View className="bg-secondary/40 rounded-t-2xl p-6 relative">
                    <Text className="font-bold text-lg text-center">Add Guest</Text>
                    <Button variant="ghost" className="absolute top-5 right-4 !h-8 w-8" onPress={setModalVisible}>
                        <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </View>
                <View className="flex-1 px-2">
                    <Suspense fallback={<Loading cover />}>
                        <GuestCaptureForm setModalVisible={setModalVisible} />
                    </Suspense>
                </View>
            </View>
        </Modal>
    );
};

export default AddGuestModal;
