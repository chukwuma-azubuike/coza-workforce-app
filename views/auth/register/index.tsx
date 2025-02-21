import * as React from 'react';
import RegisterStepFour from './register-step-four';
import RegisterStepOne from './register-step-one';
import RegisterStepThree from './register-step-three';
import RegisterStepTwo from './register-step-two';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Stepper, { IRegisterPagesProps } from '@components/composite/stepper';
import { IRegisterPayload } from '@store/types';

const PAGES: IRegisterPagesProps[] = [
    { label: 'Personal', component: RegisterStepOne },
    { label: 'Others', component: RegisterStepTwo },
    { label: 'Social', component: RegisterStepThree },
    { label: 'Password', component: RegisterStepFour },
];

export interface IRegisterContext {
    formValues: IRegisterPayload;
    setFormValues: React.Dispatch<React.SetStateAction<IRegisterPayload>>;
}

export const RegisterFormContext = React.createContext<IRegisterContext>({} as IRegisterContext);

const Register: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route: { params } }) => {
    const INITIAL_VALUES = params as IRegisterPayload;

    const [formValues, setFormValues] = React.useState<IRegisterPayload>(INITIAL_VALUES);

    return (
        <RegisterFormContext.Provider value={{ formValues, setFormValues }}>
            <Stepper disableSwipe pages={PAGES} navigation={navigation} />
        </RegisterFormContext.Provider>
    );
};

export default React.memo(Register);
