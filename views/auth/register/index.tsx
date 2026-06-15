import * as React from 'react';
import { SafeAreaView } from 'react-native';
import { ICountry } from 'react-native-international-phone-number';
import { router, useLocalSearchParams } from 'expo-router';
import { IRegisterPayload } from '@store/types';
import RegisterStepOne from './register-step-one';
import RegisterStepTwo from './register-step-two';
import RegisterStepThree from './register-step-three';
import RegisterStepFour from './register-step-four';
import { RegisterFormContext } from './context';

const STEPS: React.FC[] = [RegisterStepOne, RegisterStepTwo, RegisterStepThree, RegisterStepFour];

const Register: React.FC = () => {
    // OTP verification deep-links here with the verified user's known fields
    // (email, names, gender, department, ids) as route params — seed the form.
    const params = useLocalSearchParams() as unknown as Partial<IRegisterPayload>;

    const [formValues, setFormValues] = React.useState<IRegisterPayload>(
        () =>
            ({
                socialMedia: { facebook: '', instagram: '', twitter: '' },
                ...params,
            }) as IRegisterPayload
    );
    const [currentStep, setCurrentStep] = React.useState(0);
    const [phoneCountry, setPhoneCountry] = React.useState<ICountry | null>(null);
    const [nextOfKinCountry, setNextOfKinCountry] = React.useState<ICountry | null>(null);

    const totalSteps = STEPS.length;

    const goNext = React.useCallback<(values?: Partial<IRegisterPayload>) => void>(values => {
        if (values) {
            setFormValues(prev => ({ ...prev, ...values }));
        }
        setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }, [totalSteps]);

    const goBack = React.useCallback<(values?: Partial<IRegisterPayload>) => void>(values => {
        if (values) {
            setFormValues(prev => ({ ...prev, ...values }));
        }
        setCurrentStep(prev => {
            // From the first step, "Back" leaves the flow (returns to verify-email).
            if (prev === 0) {
                router.back();
                return prev;
            }
            return prev - 1;
        });
    }, []);

    const ActiveStep = STEPS[currentStep];

    return (
        <RegisterFormContext.Provider
            value={{
                formValues,
                setFormValues,
                currentStep,
                totalSteps,
                goNext,
                goBack,
                phoneCountry,
                setPhoneCountry,
                nextOfKinCountry,
                setNextOfKinCountry,
            }}
        >
            <SafeAreaView className="flex-1">
                <ActiveStep />
            </SafeAreaView>
        </RegisterFormContext.Provider>
    );
};

export default React.memo(Register);
