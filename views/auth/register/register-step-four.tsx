import { Text } from '~/components/ui/text';
import React from 'react';
import { Input } from '~/components/ui/input';
import { IRegisterFormStepFour, IRegistrationPageStep } from './types';
import { Formik, FormikConfig } from 'formik';
import { IRegisterPayload } from '@store/types';
import { RegisterSchema_4 } from '@utils/schemas';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { Label } from '~/components/ui/label';
import FormErrorMessage from '~/components/ui/error-message';
import { Button } from '~/components/ui/button';
import { versionActiontypes } from '~/store/services/version';
import { useLoginMutation, useRegisterMutation } from '~/store/services/account';
import { useAppDispatch } from '~/store/hooks';
import { storeSession } from '~/store/actions/users';
import Utils from '~/utils';
import RegisterFormContext from './context';

const RegisterStepFour: React.FC<IRegistrationPageStep> = ({ onStepPress }) => {
    if (!RegisterFormContext) return;

    const dispatch = useAppDispatch();
    const { formValues, setFormValues } = React.useContext(RegisterFormContext);

    const onGoback = (values: IRegisterFormStepFour) => () => {
        setFormValues(prev => {
            return { ...prev, ...values };
        });

        onStepPress(2);
    };

    const [register, { isLoading: registerIsLoading }] = useRegisterMutation();
    const [login, { isLoading: loginIsLoading }] = useLoginMutation();

    const onSubmit: FormikConfig<IRegisterFormStepFour>['onSubmit'] = async values => {
        try {
            delete formValues.confirmPassword;
            delete formValues.departmentName;

            const response = await register({ ...formValues, password: values.password });

            if ('data' in response) {
                const loginResponse = await login({
                    password: values.password,
                    email: Utils.formatEmail(formValues.email),
                });

                if ('data' in loginResponse) {
                    dispatch(storeSession(loginResponse.data as any));
                }

                if ('error' in loginResponse) {
                    Alert.alert((loginResponse?.error as any)?.data?.message || loginResponse?.error);
                }
            }

            if ('error' in response) {
                Alert.alert((response?.error as any)?.data?.message || response?.error);
            }
        } catch (error) {
            Alert.alert('Oops, something went wrong!');
        }
    };

    React.useEffect(() => {
        dispatch({
            type: versionActiontypes.SET_HAS_LOGGED_OUT_TRUE,
        });
    }, []);

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-4 gap-8 pt-8">
                    <Text className="text-3xl font-bold">Password</Text>
                    <View className="items-center w-full flex-1">
                        <Formik<IRegisterFormStepFour>
                            onSubmit={onSubmit}
                            validateOnMount={false}
                            validationSchema={RegisterSchema_4}
                            initialValues={formValues as IRegisterPayload}
                        >
                            {({
                                errors,
                                values,
                                touched,
                                isValid,
                                handleBlur,
                                validateForm,
                                handleChange,
                                setFieldError,
                                setFieldTouched,
                                ...props
                            }) => {
                                return (
                                    <View className="w-full gap-4 flex-1 justify-between">
                                        <ScrollView className="w-full gap-3 flex-1">
                                            <View className="w-full gap-3">
                                                <View className="gap-1">
                                                    <Label>Password</Label>
                                                    <Input
                                                        isPassword
                                                        value={values.password}
                                                        placeholder="Enter your password"
                                                        onBlur={handleBlur('password')}
                                                        onChangeText={handleChange('password')}
                                                    />
                                                    {!!errors?.password && !!touched?.password && (
                                                        <FormErrorMessage>{errors?.password}</FormErrorMessage>
                                                    )}
                                                </View>

                                                <View className="gap-1">
                                                    <Label>Confirm password</Label>
                                                    <Input
                                                        isPassword
                                                        value={values.confirmPassword}
                                                        placeholder="Confirm your password"
                                                        onBlur={handleBlur('confirmPassword')}
                                                        onChangeText={handleChange('confirmPassword')}
                                                    />
                                                    {!!errors?.confirmPassword && !!touched?.confirmPassword && (
                                                        <FormErrorMessage>{errors?.confirmPassword}</FormErrorMessage>
                                                    )}
                                                </View>
                                            </View>
                                        </ScrollView>
                                        <View className="w-full flex-row gap-4 mb-4">
                                            <Button variant="outline" className="flex-1" onPress={onGoback(values)}>
                                                Back
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                disabled={!isValid}
                                                onPress={() => {
                                                    onSubmit(values, props as any);
                                                }}
                                                isLoading={registerIsLoading || loginIsLoading}
                                                loadingText={registerIsLoading ? 'Registering...' : 'Logging in...'}
                                            >
                                                Register
                                            </Button>
                                        </View>
                                    </View>
                                );
                            }}
                        </Formik>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(RegisterStepFour);
