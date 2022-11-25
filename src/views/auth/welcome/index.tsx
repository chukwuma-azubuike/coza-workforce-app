import React from 'react';
import { FormControl, Heading, Modal, Text, VStack } from 'native-base';
import { Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { InputComponent } from '../../../components/atoms/input';
import ModalAlertComponent from '../../../components/composite/modal-alert';
import OTPInput from '../../../components/atoms/otp-input';

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

    React.useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
            }, 2000);
            setTimeout(() => {
                navigation.navigate('Register');
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
                    <Text color="gray.400">
                        Workers to Gather | Together | To get there
                    </Text>
                    <FormControl>
                        <VStack space={1}>
                            <FormControl.Label>Email</FormControl.Label>
                            <InputComponent
                                placeholder="jondoe@gmail.com"
                                leftIcon={{
                                    name: 'mail-outline',
                                    type: 'ionicon',
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
                        <OTPInput
                            render={
                                success ? (
                                    <ModalAlertComponent
                                        description="You can now continue your registration"
                                        iconName="checkmark-circle"
                                        iconType="ionicon"
                                        status="success"
                                    />
                                ) : null
                            }
                            done={success}
                            loading={loading}
                            successCallBack={setLoading}
                        />
                    </Modal.Body>
                </Modal.Content>
            </Modal>
        </>
    );
};

export default AuthHome;
