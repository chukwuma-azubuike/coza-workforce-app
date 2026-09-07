import React from 'react';
import { View } from 'react-native';

import { Text } from '~/components/ui/text';
import { AttachmentImage, ReportSection } from './primitives';
import { ReportKey, resolveReportKey } from '@constants/report-routes';
import {
    AttendanceReportView,
    ChildCareReportView,
    GuestReportView,
    IncidentReportView,
    InternshipReportView,
    ProtocolReportView,
    PruReportView,
    SecurityReportView,
    ServiceReportView,
    TransferReportView,
    WelfareReportView,
    WittyReportView,
} from './views';

// Report data is dynamically shaped per department; intentionally untyped here.
type AnyReport = any;

const VIEWS: Record<ReportKey, React.FC<{ data: AnyReport }>> = {
    childcare: ChildCareReportView,
    attendance: AttendanceReportView,
    guest: GuestReportView,
    security: SecurityReportView,
    transfer: TransferReportView,
    service: ServiceReportView,
    incident: IncidentReportView,
    witty: WittyReportView,
    internship: InternshipReportView,
    pru: PruReportView,
    welfare: WelfareReportView,
    protocol: ProtocolReportView,
};

// ─── Generic fallback (unknown shape) ───────────────────────────────────────
const META_KEYS = new Set([
    '_id',
    'reportId',
    'status',
    'reportType',
    'hodId',
    'userId',
    'departmentId',
    'departmentName',
    'campusId',
    'campusName',
    'serviceId',
    'serviceName',
    'serviceTime',
    'groupId',
    'submittedBy',
    'submittedAt',
    'reviewHistory',
    'ghComment',
    'pastorComment',
    'gspComment',
    'imageUrl',
    'createdAt',
    'updatedAt',
    '__v',
]);

const humanize = (key: string): string =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();

const GenericReportView: React.FC<{ data?: AnyReport }> = ({ data }) => {
    const entries = Object.entries(data ?? {}).filter(([k]) => !META_KEYS.has(k));
    return (
        <>
            <ReportSection title="Report data">
                {entries.length === 0 ? (
                    <Text className="!text-[13px] text-muted-foreground">No data submitted.</Text>
                ) : (
                    entries.map(([k, v]) => (
                        <View key={k} className="flex-row items-center justify-between py-1.5">
                            <Text className="!text-[13px] text-muted-foreground flex-1">{humanize(k)}</Text>
                            <Text className="!text-[13px] font-semibold text-foreground">
                                {typeof v === 'object' && v !== null ? JSON.stringify(v) : `${v ?? '—'}`}
                            </Text>
                        </View>
                    ))
                )}
            </ReportSection>
            <AttachmentImage url={data?.imageUrl} />
        </>
    );
};

/**
 * Renders a department report with a layout tailored to its shape. Resolves the
 * view by reportType first, then by data shape, then falls back to a generic
 * key/value card so an unrecognised report never breaks the screen.
 */
const ReportDataView: React.FC<{ reportType?: string; data?: AnyReport }> = ({ reportType, data }) => {
    const key = resolveReportKey({ reportType, data });
    if (key && data) {
        const Specific = VIEWS[key];
        return (
            <View className="gap-3">
                <Specific data={data} />
            </View>
        );
    }
    return (
        <View className="gap-3">
            <GenericReportView data={data} />
        </View>
    );
};

export default ReportDataView;
