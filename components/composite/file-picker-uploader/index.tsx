import { Text } from '~/components/ui/text';
import React, { memo } from 'react';
import { View, Pressable, Image } from 'react-native';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Progress } from '~/components/ui/progress';
import useUploader, { FilePickerUploaderProps } from '~/hooks/use-uploader';

// ForwardRef to properly pass ref
const FilePickerUploader: React.FC<FilePickerUploaderProps> = ({
    user,
    type,
    label,
    s3Folder,
    onUploadSuccess,
    allowedTypes = ['*/*'],
}) => {
    const { pickDocument, pickImage, isUploading, file, progress, uploadSuccessful, uploadFailed } = useUploader({
        user,
        type,
        s3Folder,
        onUploadSuccess,
        allowedTypes,
    });

    return (
        <Pressable className="gap-4">
            {label && <Label className="text-sm font-medium mb-2">{label}</Label>}

            <Button
                variant="outline"
                disabled={isUploading}
                className="rounded-xl !h-16 flex-row w-full relative"
                onPress={(type === 'gallery' ? pickImage : pickDocument) as () => void}
            >
                {file?.uri && <Image source={{ uri: file.uri }} className="h-14 w-14 rounded-lg absolute left-1" />}
                <Text>{file ? 'Pick Another File' : 'Pick a File'}</Text>
            </Button>

            {isUploading && (
                <View>
                    <Progress value={progress} className="h-2" />
                    <Text className="text-sm mt-2">Uploading: {Math.round(progress * 100)}%</Text>
                </View>
            )}
            {uploadSuccessful && <Text className="text-sm text-green-400">Upload Successful</Text>}
            {uploadFailed && <Text className="text-sm text-destructive">Upload Failed</Text>}
        </Pressable>
    );
};

export default memo(FilePickerUploader);

FilePickerUploader.displayName = 'FilePickerUploader';
