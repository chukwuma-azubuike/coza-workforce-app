import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik, FormikConfig } from 'formik';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import FormErrorMessage from '~/components/ui/error-message';
import { THEME_CONFIG } from '~/config/appConfig';
import { RegisterSchema_4 } from '@utils/schemas';
import { useLoginMutation, useRegisterMutation } from '~/store/services/account';
import { versionActiontypes } from '~/store/services/version';
import { useAppDispatch } from '~/store/hooks';
import { storeSession } from '~/store/actions/users';
import Utils from '~/utils';
import formatToE164 from '~/utils/formatToE164';
import { IRegisterFormStepFour } from './types';
import { useRegisterForm } from './context';
import RegisterStepLayout from './components/register-step-layout';
import PasswordRequirements from './components/password-requirements';

/** Pull a human-readable message out of an RTK Query error in any shape. */
const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
    const data = (error as any)?.data;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.filter(Boolean).join('\n');
    if (typeof data === 'string') return data;
    if (typeof (error as any)?.error === 'string') return (error as any).error;
    return fallback;
};

const RegisterStepFour: React.FC = () => {
    const dispatch = useAppDispatch();
    const { formValues, goBack, phoneCountry, nextOfKinCountry } = useRegisterForm();

    const [register, { isLoading: registerIsLoading }] = useRegisterMutation();
    const [login, { isLoading: loginIsLoading }] = useLoginMutation();

    const [submitError, setSubmitError] = React.useState<string | null>(null);

    React.useEffect(() => {
        dispatch({ type: versionActiontypes.SET_HAS_LOGGED_OUT_TRUE });
    }, []);

    const onSubmit: FormikConfig<IRegisterFormStepFour>['onSubmit'] = async values => {
        setSubmitError(null);

        const email = Utils.formatEmail(formValues.email);

        // Build a clean payload — never mutate the shared context object — and
        // convert both phone numbers to E.164 exactly once, here.
        const { confirmPassword, departmentName, ...rest } = formValues as any;
        const payload = {
            ...rest,
            email,
            password: values.password,
            phoneNumber: formatToE164(formValues.phoneNumber, phoneCountry?.callingCode),
            nextOfKinPhoneNo: formatToE164(formValues.nextOfKinPhoneNo, nextOfKinCountry?.callingCode),
        };

        const tryLogin = async (): Promise<boolean> => {
            const loginResponse = await login({ email, password: values.password });
            if ('data' in loginResponse) {
                dispatch(storeSession(loginResponse.data as any));
                return true;
            }
            setSubmitError(
                getErrorMessage(
                    (loginResponse as any).error,
                    'Your account was created, but we could not sign you in. Please try logging in manually.'
                )
            );
            return false;
        };

        try {
            const response = await register(payload);

            if ('data' in response) {
                await tryLogin();
                return;
            }

            const message = getErrorMessage((response as any).error);
            // Recover from a half-finished previous attempt (account created but
            // login failed) instead of dead-ending on "email already exists".
            if (/exist|already|registered/i.test(message)) {
                const loggedIn = await tryLogin();
                if (loggedIn) return;
            }
            setSubmitError(message);
        } catch {
            setSubmitError('Oops, something went wrong. Please try again.');
        }
    };

    const isSubmitting = registerIsLoading || loginIsLoading;

    return (
        <Formik<IRegisterFormStepFour>
            onSubmit={onSubmit}
            validateOnMount
            validationSchema={RegisterSchema_4}
            initialValues={formValues as IRegisterFormStepFour}
        >
            {({ errors, values, touched, isValid, handleBlur, handleChange, handleSubmit }) => (
                <RegisterStepLayout
                    title="Secure your account"
                    subtitle="Create a password to finish setting up your account."
                    footer={
                        <View className="w-full flex-row gap-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                                onPress={() => goBack(values)}
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={!isValid || isSubmitting}
                                isLoading={isSubmitting}
                                loadingText={registerIsLoading ? 'Registering...' : 'Signing in...'}
                                onPress={handleSubmit as () => void}
                            >
                                Register
                            </Button>
                        </View>
                    }
                >
                    <View className="w-full gap-4">
                        <View className="gap-1">
                            <Label>Password</Label>
                            <Input
                                isPassword
                                value={values.password}
                                placeholder="Enter your password"
                                onBlur={handleBlur('password')}
                                onChangeText={handleChange('password')}
                            />
                        </View>

                        <PasswordRequirements value={values.password} />

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

                        {!!submitError && (
                            <View className="flex-row items-start gap-2 rounded-2xl bg-destructive/10 p-3">
                                <Ionicons name="alert-circle" size={20} color={THEME_CONFIG.error} />
                                <Text className="flex-1 text-sm text-destructive">{submitError}</Text>
                            </View>
                        )}
                    </View>
                </RegisterStepLayout>
            )}
        </Formik>
    );
};

export default React.memo(RegisterStepFour);
