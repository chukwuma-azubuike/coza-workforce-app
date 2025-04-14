import React, { useCallback, useState } from 'react';
import { View, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { Text } from '~/components/ui/text';
import { Progress } from '~/components/ui/progress';

import { useGenerateUploadUrlMutation, useUploadMutation } from '~/store/services/upload';
import { IUser } from '~/store/types';
import { S3_BUCKET_FOLDERS } from '~/constants';
import generateAwsObjectKey from '~/utils/generateAwsObjectKey';
import APP_ENV from '~/config/envConfig';

export interface FilePickerUploaderProps {
    label?: string; // Input label
    user: IUser;
    s3Folder: S3_BUCKET_FOLDERS;
    type: 'file-manager' | 'gallery' | 'camera';
    onUploadSuccess: (displayUrl: string) => void;
    onUploadError?: (error: Error) => void;
    allowedTypes?: string[]; // Allowed file types (e.g., ['image/*', 'application/pdf'])
}

const useUploader = ({
    user,
    s3Folder,
    onUploadSuccess,
    onUploadError,
    allowedTypes = ['*/*'],
}: FilePickerUploaderProps) => {
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [uploadSuccessful, setUploadSuccessful] = useState<boolean>();
    const [uploadFailed, setUploadFailed] = useState<boolean>();

    const [generateUrl, { isLoading: generateUrlLoading }] = useGenerateUploadUrlMutation();
    const [uploadMutation, { isLoading: isUploading, error }] = useUploadMutation();

    const pickAsset = useCallback(async (asset: DocumentPicker.DocumentPickerAsset) => {
        try {
            // Proceed is an asset is passed
            setFile(asset);

            await uploadFile(asset);
        } catch (err: any) {
            Alert.alert('Error picking asset', err.message);
        }
    }, []);

    const pickImage = useCallback(async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'livePhotos'],
                allowsEditing: true,
                quality: 1,
            });

            if (result.assets) {
                setFile(result.assets[0]);
                await uploadFile(result.assets[0]);
            }
        } catch (err: any) {
            Alert.alert('Error picking document', err.message);
        }
    }, []);

    const pickDocument = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: false,
                type: allowedTypes,
                copyToCacheDirectory: true,
            });

            if (result.assets) {
                setFile(result.assets[0]);
                await uploadFile(result.assets[0]);
            }
        } catch (err: any) {
            Alert.alert('Error picking document', err.message);
        }
    }, [allowedTypes]);

    const uploadFile = useCallback(
        async (fileResult: DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset) => {
            setProgress(0);
            setUploadFailed(false);
            setUploadSuccessful(false);

            try {
                const objectKey = generateAwsObjectKey({
                    user,
                    s3Folder,
                    file: fileResult,
                });

                const displayUrl = `https://${APP_ENV.AWS_S3_BUCKET_NAME}.s3.${APP_ENV.AWS_REGION}.amazonaws.com/${objectKey}`;
                const fetchBlobResponse = await fetch(fileResult.uri);
                const blob = await fetchBlobResponse.blob();

                const urlResponse = await generateUrl({
                    objectKey,
                    expirySeconds: 3600,
                    bucketName: APP_ENV.AWS_S3_BUCKET_NAME,
                }).unwrap();

                await uploadMutation({
                    file: blob,
                    url: urlResponse,
                    setProgress,
                    contentType: fileResult.mimeType!,
                }).unwrap();

                onUploadSuccess(displayUrl);
                setUploadSuccessful(true);
            } catch (err: any) {
                setUploadSuccessful(false);
                setUploadFailed(true);
                onUploadError && onUploadError(err);
            } finally {
                setProgress(0);
            }
        },
        [uploadMutation, user, s3Folder, generateUrl, onUploadSuccess, onUploadError]
    );

    return {
        file,
        progress,
        pickAsset,
        pickImage,
        error: error,
        pickDocument,
        uploadFailed,
        uploadSuccessful,
        isUploading: generateUrlLoading || isUploading,
        ProgressUI: () => (
            <View>
                {isUploading && <Progress value={progress} className="h-2" />}
                {isUploading && <Text className="text-sm mt-1">Uploading: {Math.round(progress * 100)}%</Text>}
                {uploadSuccessful && <Text className="text-sm mt-1 text-primary">Upload Successful</Text>}
                {uploadFailed && <Text className="text-sm mt-1 text-destructive">Upload Failed</Text>}
            </View>
        ),
    };
};

export default useUploader;
