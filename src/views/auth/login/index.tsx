import React from 'react';
import {
    Box,
    FormControl,
    Heading,
    Stack,
    VStack,
    Image,
    Text,
    Center,
    HStack,
} from 'native-base';
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
import { useDispatch } from 'react-redux';
import { userActionTypes } from '../../../store/services/users';
import { versionActiontypes } from '../../../store/services/version';
import useAppColorMode from '../../../hooks/theme/colorMode';
const logoWhite = require('../../../assets/images/COZA-Logo-white.png');
const logoBlack = require('../../../assets/images/COZA-Logo-black.png');

const Login: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const { isLightMode } = useAppColorMode();

    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const [login, { data, error, isError, isSuccess, isLoading, status }] =
        useLoginMutation();

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
                message: error?.data?.data?.message || error?.error,
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
            <VStack space="lg" w="100%" pt={10} px={4} justifyContent="center">
                <Center>
                    <Image
                        alt="logo"
                        style={{
                            width: 150,
                            height: 150,
                        }}
                        source={isLightMode ? logoBlack : logoWhite}
                        resizeMode="center"
                    />
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
                        {({
                            errors,
                            handleChange,
                            handleSubmit,
                        }: Pick<
                            IRegisterFormProps,
                            | 'values'
                            | 'errors'
                            | 'handleChange'
                            | 'handleSubmit'
                            | 'setFieldError'
                        >) => {
                            return (
                                <Stack w="100%" space={1}>
                                    <FormControl
                                        isRequired
                                        isInvalid={errors?.email ? true : false}
                                    >
                                        <FormControl.Label>
                                            Email
                                        </FormControl.Label>
                                        <InputComponent
                                            leftIcon={{
                                                type: 'ionicon',
                                                name: 'mail-outline',
                                            }}
                                            keyboardType="email-address"
                                            placeholder="jondoe@gmail.com"
                                            onChangeText={handleChange('email')}
                                        />
                                        <FormControl.ErrorMessage>
                                            {errors?.email}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl
                                        isRequired
                                        isInvalid={
                                            errors?.password ? true : false
                                        }
                                    >
                                        <FormControl.Label>
                                            Password
                                        </FormControl.Label>
                                        <InputComponent
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="password"
                                            isRequired
                                            leftIcon={{
                                                name: 'lock-closed-outline',
                                                type: 'ionicon',
                                            }}
                                            rightIcon={{
                                                name: showPassword
                                                    ? 'eye-off-outline'
                                                    : 'eye-outline',
                                                type: 'ionicon',
                                            }}
                                            onIconPress={handleIconPress}
                                            onChangeText={handleChange(
                                                'password'
                                            )}
                                        />
                                        <FormControl.ErrorMessage>
                                            {errors?.password}
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <ButtonComponent
                                            mt={4}
                                            isLoading={isLoading}
                                            onPress={
                                                handleSubmit as (
                                                    event: any
                                                ) => void
                                            }
                                        >
                                            Login
                                        </ButtonComponent>
                                    </FormControl>
                                </Stack>
                            );
                        }}
                    </Formik>
                </Box>
                <HStack alignItems="center" justifyContent="center">
                    <Text fontSize="md" color="gray.400">
                        Not yet registered?
                    </Text>
                    <TouchableRipple
                        style={{ paddingHorizontal: 6, borderRadius: 10 }}
                        onPress={() => navigation.navigate('Welcome')}
                    >
                        <Text
                            fontSize="md"
                            _dark={{ color: 'primary.400' }}
                            _light={{ color: 'primary.500' }}
                        >
                            Register
                        </Text>
                    </TouchableRipple>
                </HStack>
            </VStack>
        </ViewWrapper>
    );
};

export default Login;
