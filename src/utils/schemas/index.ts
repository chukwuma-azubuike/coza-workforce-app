import * as Yup from 'yup';
import 'yup-phone-lite';

// Form validation

export const EmailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email'),
});

export const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('Your first name is required.'),
    lastName: Yup.string().required('Your last name is required.'),
    address: Yup.string().required('Your home address is required.'),
    phoneNumber: Yup.string()
        .phone('NG', 'Please enter a valid NG phone number')
        .required('A phone number is required'),
    email: Yup.string().required('Your email is required.'),
    departmentId: Yup.string(),
    campusId: Yup.string(),
    roleId: Yup.string(),
    nextOfKin: Yup.string().required('Your next of kin is required.'),
    nextOfKinPhoneNo: Yup.string()
        .phone('NG', 'Please enter a valid NG phone number')
        .required('A phone number is required'),
    occupation: Yup.string().required('Your occupation is required.'),
    placeOfWork: Yup.string().required('Your place of work is required.'),
    gender: Yup.string().required('Your gender is required.'),
    maritalStatus: Yup.string().required('Your marital status is required.'),
    birthDay: Yup.date()
        .nullable()
        .min(new Date(1900, 0, 1))
        .required('Your birthday is required.'),
    socialMedia: Yup.object().shape({
        facebook: Yup.string(),
        instagram: Yup.string(),
        twitter: Yup.string(),
    }),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(RegExp('^(?=.*[0-9])'), {
            message: 'At least one digit is required',
        })
        .matches(RegExp('^(?=.*[a-z])'), {
            message: 'At least one lowercase character is required',
        })
        .matches(RegExp('^(?=.*[A-Z])'), {
            message: 'At least one uppercase character is required',
        })
        .matches(/(\W)/, 'At least one special character is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirming you password is required.'),
});

export const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .required('Your enail is required.')
        .email('Invalid email'),
    password: Yup.string().required('Password is required'),
});
