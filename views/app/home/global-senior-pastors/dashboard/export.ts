import { Alert } from 'react-native';
import APP_VARIANT from '@config/envConfig';
import Utils from '@utils/index';
import { downloadGeneratedExcelFile } from '@utils/downloadFile';

const { API_BASE_URL } = APP_VARIANT;

interface ExportParams {
    startDate?: number;
    endDate?: number;
    campusId?: string;
    fileName?: string;
}

const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => {
            const result = (reader.result as string) ?? '';
            // strip the `data:...;base64,` prefix that readAsDataURL prepends
            resolve(result.includes(',') ? result.split(',')[1] ?? '' : result);
        };
        reader.readAsDataURL(blob);
    });

/**
 * Downloads the GSP dashboard spreadsheet from `/gsp/dashboard/export`. Unlike the
 * JSON endpoints, this returns a raw binary `.xlsx` (no envelope), so we fetch it
 * directly with the bearer token, base64-encode it, and hand it to the shared
 * file-write/share helper.
 */
export const exportGspDashboard = async ({ startDate, endDate, campusId, fileName }: ExportParams): Promise<void> => {
    try {
        const session = (await Utils.retrieveUserSession()) || '';
        const token = session ? JSON.parse(session)?.token?.token : undefined;

        const qs = new URLSearchParams();
        if (startDate) qs.set('startDate', String(startDate));
        if (endDate) qs.set('endDate', String(endDate));
        if (campusId) qs.set('campusId', campusId);

        const response = await fetch(`${API_BASE_URL}/gsp/dashboard/export?${qs.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) throw new Error(`Export failed (${response.status})`);

        const base64 = await blobToBase64(await response.blob());
        const safeName = (fileName ?? 'GSP-Dashboard').replace(/[^a-z0-9-_]+/gi, '-');
        await downloadGeneratedExcelFile(base64, safeName);
    } catch {
        Alert.alert('Export failed', 'Could not generate the dashboard export. Please try again.');
    }
};
