import * as Yup from 'yup';
import 'yup-phone-lite';
import { countryCodeIso } from '~/utils/countryCodeIso';

export const GuestFormValidationSchema = Yup.object().shape({
    name: Yup.string().required("Guest's name is required."),
    address: Yup.string().required('Your home address is required.'),
    phone: Yup.string()
        .phone(countryCodeIso as any, 'Please enter a valid phone number')
        .required('A phone number is required'),
    zoneId: Yup.string().required('Please select a zone'),
    gender: Yup.string().required('Your gender is required.'),
    comment: Yup.string().optional(),
});
