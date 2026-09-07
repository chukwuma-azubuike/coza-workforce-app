// ─── Report kind → form route ────────────────────────────────────────────────
// One resolver for "which report is this?", shared by the read-only report views
// and by the edit path out of the approvals detail screen. Kept free of React so
// both a component tree and a navigation handler can call it.
//
// The backend's `reportType` strings have drifted before (ChildCareReport vs
// ChildcareReport vs a bare department name), so matching is deliberately fuzzy
// and falls back to the data's own shape when the type is missing entirely.

export type ReportKey =
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

type AnyReport = any;

/** Match a (possibly drifting) backend reportType or department name to a known report kind. */
export const matchReportKeyByType = (reportType?: string): ReportKey | null => {
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

/** Fallback when reportType is missing/unknown: infer the kind from the data shape. */
export const matchReportKeyByShape = (data?: AnyReport): ReportKey | null => {
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

/**
 * Resolve a report to its kind, trying the most reliable signal first:
 * explicit reportType, then the department it came from, then the data itself.
 */
export const resolveReportKey = (args: {
    reportType?: string;
    departmentName?: string;
    data?: AnyReport;
}): ReportKey | null =>
    matchReportKeyByType(args.reportType) ??
    matchReportKeyByType(args.departmentName) ??
    matchReportKeyByShape(args.data);

// ─── Editable form routes ────────────────────────────────────────────────────
// The `/reports/*` screens are editable forms, unlike `/gh-approvals/report-detail`
// which is read-only. Every kind above has one.
const FORM_ROUTES: Record<ReportKey, string> = {
    childcare: '/reports/childcare-report',
    attendance: '/reports/attendance-report',
    guest: '/reports/guest-report',
    security: '/reports/security-report',
    transfer: '/reports/transfer-report',
    service: '/reports/service-report',
    incident: '/reports/incident-report',
    witty: '/reports/witty-report',
    internship: '/reports/internship-report',
    pru: '/reports/pru-report',
    welfare: '/reports/welfare-report',
    protocol: '/reports/protocol-report',
};

// Forms whose payload has nested arrays/objects. Plain expo-router params flatten
// every value to a string, so `locations: [{…}]` would arrive as "[object Object]"
// and the form would render empty rows over real data. These four decode a JSON
// `data` param instead — and only these four, so the rest must NOT be sent one.
const NESTED_PARAM_KEYS: ReadonlySet<ReportKey> = new Set<ReportKey>(['childcare', 'security', 'transfer', 'witty']);

export const reportFormRoute = (key: ReportKey | null): string | null => (key ? FORM_ROUTES[key] : null);

// Fields that exist for review, not for editing. They are dropped before a report
// is handed to a form because the form posts its whole value object back to the
// update endpoint — `reviewHistory` in particular is an ever-growing array that
// has no business making a round trip through a URL param.
const NON_EDITABLE_FIELDS = ['reviewHistory', 'awaitingRole', '__v'] as const;

/**
 * Build the navigation params a report form expects, in the shape that form reads.
 * Returns `null` when the report can't be matched to a form, so a caller can hide
 * the edit affordance rather than push a route that renders a blank form.
 */
export const buildReportFormParams = (args: {
    reportType?: string;
    departmentName?: string;
    report?: AnyReport;
}): { pathname: string; params: Record<string, any> } | null => {
    const key = resolveReportKey({
        reportType: args.reportType,
        departmentName: args.departmentName,
        data: args.report,
    });
    const pathname = reportFormRoute(key);
    if (!key || !pathname) return null;

    const payload: Record<string, any> = {};
    // Skip empty values rather than pass them through: expo-router stringifies every
    // param, so an absent field would reach the form as the literal "undefined" and
    // render as text in an input.
    Object.entries(args.report ?? {}).forEach(([field, value]) => {
        if (value !== undefined && value !== null) payload[field] = value;
    });
    NON_EDITABLE_FIELDS.forEach(field => delete payload[field]);
    // Bracket access: `payload` is an index-signature record (noPropertyAccessFromIndexSignature).
    if (args.departmentName && !payload['departmentName']) payload['departmentName'] = args.departmentName;
    if (args.reportType && !payload['reportType']) payload['reportType'] = args.reportType;

    return {
        pathname,
        params: NESTED_PARAM_KEYS.has(key) ? { data: JSON.stringify(payload) } : payload,
    };
};
