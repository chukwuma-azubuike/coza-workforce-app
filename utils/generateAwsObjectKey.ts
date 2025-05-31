import { S3_BUCKET_FOLDERS } from '~/constants';
import { DocumentPickerAsset } from 'expo-document-picker';
import { IUser } from '~/store/types';
import { ImagePickerAsset } from 'expo-image-picker';

/**
 *
 * @param param0
 * @returns
 */

const generateAwsObjectKey = ({
    user,
    s3Folder,
    file,
}: {
    user: IUser;
    s3Folder: S3_BUCKET_FOLDERS;
    file: ImagePickerAsset | DocumentPickerAsset;
}) => {
    //TODO: Not needed for now
    // const fileName = (file as DocumentPickerAsset)?.name || (file as ImagePickerAsset)?.fileName || '';
    // const lastDot = fileName?.lastIndexOf('.');
    // const ext = fileName?.slice(lastDot + 1);

    const objectKey = `${process.env.APP_VARIANT}/${s3Folder}/${encodeURIComponent(user?.phoneNumber)}`;

    return objectKey;
};

export default generateAwsObjectKey;
