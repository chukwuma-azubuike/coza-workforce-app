import { ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';

const MAX_IMAGE_SIZE = 5000000;
const MB = 1000000;

const filePicker = async (): Promise<ImagePickerResponse> => {
    return await launchImageLibrary({ mediaType: 'photo', includeBase64: true }, res => {
        if (!res) {
            return {
                errorMessage: 'Something went wrong',
            };
        }
        if (!!res && !!res?.assets && res?.assets?.length > 0 && res?.assets[0]?.fileSize) {
            if (res?.assets[0]?.fileSize > MAX_IMAGE_SIZE) {
                return { ...res, errorMessage: `File must not be larger than ${MAX_IMAGE_SIZE / MB}mb` };
            } else {
                return res;
            }
        }
    });
};

export default filePicker;
