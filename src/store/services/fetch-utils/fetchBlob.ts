import RNFetchBlob from 'rn-fetch-blob';
import APP_ENV from '../../../config/envConfig';
import { Alert } from 'react-native';

const { API_BASE_URL } = APP_ENV();

type DownloadTicketsProps = {
    data: string;
    campusId: string;
    serviceId?: string;
    departmentId?: string;
};
const getFileExtention = (fileUrl: string) => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
};

export const downloadFile = (params: DownloadTicketsProps) => {
    const { data, campusId, serviceId, departmentId } = params;

    let route = '';
    if (data === 'ticket' || data === 'permissions') {
        route += `${API_BASE_URL}/${data}/download`;
    } else if (data === 'attendance') {
        route += `${API_BASE_URL}/${data}/downloadServiceAttendance`;
    }

    const url = `${route}?campusId=${campusId}${serviceId ? '&serviceId=' + serviceId : ''}${
        departmentId ? '&departmentId=' + departmentId : ''
    }`;
    // Get today's date to add the time suffix in filename
    let date = new Date();
    // File URL which we want to download
    let FILE_URL = url;
    // Function to get extention of the file url
    let file_ext = getFileExtention(FILE_URL);

    // config: To get response by passing the downloading related options
    // fs: Root directory path to download
    const { config, fs } = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
        fileCache: true,
        addAndroidDownloads: {
            path: RootDir + '/file_' + Math.floor(date.getTime() + date.getSeconds() / 2) + file_ext,
            description: 'downloading file...',
            notification: true,
            // useDownloadManager works with Android only
            useDownloadManager: true,
        },
    };
    config(options)
        .fetch('GET', FILE_URL)
        .then(res => {
            // Alert after successful downloading
            Alert.alert('File Downloaded Successfully.');
        });
};
