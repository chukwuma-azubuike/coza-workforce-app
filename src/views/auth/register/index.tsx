/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import RegisterStepFour from './register-step-four';
import RegisterStepOne from './register-step-one';
import RegisterStepThree from './register-step-three';
import RegisterStepTwo from './register-step-two';
import {
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Stepper, {
    IRegisterPagesProps,
} from '../../../components/composite/stepper';
import { IAuthParams, IRegister } from '../../../store/types';
import { Formik, FormikHelpers } from 'formik';

const PAGES: IRegisterPagesProps[] = [
    { label: 'Personal', component: RegisterStepOne },
    { label: 'Others', component: RegisterStepTwo },
    { label: 'Social', component: RegisterStepThree },
    { label: 'Password', component: RegisterStepFour },
];

interface IRegisterFormProps {
    handleChange: any;
    handleSubmit: (
        values: IAuthParams,
        formikHelpers: FormikHelpers<IAuthParams>
    ) => void;
    values: any;
}

const INITIAL_VALUES: IRegister = {
    firstName: 'James',
    lastName: 'Bosco',
    password: '',
    email: 'james_bosco@gmail.com',
    phoneNumber: '+234705646565',
    address: 'No 18 Felix Crescent',
    department: {
        name: 'Witty Inventions',
        id: 'jbwef87829hasd99kk',
    },
    nextOfKin: {
        name: 'John Bosco',
        phoneNumber: '+2349098138388',
    },
    occupation: 'Principal Engineer',
    placeOfWork: 'Canonical Ent.',
    gender: 'M',
    maritalStatus: 'married',
    socialMedia: {
        facebook: '@jon_bosco',
        instagram: '@jon_bosco',
        twitter: '@jon_bosco',
    },
    birthDay: '01-02-1990',
    pictureUrl: 'hhdiinn@mial.com',
};

export interface IRegistrationPageStep {
    values: any;
    handleChange: any;
    handleSubmit: any;
    onStepPress: (step: number) => void;
    navigation?: NativeStackNavigationProp<ParamListBase, string, undefined>;
}

const Register: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handleSubmit = (
        values: IAuthParams,
        formikHelpers: FormikHelpers<IAuthParams>
    ) => {
        console.log(values);
    };

    return (
        <Formik<IRegister>
            validateOnChange
            enableReinitialize
            onSubmit={handleSubmit}
            initialValues={INITIAL_VALUES}
        >
            {({ handleChange, handleSubmit, values }: IRegisterFormProps) => (
                <Stepper
                    pages={PAGES}
                    navigation={navigation}
                    otherProps={{ handleChange, handleSubmit, values }}
                />
            )}
        </Formik>
    );
};

export default Register;
