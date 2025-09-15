import React from 'react';
import { Modal, View, Button } from 'react-native';
import { Text } from '~/components/ui/text';
import { GuestCaptureForm } from './guests';

interface AddGuestModalProps {
    modalVisible: boolean;
    setModalVisible: () => void;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ modalVisible, setModalVisible }) => {
    return (
        // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} className="bg-background">
            <Modal
                animationType="slide"
                visible={modalVisible}
                className="!bg-background"
                presentationStyle="formSheet"
                onRequestClose={setModalVisible}
            >
                <View style={{ justifyContent: 'flex-end' }} className=" bg-background rounded-t-2xl pb-12 flex-1">
                    <View className="bg-secondary/40 rounded-t-2xl p-6">
                        <Text className="font-bold text-lg text-center">Add Guest</Text>
                    </View>
                    <View className="flex-1 px-2">
                        <GuestCaptureForm />
                    </View>
                    <Button title="Cancel" onPress={setModalVisible} />
                </View>
            </Modal>
        // </View>
    );
};

export default AddGuestModal;
