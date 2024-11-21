// import DocumentPicker, { DocumentPickerResponse, isInProgress, types } from 'react-native-document-picker';
import { PlatformTypes } from 'react-native-document-picker/lib/typescript/fileTypes';
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker';

const MAX_IMAGE_SIZE = 5000000;
const MB = 1000000;

interface IFilePicker {
    maxSize?: number;
    mediaTypes?: string | Array<string | PlatformTypes>;
    mediaType?: MediaType;
}

const filePicker = async ({
    mediaType = 'photo',
    maxSize = MAX_IMAGE_SIZE,
}: IFilePicker): Promise<ImagePickerResponse> => {
    return await launchImageLibrary({ mediaType, includeBase64: true }, res => {
        if (!res) {
            return {
                errorMessage: 'Something went wrong',
            };
        }
        if (!!res && !!res?.assets && res?.assets?.length > 0 && res?.assets[0]?.fileSize) {
            if (res?.assets[0]?.fileSize > maxSize) {
                return { ...res, errorMessage: `File must not be larger than ${maxSize / MB}mb` };
            } else {
                return res;
            }
        }
    });
};

export default filePicker;
