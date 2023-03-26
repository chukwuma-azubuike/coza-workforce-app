import React from 'react';
import { REST_API_VERBS } from '../../store/types';
import { UPLOAD_API_KEY, UPLOAD_URL } from '@env';

import { launchImageLibrary } from 'react-native-image-picker';
import { IImbbAlbumId } from '../../config/uploadConfig';

export interface IUploadResponseImgBB {
    data: {
        id: string;
        title: string;
        url_viewer: string;
        url: string;
        display_url: string;
        width: string;
        height: string;
        size: string;
        time: string;
        expiration: string;
        image: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        thumb: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        medium: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        delete_url: string;
    };
    success: boolean;
    status: number;
}

const MAX_IMAGE_SIZE = 2000000;

const useUpload = ({ albumId }: { albumId: IImbbAlbumId }) => {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [uploadResponse, setUploadResponse] = React.useState<IUploadResponseImgBB>();
    const [error, setError] = React.useState<any>();

    const uploadImage = async (imageData: any) => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('key', UPLOAD_API_KEY);
            formData.append('image', {
                uri: imageData.uri,
                type: imageData.type,
                name: imageData.fileName,
            });

            formData.append('album', albumId); // Include the album ID in the request

            const uri = await fetch(imageData.uri);
            const blob = await uri.blob();
            formData.append('image', blob);

            const response = await fetch(UPLOAD_URL, {
                method: REST_API_VERBS.POST,
                body: formData,
            });

            const json = await response.json();

            if (json.status === 200) {
                setLoading(false);

                setUploadResponse(json);
            } else {
                setLoading(false);
                setError(json);
            }
        } catch (error) {
            setLoading(false);
            setError(JSON.stringify(error));
        }
    };

    const reset = () => {
        setError(undefined);
        setUploadResponse(undefined);
    };

    const initialise = () => {
        reset();
        launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (res: any) => {
            if (res?.assets[0]?.fileSize > MAX_IMAGE_SIZE) {
                setError(`File must not be larger than ${MAX_IMAGE_SIZE / 1000000}mb`);
                return;
            }
            uploadImage(res?.assets[0]);
        });
    };

    return {
        isError: uploadResponse?.status ? uploadResponse?.status >= 400 : false,
        isSuccess: uploadResponse?.success,
        data: uploadResponse?.data,
        initialise,
        loading,
        reset,
        error,
    };
};

export default useUpload;
