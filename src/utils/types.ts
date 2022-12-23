import { FormikErrors, FormikHelpers } from 'formik';

type IIconTypes =
    | 'material'
    | 'material-community'
    | 'font-awesome'
    | 'octicon'
    | 'ionicon'
    | 'foundation'
    | 'evilicon'
    | 'simple-line-icon'
    | 'zocial'
    | 'entypo'
    | 'feather'
    | 'antdesign';

interface IFormikDefaultHOCProps<P> {
    values: P;
    errors: FormikErrors<P>;
    handleChange: (key: any) => void;
    validateField: (value: any) => void;
    setFieldError: (field: string, errorMsg: string) => void;
    handleSubmit: (values: P, formikHelpers: FormikHelpers<P>) => void;
}

export type { IIconTypes, IFormikDefaultHOCProps };
