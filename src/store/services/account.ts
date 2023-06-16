import { createApi } from '@reduxjs/toolkit/query/react';
import Utils from '../../utils';
import {
    IRegisterPayload,
    IDefaultResponse,
    ILoginPayload,
    IUser,
    IToken,
    REST_API_VERBS,
    IDepartment,
    IDefaultQueryParams,
    IEditProfilePayload,
    ICreateUserPayload,
    ICampusUserData,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'account';
const USER_SERVICE_URL = 'users';

export type ISendOTPResponse = IDefaultResponse<{
    isOTPSent: boolean;
    email: string;
}>;

export interface IVerifyEmailOTPPayload extends Pick<IUser, 'email'> {
    otp: number;
}

export interface IOTPResponse {
    __v: number;
    OTP: number;
    isExpired: boolean;
    createdAt: string;
    updatedAt: string;
}

export type IVerifyEmailOTPResponse = IDefaultResponse<{
    campusId: string;
    createdAt: string;
    department: {
        __v: number;
        _id: string;
        campusId: string;
        createdAt: string;
        departmentName: string;
        description: string;
    };
    email: string;
    firstName: string;
    gender: string;
    lastName: string;
    userId: string;
    roleId: string;
}>;

export interface IVerifyForgotPassword {
    OTP: number;
    isUsed: boolean;
    _id: IUser['_id'];
    createdAt: string;
    updatedAt: string;
    email: IUser['email'];
}

export type IVerifyForgotPasswordOTPResponse = IDefaultResponse<IVerifyForgotPassword>;

export interface IResetPasswordPayload {
    OTP: string;
    email: string;
    password: string;
}

interface IVerifyEmailResponseTransform {
    email: string;
    gender: string;
    campusId: string;
    lastName: string;
    firstName: string;
    departmentName: string;
    departmentId: string;
}

export interface IGlobalWorkforceSummary {
    activeUser: number;
    campusCount: number;
    inactiveUser: number;
    blacklistedUsers: number;
    UnregisteredUsers: number;
    campusWorfForce: ICampusWorkforceSummary[];
}

export interface ICampusWorkforceSummary {
    campusId: string;
    campusName: string;
    userCount: number;
}

export type ILoginResponse = IDefaultResponse<{
    token: IToken;
    profile: IUser;
}>;

export type IRegisterResponse = IDefaultResponse<IUser>;
export type IGetUserByIdResponse = IDefaultResponse<IUser>;

export const accountServiceSlice = createApi({
    reducerPath: 'account',

    tagTypes: ['account'],

    baseQuery: fetchUtils.baseQuery,

    endpoints: endpoint => ({
        /*********** Authentication **********/

        sendOTP: endpoint.query<ISendOTPResponse, string>({
            query: email => `/${SERVICE_URL}/send-otp/${email}`,
        }),

        validateEmailOTP: endpoint.mutation<IVerifyEmailResponseTransform, IVerifyEmailOTPPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/validate-otp`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: IVerifyEmailOTPResponse) => {
                const {
                    email,
                    roleId,
                    gender,
                    campusId,
                    lastName,
                    firstName,
                    department: { _id, departmentName },
                } = response.data;

                return {
                    email,
                    gender,
                    roleId,
                    campusId,
                    lastName,
                    firstName,
                    departmentName,
                    departmentId: _id,
                };
            },
        }),

        login: endpoint.mutation<
            {
                token: IToken;
                profile: IUser;
            },
            ILoginPayload
        >({
            query: body => ({
                url: `/${SERVICE_URL}/login`,
                method: REST_API_VERBS.POST,
                body,
            }),
            transformResponse: async (response: ILoginResponse) => {
                Utils.storeUserSession(response.data)
                    .then(() => {})
                    .catch(err => {});
                return response.data;
            },
        }),

        register: endpoint.mutation<IRegisterResponse, IRegisterPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/register`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        createUser: endpoint.mutation<IRegisterResponse, IRegisterPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createUser`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        uploadUser: endpoint.mutation<IRegisterResponse, ICreateUserPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/createUploadedUser`,
                method: REST_API_VERBS.POST,
                body,
            }),
        }),

        updateUser: endpoint.mutation<IRegisterResponse, IEditProfilePayload>({
            query: body => ({
                url: `/${SERVICE_URL}/update/${body._id}`,
                method: REST_API_VERBS.PATCH,
                body,
            }),
        }),

        deleteUser: endpoint.mutation<IUser, string>({
            query: email => ({
                url: `/${SERVICE_URL}/delete/${email}`,
                method: REST_API_VERBS.DELETE,
            }),
        }),

        sendForgotPasswordOTP: endpoint.query<ISendOTPResponse, string>({
            query: email => `/${SERVICE_URL}/forget-password/otp/${email}`,
        }),

        validateForgotPasswordOTP: endpoint.mutation<IVerifyForgotPassword, IVerifyEmailOTPPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/forget-password/validate`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: IVerifyForgotPasswordOTPResponse) => response.data,
        }),

        resetPassword: endpoint.mutation<IUser, IResetPasswordPayload>({
            query: body => ({
                url: `/${SERVICE_URL}/forget-password/${body.OTP}`,
                method: REST_API_VERBS.POST,
                body: {
                    email: body.email,
                    password: body.password,
                },
            }),
        }),

        /*********** User **********/

        getUserById: endpoint.query<IUser, string>({
            query: _id => ({
                url: `/${SERVICE_URL}/user/${_id}`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: async (response: IGetUserByIdResponse) => response.data,
        }),

        getUsersByDepartmentId: endpoint.query<IUser[], IDepartment['_id']>({
            query: _id => ({
                url: `/${USER_SERVICE_URL}/getUsers`,
                params: { departmentId: _id },
            }),

            transformResponse: (response: IDefaultResponse<IUser[]>) => response.data,
        }),
        getCampusSummaryByCampusId: endpoint.query<ICampusUserData, string>({
            query: campusId => ({
                url: `/${USER_SERVICE_URL}/campus`,
                method: REST_API_VERBS.GET,
                params: { campusId },
            }),

            transformResponse: (response: IDefaultResponse<ICampusUserData>) => response.data,
        }),

        getUsers: endpoint.query<IUser[], IDefaultQueryParams>({
            query: params => ({
                url: `/${USER_SERVICE_URL}/getUsers`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (response: IDefaultResponse<IUser[]>) => response.data,
        }),

        getGlobalWorkForceSummary: endpoint.query<IGlobalWorkforceSummary, void>({
            query: () => ({
                url: `/${USER_SERVICE_URL}/globalForce`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (response: IDefaultResponse<IGlobalWorkforceSummary>) => response.data,
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useSendOTPQuery,
    useGetUsersQuery,
    useLoginMutation,
    useRegisterMutation,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useResetPasswordMutation,
    useValidateEmailOTPMutation,
    useSendForgotPasswordOTPQuery,
    useGetUsersByDepartmentIdQuery,
    useGetGlobalWorkForceSummaryQuery,
    useGetCampusSummaryByCampusIdQuery,
    useValidateForgotPasswordOTPMutation,
    useUploadUserMutation,
} = accountServiceSlice;
