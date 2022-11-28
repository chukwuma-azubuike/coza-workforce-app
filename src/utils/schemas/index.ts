import * as Yup from 'yup';

// Form validation

export const EmailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email'),
});
