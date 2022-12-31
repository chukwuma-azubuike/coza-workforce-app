/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import RegisterStepFour from './register-step-four';
import RegisterStepOne from './register-step-one';
import RegisterStepThree from './register-step-three';
import RegisterStepTwo from './register-step-two';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Stepper, {
    IRegisterPagesProps,
} from '../../../components/composite/stepper';
import { ILoginPayload, IRegisterPayload } from '../../../store/types';
import { Formik } from 'formik';
import { RegisterSchema } from '../../../utils/schemas';
import { IRegisterFormProps } from './types';
import { handlePressFoward } from './helpers';
import {
    useRegisterMutation,
    useLoginMutation,
} from '../../../store/services/account';
import useModal from '../../../hooks/modal/useModal';
import { AppStateContext } from '../../../../App';
import Utils from '../../../utils';

const PAGES: IRegisterPagesProps[] = [
    { label: 'Personal', component: RegisterStepOne },
    { label: 'Others', component: RegisterStepTwo },
    { label: 'Social', component: RegisterStepThree },
    { label: 'Password', component: RegisterStepFour },
];

const Register: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
    route: { params },
}) => {
    const [loginValues, setLoginValues] = React.useState<ILoginPayload>();
    const [register, { error, isError, isSuccess, isLoading }] =
        useRegisterMutation();

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

    const handleSubmit = (
        values: IRegisterPayload & {
            confirmPassword?: string;
            departmentName?: string;
        }
    ) => {
        delete values.confirmPassword;
        delete values.departmentName;

        register(values);
        setLoginValues({ password: values.password, email: values.email });
    };

    const { setIsLoggedIn } = React.useContext(AppStateContext);

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (isSuccess) {
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

        if (isError) {
            setModalState({
                message: `${error?.data?.message}`,
                defaultRender: true,
                status: 'error',
            });
        }
    }, [isSuccess, isError]);

    React.useEffect(() => {
        if (loginIsError) {
            setModalState({
                defaultRender: true,
                status: error?.error ? 'error' : 'info',
                message: error?.data?.data?.message || error?.error,
            });
        }
        if (loginIsSuccess) {
            if (loginData) {
                Utils.storeCurrentUserData(loginData.profile);
                setIsLoggedIn && setIsLoggedIn(true);
            }
        }
    }, [loginIsError, loginIsSuccess]);

    const INITIAL_VALUES = params as IRegisterPayload;

    return (
        <Formik<IRegisterPayload>
            validateOnChange
            enableReinitialize
            onSubmit={handleSubmit}
            initialValues={INITIAL_VALUES}
            validationSchema={RegisterSchema}
        >
            {(props: IRegisterFormProps) => (
                <Stepper
                    disableSwipe
                    pages={PAGES}
                    navigation={navigation}
                    otherProps={{
                        ...props,
                        isLoading,
                        loginIsLoading,
                        handlePressFoward,
                    }}
                />
            )}
        </Formik>
    );
};

export default Register;
