import React from 'react';
import {
    FormControl,
    Heading,
    Modal,
    Spinner,
    Text,
    VStack,
} from 'native-base';
import { Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { InputComponent } from '../../../components/atoms/input';
import ModalAlertComponent from '../../../components/composite/modal-alert';

const cozaIcon = require('../../../assets/images/COZA-Logo-black.png');

const AuthHome: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [success, setSuccess] = React.useState<boolean>(false);


    const handleClick = () => {
        setModalVisible(true);
    };

    const handleChange = (e: string) => {
        if (e.length === 6) {
            // Api call
            setLoading(true);
        }
    };

    React.useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
            }, 2000);
            setTimeout(() => {
                navigation.navigate('RegisterStepOne');
            }, 4000);
            setTimeout(() => {
                setSuccess(false);
            }, 6000);
        }
    }, [loading]);

    return (
        <>
            <ViewWrapper>
                <VStack
                    p={6}
                    py={20}
                    space={6}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Image
                        style={{
                            width: 150,
                            height: 150,
                        }}
                        source={cozaIcon}
                        resizeMode="center"
                    />
                    <Heading size="lg">COZA Workforce App</Heading>
                    <Text color="primary.50">
                        Workers to Gather | Together | To get there
                    </Text>
                    <FormControl>
                        <VStack space={1}>
                            <FormControl.Label>Email</FormControl.Label>
                            <InputComponent
                                placeholder="jondoe@gmail.com"
                                leftIcon={{
                                    name: 'mail-outline',
                                    type: 'ionicons',
                                }}
                                isRequired
                            />
                            <ButtonComponent mt={4} onPress={handleClick}>
                                Continue
                            </ButtonComponent>
                        </VStack>
                    </FormControl>
                </VStack>
            </ViewWrapper>
            <Modal
                onClose={() => setModalVisible(false)}
                isOpen={modalVisible}
                avoidKeyboard
                size="xl"
            >
                <Modal.Content minW={200} backgroundColor="gray.200">
                    <Modal.Body>
                        {loading ? (
                            <Spinner size="lg" />
                        ) : success ? (
                            <ModalAlertComponent
                                description="You can now continue your registration"
                                iconName="checkmark-circle"
                                iconType="ionicon"
                                status="success"
                            />
                        ) : (
                            <>
                                <FormControl.Label>OTP code</FormControl.Label>
                                <InputComponent
                                    maxLength={6}
                                    onChangeText={handleChange}
                                />
                            </>
                        )}
                    </Modal.Body>
                </Modal.Content>
            </Modal>
        </>
    );
};

export default AuthHome;
