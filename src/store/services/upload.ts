import { Dispatch, SetStateAction } from 'react';

import { createApi } from '@reduxjs/toolkit/query/react';
import { Dispatch as ReduxDispatch } from '@reduxjs/toolkit';

import { axiosBaseQueryFn } from './fetch-utils';
import { uploadActions } from '@store/actions/upload';
import { IDefaultResponse, REST_API_VERBS } from '@store/types';
import { Asset } from 'react-native-image-picker';

type IUploadResponse = IDefaultResponse<{}>; // TODO: Update once upload endpoint is available
type IGenerateUploadURLResponse = IDefaultResponse<{ url: string }>;
interface IUploadPayload {
    id?: string;
    file: Asset;
    url: string;
    dispatch?: ReduxDispatch; // Passed as a return from useDispatch hook in React component
    setProgress?: Dispatch<SetStateAction<number>>;
    description?: string;
}

const SERVICE_URL = 'uploadApi';

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
const UPLOAD_URL = `${PROXY_URL}${process.env.NEXT_PUBLIC_IMGBB_UPLOAD_URL}`;

export const uploadServiceSlice = createApi({
    reducerPath: SERVICE_URL,

    tagTypes: [SERVICE_URL],

    baseQuery: axiosBaseQueryFn({ baseUrl: UPLOAD_URL }),

    endpoints: builder => ({
        generateUploadUrl: builder.mutation<string, { file_key: string }>({
            query: ({ ...data }) => ({
                url: 'presigned_url_endpoint',
                method: REST_API_VERBS.POST,
                data,
            }),

            transformResponse: (response: IGenerateUploadURLResponse) => response?.data.url,
        }),

        upload: builder.mutation<IUploadResponse['data'], IUploadPayload>({
            query: ({ id, file, url, dispatch, setProgress, description }) => ({
                url,
                data: file,
                method: REST_API_VERBS.PUT,
                headers: { 'Content-Type': file.type },

                // Capture upload progress
                onUploadProgress({ loaded, total }) {
                    if (total) {
                        const progress = Math.round((loaded * 100) / total);

                        if (setProgress) {
                            setProgress(progress);
                        }

                        if (dispatch && id) {
                            dispatch(uploadActions.updateProgress({ id, total, loaded, description }));
                        }
                    }
                },
            }),

            transformResponse: (response: IUploadResponse) => response?.data,
        }),
    }),
});

// Use exported hook in relevant components
export const { useGenerateUploadUrlMutation, useUploadMutation } = uploadServiceSlice;
