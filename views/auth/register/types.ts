import { IRegisterPayload } from '@store/types';

export interface IRegisterFormStepOne
    extends Pick<IRegisterPayload, 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'address' | 'departmentName'> {}

export interface IRegisterFormStepTwo
    extends Pick<
        IRegisterPayload,
        'gender' | 'occupation' | 'placeOfWork' | 'nextOfKin' | 'nextOfKinPhoneNo' | 'maritalStatus'
    > {}

export interface IRegisterFormStepThree extends Pick<IRegisterPayload, 'birthDay' | 'socialMedia' | 'pictureUrl'> {}

export interface IRegisterFormStepFour extends Pick<IRegisterPayload, 'password'> {
    confirmPassword?: string;
}
