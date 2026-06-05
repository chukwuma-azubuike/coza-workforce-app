import React from 'react';
import { View } from 'react-native';

import { Text } from '~/components/ui/text';
import { AttachmentImage, ReportSection } from './primitives';
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

type ViewKey =
    | 'childcare'
    | 'attendance'
    | 'guest'
    | 'security'
    | 'transfer'
    | 'service'
    | 'incident'
    | 'witty'
    | 'internship'
    | 'pru'
    | 'welfare'
    | 'protocol';

const VIEWS: Record<ViewKey, React.FC<{ data: AnyReport }>> = {
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

// Match a (possibly drifting) backend reportType string to a known view.
const matchByType = (reportType?: string): ViewKey | null => {
    if (!reportType) return null;
    const t = reportType.toLowerCase().replace(/[^a-z]/g, '');
    if (t.includes('childcare') || t.includes('children')) return 'childcare';
    if (t.includes('attendance') || t.includes('ushery') || t.includes('ushering')) return 'attendance';
    if (t.includes('guest') || t.includes('pcu')) return 'guest';
    if (t.includes('security') || t.includes('traffic') || t.includes('surveillance')) return 'security';
    if (t.includes('transfer') || t.includes('cts')) return 'transfer';
    if (t.includes('service') || t.includes('programme') || t.includes('program')) return 'service';
    if (t.includes('incident')) return 'incident';
    if (t.includes('witty')) return 'witty';
    if (t.includes('internship')) return 'internship';
    if (t.includes('pru') || t.includes('publicrelations')) return 'pru';
    if (t.includes('welfare') || t.includes('specialneeds')) return 'welfare';
    if (t.includes('protocol')) return 'protocol';
    return null;
};

// Fallback when reportType is missing/unknown: infer from the data shape.
const matchByShape = (data?: AnyReport): ViewKey | null => {
    if (!data) return null;
    if (data.age1_2 || data.age6_11 || data.age12_above) return 'childcare';
    if (data.maleGuestCount != null || data.femaleGuestCount != null) return 'attendance';
    if (data.firstTimersCount != null || data.newConvertsCount != null) return 'guest';
    if (Array.isArray(data.locations) && data.locations[0] && 'carCount' in data.locations[0]) return 'security';
    if (Array.isArray(data.locations) && data.locations[0] && 'adultCount' in data.locations[0]) return 'transfer';
    if (data.serviceStartTime != null || data.serviceReportLink != null) return 'service';
    if (Array.isArray(data.socialMediaPosts) || data.onlineConvertsCount != null || data.onlineFirstTimersCount != null)
        return 'witty';
    if (data.classMemberCount != null || data.classTaken != null || data.convertsCompletedClassCount != null)
        return 'internship';
    if (data.enquiryCount != null || data.vehicleDedicationCount != null || data.praiseReportDeskCount != null)
        return 'pru';
    if (data.medicalSupportCount != null || data.aidRequestCount != null || data.medicalIncident != null)
        return 'welfare';
    if (data.incidentCount != null || data.specialGuestCount != null || data.theft != null) return 'protocol';
    if (data.incident != null || data.details != null) return 'incident';
    return null;
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
    const key = matchByType(reportType) ?? matchByShape(data);
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
