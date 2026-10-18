import * as Yup from 'yup';
import dayjs from 'dayjs';
import 'yup-phone-lite';
import { countryCodeIso } from '../countryCodeIso';
import { IServiceFormValues } from '~/store/types';
import { minutesOfDay } from '~/utils/service-form';
// Imported from the module directly rather than the package index, so schemas
// don't pull in the link-preview component tree.
import { normalizeUrl } from '~/components/composite/link-preview/utils';

// Form validation

export const EmailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
});

export const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('Your first name is required.'),
    lastName: Yup.string().required('Your last name is required.'),
    address: Yup.string().required('Your home address is required.'),
    phoneNumber: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    email: Yup.string().email('Must be email format').required('Email is required.'),
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
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Confirming you password is required.'),
});

export const RegisterSchema_1 = Yup.object().shape({
    firstName: Yup.string().required('Your first name is required.'),
    lastName: Yup.string().required('Your last name is required.'),
    address: Yup.string().required('Your home address is required.'),
    phoneNumber: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    email: Yup.string().email('Must be email format').required('Email is required.'),
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
    birthDay: Yup.date().required('Your birthday is required.'),
    socialMedia: Yup.object().shape({
        facebook: Yup.string(),
        instagram: Yup.string(),
        twitter: Yup.string(),
    }),
    pictureUrl: Yup.string().optional(),
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
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Confirming you password is required.'),
});

export const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Your email is required.').email('Invalid email'),
    password: Yup.string().required('Password is required'),
});

const REQUIRED_TIME = 'Field required.';

/** `field` must fall at or after `other` on the clock. Skipped until both are set. */
const notBefore = (other: keyof IServiceFormValues, message: string) =>
    Yup.string()
        .required(REQUIRED_TIME)
        .test('not-before', message, function (value) {
            const self = minutesOfDay(value);
            const bound = minutesOfDay(this.parent[other]);
            return self === undefined || bound === undefined || self >= bound;
        });

/** `field` must fall strictly before `other` on the clock. Skipped until both are set. */
const before = (other: keyof IServiceFormValues, message: string) =>
    Yup.string()
        .required(REQUIRED_TIME)
        .test('before', message, function (value) {
            const self = minutesOfDay(value);
            const bound = minutesOfDay(this.parent[other]);
            return self === undefined || bound === undefined || self < bound;
        });

/** Shared by regular services and congress sessions, in both create and edit. */
export const ServiceFormSchema = Yup.object<IServiceFormValues>().shape({
    tag: Yup.string().required('Select a tag.'),
    serviceType: Yup.string().required('Select local or global.'),
    name: Yup.string().trim().required('Name is required.'),
    rangeToClockIn: Yup.string().required('Select a clock-in range.'),
    serviceDate: Yup.string().required('Pick a date.'),
    clockInStartTime: before('serviceEndTime', 'Clock-in must open before the end time.'),
    leadersLateStartTime: notBefore('clockInStartTime', 'Must be at or after clock-in opens.'),
    workersLateStartTime: notBefore('clockInStartTime', 'Must be at or after clock-in opens.'),
    serviceTime: notBefore('clockInStartTime', 'Start must be at or after clock-in opens.'),
    serviceEndTime: Yup.string()
        .required(REQUIRED_TIME)
        .test('after-start', 'End time must be after the start time.', function (value) {
            const self = minutesOfDay(value);
            const start = minutesOfDay(this.parent.serviceTime);
            return self === undefined || start === undefined || self > start;
        }),
});

export const AssignGroupHeadSchema = Yup.object().shape({
    worker: Yup.string().required('You are required to select a worker.'),
    role: Yup.string().required('You are required to select a role.'),
});

export const CreateIndividualTicketSchema = Yup.object().shape({
    ticketType: Yup.string().required('You are required to select a ticket type.'),
    userId: Yup.string().required('You are required to select a user.'),
    categoryId: Yup.string().required('You are required to select a category.'),
    departmentId: Yup.string().required('You are required to select a department'),
    ticketSummary: Yup.string().required('You are required to input a ticket description.'),
});

export const CreateDepartmentalTicketSchema = Yup.object().shape({
    ticketType: Yup.string().required('You are required to select a ticket type.'),
    categoryId: Yup.string().required('You are required to select a category.'),
    departmentId: Yup.string().required('You are required to select a department'),
    ticketSummary: Yup.string().required('You are required to input a ticket description.'),
});

export const CreateCampusTicketSchema = Yup.object().shape({
    ticketType: Yup.string().required('You are required to select a ticket type.'),
    categoryId: Yup.string().required('You are required to select a category.'),
    campusId: Yup.string().required('You are required to select a campus'),
    ticketSummary: Yup.string().required('You are required to input a ticket description.'),
});

export const RequestPermissionSchema = Yup.object().shape({
    categoryId: Yup.string().required('You are required to select a category.'),
    description: Yup.string().required('You are required to enter a description'),
    startDate: Yup.string().required('Kindly select a start date.'),
    endDate: Yup.string().required('Kindly select an end date.'),
});

export const WorkforceClockinSchema = Yup.object().shape({
    userId: Yup.string().required('You are required to select a user.'),
    campusId: Yup.string().required('You are required to select a campus.'),
    departmentId: Yup.string().required('You are required to select a department.'),
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
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Confirming you password is required.'),
});

// Report forms
export const GSPReportSchema = Yup.object().shape({
    campusCoordinatorComment: Yup.string().required('Please provide a comment'),
});

export const GHReportSchema = Yup.object().shape({
    submittedReport: Yup.string().required('Please provide a comment'),
});

export const ServiceReportSchema = Yup.object().shape({
    serviceStartTime: Yup.string().required('Please provide service start time'),
    serviceEndTime: Yup.string().required('Please provide service end time'),
    serviceReportLink: Yup.string().required('Please provide report link'),
});

export const CreateUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required.'),
    lastName: Yup.string().required('Last name is required.'),
    email: Yup.string().email('Must be email format').required('Email is required.'),
    departmentId: Yup.string().required('Department is required.'),
    roleId: Yup.string().required('Role is required.'),
});

export const REPORT_TYPE_OPTIONS = [
    'ChildCareReport',
    'AttendanceReport',
    'GuestReport',
    'SecurityReport',
    'TransferReport',
    'ServiceReport',
    'InternshipReport',
    'WelfareReport',
    'WittyReport',
    'PruReport',
    'ProtocolReport',
] as const;

export const CreateDepartmentSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    campusId: Yup.string(),
    reportType: Yup.string().oneOf([...REPORT_TYPE_OPTIONS], 'Invalid report type'),
});

export const CreateCampusSchema = Yup.object().shape({
    campusName: Yup.string().required('Campus name is required'),
    description: Yup.string(),
    address: Yup.string().required('Address is required'),
    LGA: Yup.string().required('LGA is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    dateOfBirth: Yup.string().required('DOB is required'),
    coordinates: Yup.object().shape({
        long: Yup.number().required('Longitude is required').notOneOf([0], 'Please input a valid longitude'),
        lat: Yup.number().required('Latitude is required').notOneOf([0], 'Please input a valid latitude'),
    }),
});

// Congress forms

/** `value` is on or after the date held in the sibling field `other`. Skipped until both are set. */
const sameDayOrAfter = (other: string) =>
    function (this: Yup.TestContext, value?: string) {
        const bound = this.parent[other];
        return !value || !bound || !dayjs(value).isBefore(dayjs(bound), 'day');
    };

export const CreateCongressSchema = Yup.object().shape({
    name: Yup.string().trim().required('You are required to enter a name'),
    startDate: Yup.string().required('A start date is required'),
    endDate: Yup.string()
        .required('An end date is required')
        .test('after-start', 'End date cannot be before the start date', sameDayOrAfter('startDate')),
    registrationStartDate: Yup.string().required('A registration start date is required'),
    registrationEndDate: Yup.string()
        .required('A registration end date is required')
        .test(
            'after-registration-start',
            'Registration cannot close before it opens',
            sameDayOrAfter('registrationStartDate')
        ),
});

export const CreateCongressInstantMessageSchema = Yup.object().shape({
    title: Yup.string().required('You are required to enter a title'),
    message: Yup.string().required('You are required to enter a message'),
    // Optional, but if something is typed it has to be openable. `normalizeUrl`
    // accepts a scheme-less "coza.org.ng/x", so this only rejects real junk.
    messageLink: Yup.string().test(
        'is-openable-link',
        'Enter a valid link, e.g. https://coza.org.ng/resource',
        value => !`${value ?? ''}`.trim() || !!normalizeUrl(value)
    ),
});

export const SubmitCongressFeedbackSchema = Yup.object().shape({
    comment: Yup.string().required('You are required to enter a comment'),
    rating: Yup.number()
        .required('You are required to give a rating')
        .notOneOf([0], 'You are required to give a rating'),
});
