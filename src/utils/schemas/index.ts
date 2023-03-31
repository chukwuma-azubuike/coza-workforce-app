import * as Yup from 'yup';
import 'yup-phone-lite';
import { countryCodeIso } from '../countryCodeIso';

// Form validation

export const EmailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email'),
});

export const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('Your first name is required.'),
    lastName: Yup.string().required('Your last name is required.'),
    address: Yup.string().required('Your home address is required.'),
    phoneNumber: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    email: Yup.string().required('Your email is required.'),
    departmentId: Yup.string(),
    campusId: Yup.string(),
    roleId: Yup.string(),
    nextOfKin: Yup.string().required('Your next of kin is required.'),
    nextOfKinPhoneNo: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    occupation: Yup.string().required('Your occupation is required.'),
    placeOfWork: Yup.string().required('Your place of work is required.'),
    gender: Yup.string().required('Your gender is required.'),
    maritalStatus: Yup.string().required('Your marital status is required.'),
    birthDay: Yup.date().nullable().min(new Date(1900, 0, 1)).required('Your birthday is required.'),
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

export const RegisterSchema_1 = Yup.object().shape({
    firstName: Yup.string().required('Your first name is required.'),
    lastName: Yup.string().required('Your last name is required.'),
    address: Yup.string().required('Your home address is required.'),
    phoneNumber: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    email: Yup.string().required('Your email is required.'),
    departmentId: Yup.string(),
});

export const RegisterSchema_2 = Yup.object().shape({
    gender: Yup.string().required('Your gender is required.'),
    occupation: Yup.string().required('Your occupation is required.'),
    placeOfWork: Yup.string().required('Your place of work is required.'),
    nextOfKin: Yup.string().required('Your next of kin is required.'),
    nextOfKinPhoneNo: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    maritalStatus: Yup.string().required('Your marital status is required.'),
});

export const RegisterSchema_3 = Yup.object().shape({
    birthDay: Yup.date().nullable().required('Your birthday is required.'),
    socialMedia: Yup.object().shape({
        facebook: Yup.string(),
        instagram: Yup.string(),
        twitter: Yup.string(),
    }),
});

export const RegisterSchema_4 = Yup.object().shape({
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
    email: Yup.string().required('Your email is required.').email('Invalid email'),
    password: Yup.string().required('Password is required'),
});

export const CreateIndividualTicketSchema = Yup.object().shape({
    userId: Yup.string().required('You are required to select a user.'),
    categoryId: Yup.string().required('You are required to select a category.'),
    departmentId: Yup.string().required('You are required to select a department'),
    ticketSummary: Yup.string().required('You are required to input a ticket description.'),
});

export const CreateDepartmentalTicketSchema = Yup.object().shape({
    categoryId: Yup.string().required('You are required to select a category.'),
    departmentId: Yup.string().required('You are required to select a department'),
    ticketSummary: Yup.string().required('You are required to input a ticket description.'),
});

export const RequestPermissionSchema = Yup.object().shape({
    categoryId: Yup.string().required('You are required to select a category.'),
    description: Yup.string().required('You are required to enter a description'),
    startDate: Yup.string().required('Kindly select a start date.'),
    endDate: Yup.string().required('Kindly select an end date.'),
});

export const WorkforceClockinSchema = Yup.object().shape({
    userId: Yup.string().required('You are required to select a category.'),
    clockIn: Yup.string().required('You are required to select a category.'),
    clockOut: Yup.string().required('You are required to select a category.'),
    serviceId: Yup.string().required('You are required to select a category.'),
    campusId: Yup.string().required('You are required to select a category.'),
    departmentId: Yup.string().required('You are required to select a category.'),
});

export const ResetPasswordSchema = Yup.object().shape({
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
