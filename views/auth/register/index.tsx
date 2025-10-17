import * as React from 'react';
import RegisterStepFour from './register-step-four';
import RegisterStepOne from './register-step-one';
import RegisterStepThree from './register-step-three';
import RegisterStepTwo from './register-step-two';
import Stepper, { IRegisterPagesProps } from '@components/composite/stepper';
import { IRegisterPayload } from '@store/types';
import { router, useLocalSearchParams } from 'expo-router';
import { RegisterFormContext } from './context';

const PAGES: IRegisterPagesProps[] = [
    { label: 'Personal', component: RegisterStepOne },
    { label: 'Others', component: RegisterStepTwo },
    { label: 'Social', component: RegisterStepThree },
    { label: 'Password', component: RegisterStepFour },
];

const Register: React.FC = () => {
    const INITIAL_VALUES = useLocalSearchParams() as unknown as IRegisterPayload;

    const [formValues, setFormValues] = React.useState<IRegisterPayload>(INITIAL_VALUES);

    return (
        <RegisterFormContext.Provider value={{ formValues, setFormValues }}>
            <Stepper disableSwipe pages={PAGES} navigation={router} />
        </RegisterFormContext.Provider>
    );
};

export default React.memo(Register);
