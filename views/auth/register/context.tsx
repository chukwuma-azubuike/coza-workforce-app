import * as React from 'react';
import { IRegisterPayload } from '@store/types';
import { ICountry } from 'react-native-international-phone-number';

export interface IRegisterContext {
    formValues: IRegisterPayload;
    setFormValues: React.Dispatch<React.SetStateAction<IRegisterPayload>>;

    /** Zero-based index of the step currently on screen. */
    currentStep: number;
    /** Total number of steps in the flow. */
    totalSteps: number;
    /** Persist `values` and advance one step (or submit on the last step). */
    goNext: (values?: Partial<IRegisterPayload>) => void;
    /** Persist `values` and go back one step (or leave the flow from step 0). */
    goBack: (values?: Partial<IRegisterPayload>) => void;

    /**
     * The country selected in the phone inputs is kept here so it survives
     * back/forward navigation — the raw national number lives in `formValues`
     * and is only converted to E.164 at final submission.
     */
    phoneCountry: ICountry | null;
    setPhoneCountry: (country: ICountry | null) => void;
    nextOfKinCountry: ICountry | null;
    setNextOfKinCountry: (country: ICountry | null) => void;
}

export const RegisterFormContext = React.createContext<IRegisterContext>({} as IRegisterContext);

export const useRegisterForm = () => React.useContext(RegisterFormContext);

export default RegisterFormContext;
