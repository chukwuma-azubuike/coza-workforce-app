import RNFetchBlob from 'rn-fetch-blob';
import APP_ENV from '../../../config/envConfig';
import { Alert } from 'react-native';
import React from 'react';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const { API_BASE_URL } = APP_ENV();

type DownloadTicketsProps = {
    type: string;
    campusId: string;
    serviceId?: string;
    departmentId?: string;
    state: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
};
const getFileExtention = (fileUrl: string) => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
};

export const downloadFile = (params: DownloadTicketsProps) => {
    const { type, campusId, state, serviceId, departmentId } = params;

    const [isDownloading, setIsDownloading] = state;

    let route = '';
    if (type === 'ticket' || type === 'permissions') {
        route += `${API_BASE_URL}/${type}/download`;
    } else if (type === 'attendance') {
        route += `${API_BASE_URL}/${type}/downloadServiceAttendance`;
    }

    const url = `${route}?campusId=${campusId}${serviceId ? '&serviceId=' + serviceId : ''}${
        departmentId ? '&departmentId=' + departmentId : ''
    }`;

    setIsDownloading(true);
    try {
        // Get today's date to add the time suffix in filename
        let date = new Date();
        // File URL which we want to download
        let FILE_URL = url;
        // Function to get extention of the file url
        let file_ext = '.xsls' || getFileExtention(FILE_URL);

        // config: To get response by passing the downloading related options
        // fs: Root directory path to download
        const { config } = RNFetchBlob;
        let RootDir = RNFS.DownloadDirectoryPath;
        const path = RootDir + '/file_' + Math.floor(date.getTime() + date.getSeconds() / 2) + file_ext;
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                path,
                description: 'downloading file...',
                notification: true,
                // useDownloadManager works with Android only
                useDownloadManager: true,
            },
        };
        config(options)
            .fetch('GET', FILE_URL)
            .then(async response => {
                // Save the file using RNFS
                const fileData = (await response.blob('blob', 1)) as any;
                const downloadDir = RNFS.DownloadDirectoryPath;
                await RNFS.writeFile(downloadDir, fileData, 'ascii');

                // Open the downloaded file with the default app for its type
                await Share.open({ url: `file://${path}`, title: 'Open Excel File' });
                // Alert after successful downloading
                Alert.alert('File Downloaded Successfully.');
            });
    } catch (error) {
        console.error('Error downloading Excel file:', error);
    } finally {
        setIsDownloading(false);
    }

    return { isDownloading };
};

// export const downLoadExcelFile = (state: [boolean, React.Dispatch<React.SetStateAction<boolean>>]) => {
//     const [isDownloading, setIsDownloading] = state;

//     const handleDownload = async () => {
//         setIsDownloading(true);
//         try {
//             const url = 'https://your-backend-api-url/download-excel';
//             const headers = { 'Cache-Control': 'no-cache' };

//             // Perform the request using RNFetchBlob
//             const response = await RNFetchBlob.config({ fileCache: true }).fetch('GET', url, headers);

//             // Get the response data as a Blob
//             const fileData = await response.blob('blob', 1);

//             // Save the file using RNFS
//             const downloadDir = RNFS.DownloadDirectoryPath;
//             const filePath = `${downloadDir}/example.xlsx`;
//             await RNFS.writeFile(filePath, fileData, 'ascii');

//             // Open the downloaded file with the default app for its type
//             await Share.open({ url: `file://${filePath}`, title: 'Open Excel File' });

//             Alert.alert('Success', 'Excel file downloaded successfully!');
//         } catch (error) {
//             console.error('Error downloading Excel file:', error);
//         } finally {
//             setIsDownloading(false);
//         }
//     };

//     return { isDownloading };
// };
