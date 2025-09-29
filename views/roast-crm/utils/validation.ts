import * as Yup from 'yup';
import 'yup-phone-lite';
import { countryCodeIso } from '~/utils/countryCodeIso';

export const GuestFormValidationSchema = Yup.object().shape({
    firstName: Yup.string().required("Guest's first name is required."),
    lastName: Yup.string().optional(),
    address: Yup.string().optional(),
    phoneNumber: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    zoneId: Yup.string().required('Please select a zone'),
    gender: Yup.string().required('Your gender is required.'),
    comment: Yup.string().optional(),
    assimilationStageId: Yup.string(),
    nextAction: Yup.string().optional(),
    assimilationSubStageId: Yup.string(),
});

export const ZoneFormValidationSchema = Yup.object().shape({
    name: Yup.string().required('Zone name is required.'),
    campusId: Yup.string().required('Please select a church'),
    address: Yup.string().required('Address is required'),
    departments: Yup.array(
        Yup.object({
            id: Yup.string().required('Please select at least one department'),
            name: Yup.string().required('Please select at least one department'),
            description: Yup.string().optional(),
        })
    ),
    coordinates: Yup.object({
        long: Yup.number(),
        lat: Yup.number(),
    }).optional(),
    descriptions: Yup.string().optional(),
});
