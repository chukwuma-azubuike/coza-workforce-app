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
    gender: Yup.string().required('Gender is required.'),
    comment: Yup.string().optional(),
    assimilationStageId: Yup.string(),
    nextAction: Yup.string().optional(),
    assimilationSubStageId: Yup.string(),
    assignedToId: Yup.string().required('Must be assigned to a user'),
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

/**
 * A custom guest reminder (US-2.1).
 *
 * `dueAt` is validated against *now at submit time*, not at mount: a sheet left open for
 * ten minutes on a time chosen ten minutes ahead would otherwise pass validation and be
 * rejected by the server, which is the one outcome the inline message exists to prevent.
 *
 * The 60-second grace matches the server's — see `02_BACKEND_SPEC.md §2.2`. Without it, a
 * time the picker itself offered can be refused by the round trip that submits it.
 */
export const ReminderFormValidationSchema = Yup.object().shape({
    guestId: Yup.string().required('A reminder has to be about a guest.'),
    dueAt: Yup.string()
        .required('Pick a time.')
        .test('is-future', "That's already passed — pick a later time.", value => {
            if (!value) {
                return false;
            }

            return new Date(value).getTime() > Date.now() - 60_000;
        }),
    note: Yup.string().trim().max(280, 'Keep it under 280 characters.').required('What should this remind you to do?'),
});
