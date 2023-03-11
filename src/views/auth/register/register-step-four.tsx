import React from 'react';
import { Box, Center, FormControl, Heading, HStack, Stack, VStack } from 'native-base';
import { InputComponent } from '../../../components/atoms/input';
import ButtonComponent from '../../../components/atoms/button';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IRegistrationPageStep } from './types';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../../config/appConfig';
import { Formik } from 'formik';
import { ILoginPayload, IRegisterPayload } from '../../../store/types';
import { RegisterFormContext } from '.';
import { RegisterSchema_4 } from '../../../utils/schemas';
import { useLoginMutation, useRegisterMutation } from '../../../store/services/account';
import { useAppDispatch } from '../../../store/hooks';
import { AppStateContext } from '../../../../App';
import useModal from '../../../hooks/modal/useModal';
import { versionActiontypes } from '../../../store/services/version';
import Utils from '../../../utils';
import { useNavigation } from '@react-navigation/native';
import { userActionTypes } from '../../../store/services/users';

const RegisterStepFour: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const { navigate } = useNavigation();

    const { formValues, setFormValues } = React.useContext(RegisterFormContext);

    const handleIconPress = () => setShowPassword(prev => !prev);
    const handleBackPress = () => onStepPress(2);

    const [loginValues, setLoginValues] = React.useState<ILoginPayload>();
    const [
        register,
        { error: registerError, isError: isRegisterError, isSuccess: registerIsSuccess, isLoading: registerIsLoading },
    ] = useRegisterMutation();

    const [
        login,
        {
            data: loginData,
            error: loginError,
            isError: loginIsError,
            isSuccess: loginIsSuccess,
            isLoading: loginIsLoading,
        },
    ] = useLoginMutation();

    const onSubmit = (values: IRegisterPayload) => {
        delete values.confirmPassword;
        delete values.departmentName;

        register(values);
        setLoginValues({ password: values.password, email: values.email });
    };

    interface GIn {
        address: 'Iju';
        birthDay: '2023-03-15T13:39:00.000Z';
        campusId: '6361a285832e7fbd65897cb7';
        departmentId: '639cde4ff520b583761aed5b';
        email: 'ranechopro@gmail.com';
        firstName: 'Chukwuma';
        gender: undefined;
        lastName: 'Azubuike';
        maritalStatus: 'married';
        nextOfKin: 'Chimps';
        nextOfKinPhoneNo: '+2347036215474';
        occupation: 'Engineer';
        password: 'Far2kind/';
        phoneNumber: '+2347036215474';
        placeOfWork: 'Toptal';
        roleId: '638a5f1e8eb1e1ef2b0be2a7';
        socialMedia: { facebook: 'Okay'; instagram: 'Plain'; twitter: 'Naaa' };
    }

    const dispatch = useAppDispatch();

    const { setIsLoggedIn, isLoggedIn } = React.useContext(AppStateContext);

    const { setModalState } = useModal();

    React.useEffect(() => {
        dispatch({
            type: versionActiontypes.SET_HAS_LOGGED_OUT_TRUE,
        });
    }, []);

    React.useEffect(() => {
        if (registerIsSuccess) {
            setModalState({
                message: 'Registration successful',
                defaultRender: true,
                status: 'success',
            });

            loginValues &&
                login({
                    email: Utils.formatEmail(loginValues.email),
                    password: loginValues.password,
                });
        }

        if (isRegisterError) {
            setModalState({
                message: `${registerError?.data?.message}`,
                defaultRender: true,
                status: 'error',
            });
            navigate('Login' as never);
        }
    }, [registerIsSuccess, isRegisterError]);

    React.useEffect(() => {
        if (loginIsError) {
            setModalState({
                defaultRender: true,
                status: loginError?.error ? 'error' : 'info',
                message: loginError?.data?.data?.message || loginError?.error,
            });
        }
        if (loginIsSuccess) {
            if (loginData) {
                dispatch({
                    type: userActionTypes.SET_USER_DATA,
                    payload: loginData.profile,
                });
                Utils.storeCurrentUserData(loginData.profile);
                setIsLoggedIn && setIsLoggedIn(true);
            }
        }
    }, [loginIsError, loginIsSuccess]);

    return (
        <ViewWrapper>
            <Center flex={1}>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Heading textAlign="left">Create a password</Heading>
                    <Box alignItems="center" w="100%">
                        <Stack w="100%" space={1}>
                            <Formik<IRegisterPayload>
                                onSubmit={onSubmit}
                                validationSchema={RegisterSchema_4}
                                initialValues={formValues as IRegisterPayload}
                            >
                                {({ handleChange, errors, validateForm, values, submitForm }) => {
                                    const handleContinuePress = () => {
                                        validateForm()
                                            .then(e => {
                                                if (Object.keys(e).length === 0) {
                                                    setFormValues(prev => {
                                                        return { ...prev, ...values };
                                                    });
                                                }
                                            })
                                            .then(() => {
                                                submitForm();
                                            });
                                    };

                                    return (
                                        <>
                                            <FormControl isRequired isInvalid={errors?.password ? true : false}>
                                                <FormControl.Label>Password</FormControl.Label>
                                                <InputComponent
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="password"
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
                                                <FormControl.ErrorMessage
                                                    fontSize="2xl"
                                                    mt={3}
                                                    leftIcon={
                                                        <Icon
                                                            size={16}
                                                            name="warning"
                                                            type="antdesign"
                                                            color={THEME_CONFIG.error}
                                                        />
                                                    }
                                                >
                                                    {errors?.password}
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl isRequired isInvalid={!!errors?.confirmPassword}>
                                                <FormControl.Label>Confirm password</FormControl.Label>
                                                <InputComponent
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Repeat password"
                                                    leftIcon={{
                                                        name: 'lock-closed-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    rightIcon={{
                                                        name: showPassword ? 'eye-off-outline' : 'eye-outline',
                                                        type: 'ionicon',
                                                    }}
                                                    onIconPress={handleIconPress}
                                                    onChangeText={handleChange('confirmPassword')}
                                                />
                                                <FormControl.ErrorMessage
                                                    fontSize="2xl"
                                                    mt={3}
                                                    leftIcon={
                                                        <Icon
                                                            size={16}
                                                            name="warning"
                                                            type="antdesign"
                                                            color={THEME_CONFIG.error}
                                                        />
                                                    }
                                                >
                                                    {errors?.confirmPassword}
                                                </FormControl.ErrorMessage>
                                            </FormControl>
                                            <FormControl>
                                                <HStack space={4} w="95%" justifyContent="space-between">
                                                    <ButtonComponent
                                                        onPress={handleBackPress}
                                                        width="1/2"
                                                        secondary
                                                        mt={4}
                                                    >
                                                        Go back
                                                    </ButtonComponent>
                                                    <ButtonComponent
                                                        isLoading={registerIsLoading || loginIsLoading}
                                                        isLoadingText={
                                                            loginIsLoading ? 'Logging in...' : 'Signing up...'
                                                        }
                                                        onPress={handleContinuePress}
                                                        width="1/2"
                                                        mt={4}
                                                    >
                                                        Register
                                                    </ButtonComponent>
                                                </HStack>
                                            </FormControl>
                                        </>
                                    );
                                }}
                            </Formik>
                        </Stack>
                    </Box>
                </VStack>
            </Center>
        </ViewWrapper>
    );
};

export default RegisterStepFour;
