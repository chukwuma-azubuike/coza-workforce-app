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
import { IRegisterPayload } from '../../../store/types';
import { Formik } from 'formik';
import { RegisterSchema } from '../../../utils/schemas';
import { IRegisterFormProps } from './types';
import { handlePressFoward } from './helpers';
import { useRegisterMutation } from '../../../store/services/auth';
import useModal from '../../../hooks/modal/useModal';
import ModalAlertComponent from '../../../components/composite/modal-alert';

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
    const [register, { error, isError, isSuccess, isLoading }] =
        useRegisterMutation();

    const handleSubmit = (
        values: IRegisterPayload & {
            confirmPassword?: string;
            departmentName?: string;
        }
    ) => {
        delete values.confirmPassword;
        delete values.departmentName;

        register(values);
    };

    const { setModalState } = useModal();

    React.useEffect(() => {
        if (isSuccess) {
            setModalState({
                duration: 4,
                render: (
                    <ModalAlertComponent
                        description="Registration successful"
                        iconName="checkmark-circle"
                        iconType="ionicon"
                        status="success"
                    />
                ),
            });
            setTimeout(() => {
                navigation.navigate('Login');
            }, 5000);
        }
        if (isError) {
            setModalState({
                duration: 4,
                render: (
                    <ModalAlertComponent
                        description={`${error?.data?.message}`}
                        iconType="feather"
                        iconName="info"
                        status="error"
                    />
                ),
            });
        }
    }, [isSuccess]);

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
                    otherProps={{ ...props, handlePressFoward, isLoading }}
                />
            )}
        </Formik>
    );
};

export default Register;
