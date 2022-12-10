import { IRegisterPayload } from '../../../store/types';
import { FormikErrors, FormikHelpers } from 'formik';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

interface IRegisterFormProps {
    handleChange: any;
    validateField: (value: any) => void;
    handleSubmit: (
        values: IRegisterPayload,
        formikHelpers: FormikHelpers<IRegisterPayload>
    ) => void;
    errors: FormikErrors<IRegisterPayload>;
    handlePressFoward: (
        fields: string[],
        values: any,
        onStepPress: (step: number) => void,
        target: number,
        setFieldError: (field: string, errorMsg: string) => void
    ) => void;
    values: IRegisterPayload & {
        confirmPassword?: string;
        departmentName?: string;
    };
    setFieldError: (field: string, errorMsg: string) => void;
    isLoading?: boolean;
}

interface IRegistrationPageStep extends IRegisterFormProps {
    setFieldValue: (fieldName: string, value: any) => void;
    onStepPress: (step: number) => void;
    navigation?: NativeStackNavigationProp<ParamListBase, string, undefined>;
}

export type { IRegisterFormProps, IRegistrationPageStep };