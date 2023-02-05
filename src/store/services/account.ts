import { createApi } from '@reduxjs/toolkit/query/react';
import Utils from '../../utils';
import {
    IRegisterPayload,
    IDefaultResponse,
    ILoginPayload,
    IUser,
    IToken,
    REST_API_VERBS,
} from '../types';
import { fetchUtils } from './fetch-utils';

const SERVICE_URL = 'account';

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
}>;

interface IVerifyEmailResponseTransform {
    email: string;
    gender: string;
    campusId: string;
    lastName: string;
    firstName: string;
    departmentName: string;
    departmentId: string;
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

        validateEmailOTP: endpoint.mutation<
            IVerifyEmailResponseTransform,
            IVerifyEmailOTPPayload
        >({
            query: body => ({
                url: `/${SERVICE_URL}/validate-otp`,
                method: REST_API_VERBS.PATCH,
                body,
            }),

            transformResponse: (response: IVerifyEmailOTPResponse) => {
                const {
                    email,
                    gender,
                    campusId,
                    lastName,
                    firstName,
                    department: { _id, departmentName },
                } = response.data;

                return {
                    email,
                    gender,
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
                body: {
                    ...body,
                    pictureUrl: '',
                },
            }),
        }),

        /*********** User **********/

        getUserById: endpoint.query<IUser, string>({
            query: _id => ({
                url: `/${SERVICE_URL}/user/${_id}`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: async (response: IGetUserByIdResponse) =>
                response.data,
        }),
    }),
});

// Use exported hook in relevant components
export const {
    useSendOTPQuery,
    useLoginMutation,
    useRegisterMutation,
    useGetUserByIdQuery,
    useValidateEmailOTPMutation,
} = accountServiceSlice;
