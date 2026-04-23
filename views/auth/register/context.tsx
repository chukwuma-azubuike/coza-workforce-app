import * as React from 'react';
import { IRegisterPayload } from '@store/types';

export interface IRegisterContext {
    formValues: IRegisterPayload;
    setFormValues: React.Dispatch<React.SetStateAction<IRegisterPayload>>;
}

export const RegisterFormContext = React.createContext<IRegisterContext>({} as IRegisterContext);

export default RegisterFormContext;
