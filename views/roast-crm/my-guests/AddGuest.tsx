import React, { Suspense } from 'react';
import { Modal, View, Button } from 'react-native';
import Loading from '~/components/atoms/loading';
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
            <View style={{ justifyContent: 'flex-end' }} className=" bg-background rounded-t-lg pb-12 flex-1">
                <View className="bg-secondary/40 rounded-t-2xl p-6">
                    <Text className="font-bold text-lg text-center">Add Guest</Text>
                </View>
                <View className="flex-1 px-2">
                    <Suspense fallback={<Loading />}>
                        <GuestCaptureForm />
                    </Suspense>
                </View>
                <Button title="Cancel" onPress={setModalVisible} />
            </View>
        </Modal>
    );
};

export default AddGuestModal;
