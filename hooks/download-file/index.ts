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
};

export const useDownloadFile = (params: DownloadTicketsProps, skip: boolean) => {
    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownload = React.useCallback(async () => {
        if (skip) return;

        const { type, campusId, serviceId, departmentId } = params;

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
    }, [params, skip]);

    return { isDownloading, handleDownload };
};
