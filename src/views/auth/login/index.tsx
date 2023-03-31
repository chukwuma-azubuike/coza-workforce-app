import React from 'react';
import { Box, FormControl, Heading, Stack, VStack, Text, Center, HStack } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { useLoginMutation } from '../../../store/services/account';
import { Formik } from 'formik';
import { LoginSchema } from '../../../utils/schemas';
import { ILoginPayload } from '../../../store/types';
import { IRegisterFormProps } from '../register/types';
import useModal from '../../../hooks/modal/useModal';
import { TouchableRipple } from 'react-native-paper';
import { AppStateContext } from '../../../../App';
import Utils from '../../../utils';
import { userActionTypes } from '../../../store/services/users';
import { versionActiontypes } from '../../../store/services/version';
import { useAppDispatch } from '../../../store/hooks';
import Logo from '../../../components/atoms/logo';
import SupportLink from '../support-link';

const Login: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const dispatch = useAppDispatch();

    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const [login, { data, error, isError, isSuccess, isLoading, status }] = useLoginMutation();

    const { setModalState } = useModal();
    const handleIconPress = () => setShowPassword(prev => !prev);

    const INITIAL_VALUES = { email: '', password: '' };

    const onSubmit = (values: ILoginPayload) => {
        login({ ...values, email: Utils.formatEmail(values.email) });
    };

    const { setIsLoggedIn } = React.useContext(AppStateContext);

    React.useEffect(() => {
        if (isError) {
            setModalState({
                defaultRender: true,
                status: error?.error ? 'error' : 'info',
                message: error?.data?.data?.message || error?.data?.message,
            });
        }
        if (isSuccess) {
            if (data) {
                dispatch({
                    type: userActionTypes.SET_USER_DATA,
                    payload: data.profile,
                });
                dispatch({
                    type: versionActiontypes.SET_HAS_LOGGED_OUT_TRUE,
                });
                Utils.storeCurrentUserData(data.profile);
                setIsLoggedIn && setIsLoggedIn(true);
            }
        }
    }, [isSuccess, isError]);

    return (
        <ViewWrapper>
            <Box w="100%" h="full" justifyContent="space-between" pb={4}>
                <VStack space="lg" pt={10} px={4}>
                    <Center>
                        <Logo />
                        <Heading mt={4}>Welcome back</Heading>
                    </Center>
                    <Box alignItems="center" w="100%">
                        <Formik<ILoginPayload>
                            validateOnChange
                            enableReinitialize
                            onSubmit={onSubmit}
                            initialValues={INITIAL_VALUES}
                            validationSchema={LoginSchema}
                        >
                            {({ errors, touched, handleChange, handleSubmit }) => {
                                return (
                                    <Stack w="100%" space={1}>
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
                                    </Stack>
                                );
                            }}
                        </Formik>
                    </Box>
                    <TouchableRipple
                        style={{ paddingHorizontal: 6, borderRadius: 10 }}
                        rippleColor="rgba(255, 255, 255, 0)"
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
                    <HStack alignItems="center" justifyContent="center">
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
                </VStack>
                <Box w="full" justifyContent="center" justifyItems="center" alignItems="center">
                    <SupportLink />
                </Box>
            </Box>
        </ViewWrapper>
    );
};

export default Login;
