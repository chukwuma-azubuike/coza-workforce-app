import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import APP_VARIANT from '@config/envConfig';
import { Alert } from 'react-native';
import React from 'react';

const { API_BASE_URL } = APP_VARIANT;

type DownloadTicketsProps = {
    type: string;
    campusId: string;
    serviceId?: string;
    departmentId?: string;
    state: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
};

export const downloadFile = async (params: DownloadTicketsProps) => {
    const { type, campusId, state, serviceId, departmentId } = params;
    const [, setIsDownloading] = state;

    let route = '';
    if (type === 'ticket' || type === 'permissions') {
        route = `${API_BASE_URL}/${type}/download`;
    } else if (type === 'attendance') {
        route = `${API_BASE_URL}/${type}/downloadServiceAttendance`;
    }

    const url = `${route}?campusId=${campusId}${serviceId ? `&serviceId=${serviceId}` : ''}${departmentId ? `&departmentId=${departmentId}` : ''}`;

    setIsDownloading(true);
    try {
        const downloaded = await File.downloadFileAsync(url, Paths.cache);
        await Sharing.shareAsync(downloaded.uri, { dialogTitle: 'Open Excel File' });
    } catch {
        Alert.alert('Download failed', 'An error occurred while downloading the file.');
    } finally {
        setIsDownloading(false);
    }
};
