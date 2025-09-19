import React from 'react';
import { FormControl, Heading, Text, Center, HStack } from 'native-base';
import { InputComponent } from '@components/atoms/input';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '@components/atoms/button';
import ViewWrapper from '@components/layout/viewWrapper';
import { useLoginMutation } from '@store/services/account';
import { Formik } from 'formik';
import { LoginSchema } from '@utils/schemas';
import { ILoginPayload, IUser } from '@store/types';
import useModal from '@hooks/modal/useModal';
import { TouchableRipple } from 'react-native-paper';
import { AppStateContext } from '../../../../App';
import Utils from '@utils/index';
import { userActionTypes } from '@store/services/users';
import { versionActiontypes } from '@store/services/version';
import { useAppDispatch } from '@store/hooks';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import { View } from 'react-native';
import VStackComponent from '@components/layout/v-stack';
import { ScreenHeight } from '@rneui/base';

const Login: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const dispatch = useAppDispatch();

    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const [login, { data, isLoading }] = useLoginMutation();

    const { setModalState } = useModal();
    const handleIconPress = () => setShowPassword(prev => !prev);

    const INITIAL_VALUES = { email: '', password: '' };

    const onSubmit = async (values: ILoginPayload) => {
        const response = await login({ ...values, email: Utils.formatEmail(values.email) });

        if ('error' in response) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: (response?.error as any)?.data?.message || (response as any)?.data?.message,
            });
        }

        if ('data' in response) {
            dispatch({
                type: userActionTypes.SET_USER_DATA,
                payload: response?.data?.profile,
            });
            dispatch({
                type: versionActiontypes.SET_HAS_LOGGED_OUT_TRUE,
            });
            await Utils.storeCurrentUserData(response?.data?.profile as IUser);

            setIsLoggedIn && setIsLoggedIn(true);
        }
    };

    const { setIsLoggedIn } = React.useContext(AppStateContext);

    return (
        <ViewWrapper scroll>
            <View
                style={{
                    flex: 1,
                    paddingTop: 100,
                    height: ScreenHeight,
                }}
            >
                <VStackComponent style={{ paddingHorizontal: 8 }}>
                    <Center>
                        <Logo />
                        <Heading mt={4}>Welcome back</Heading>
                    </Center>
                    <Formik<ILoginPayload>
                        validateOnChange
                        onSubmit={onSubmit}
                        initialValues={INITIAL_VALUES}
                        validationSchema={LoginSchema}
                    >
                        {({ errors, touched, handleChange, handleSubmit }) => {
                            return (
                                <VStackComponent style={{ flex: 0, marginBottom: 20 }} space={4}>
                                    <FormControl isRequired isInvalid={!!errors?.email && touched.email}>
                                        <FormControl.Label>Email</FormControl.Label>
                                        <InputComponent
                                            leftIcon={{
                                                type: 'ionicon',
                                                name: 'mail-outline',
                                            }}
                                            keyboardType="email-address"
                                            placeholder="jondoe@gmail.com"
                                            onChangeText={handleChange('email')}
                                        />
                                        <FormControl.ErrorMessage>{errors?.email}</FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl isRequired isInvalid={!!errors?.password && touched.password}>
                                        <FormControl.Label>Password</FormControl.Label>
                                        <InputComponent
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="password"
                                            isRequired
                                            leftIcon={{
                                                name: 'lock-closed-outline',
                                                type: 'ionicon',
                                            }}
                                            rightIcon={{
                                                name: showPassword ? 'eye-off-outline' : 'eye-outline',
                                                type: 'ionicon',
                                            }}
                                            onIconPress={handleIconPress}
                                            onChangeText={handleChange('password')}
                                        />
                                        <FormControl.ErrorMessage>{errors?.password}</FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <ButtonComponent
                                            mt={4}
                                            isLoading={isLoading}
                                            onPress={handleSubmit as (event: any) => void}
                                        >
                                            Login
                                        </ButtonComponent>
                                    </FormControl>
                                </VStackComponent>
                            );
                        }}
                    </Formik>
                    <TouchableRipple
                        rippleColor="rgba(255, 255, 255, 0)"
                        style={{ paddingHorizontal: 6, borderRadius: 10 }}
                        onPress={() => navigation.navigate('Forgot Password')}
                    >
                        <Text
                            fontSize="md"
                            _dark={{ color: 'primary.400' }}
                            _light={{ color: 'primary.500' }}
                            textAlign="center"
                        >
                            Forgot Password?
                        </Text>
                    </TouchableRipple>
                    <HStack alignItems="center" justifyContent="center" padding={0}>
                        <Text fontSize="md" color="gray.400">
                            Not yet registered?
                        </Text>
                        <TouchableRipple
                            style={{ paddingHorizontal: 6, borderRadius: 10 }}
                            onPress={() => navigation.navigate('Verify Email')}
                        >
                            <Text fontSize="md" _dark={{ color: 'primary.400' }} _light={{ color: 'primary.500' }}>
                                Register
                            </Text>
                        </TouchableRipple>
                    </HStack>
                </VStackComponent>
            </View>
            <View
                style={{
                    bottom: 40,
                    width: '100%',
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <SupportLink />
            </View>
        </ViewWrapper>
    );
};

export default React.memo(Login);
