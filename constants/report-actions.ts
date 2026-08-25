import { IReportStatus, AwaitingRole } from '@store/types';
import { extractApiError } from '@utils/index';

// ─── Logical roles ──────────────────────────────────────────────────────────
// The app's ROLES enum maps onto these five workflow actors. Map once, centrally,
// so action rendering never branches on raw role strings.
export type LogicalRole = 'HOD' | 'AHOD' | 'GROUP_HEAD' | 'CAMPUS_PASTOR' | 'GSP';

export interface ReportAction {
    label: string;
    toStatus: IReportStatus;
    requireComment: boolean;
    variant: 'approve' | 'reject';
}

// ─── Status × role → available actions ──────────────────────────────────────
// Single source of truth for "what buttons, what toStatus, comment required?".
// Drive every action bar off actionsFor() rather than scattering if-statements.
export const ACTIONS: Partial<Record<IReportStatus, Partial<Record<LogicalRole, ReportAction[]>>>> = {
    [IReportStatus.DRAFT]: {
        HOD: [{ label: 'Submit for review', toStatus: IReportStatus.HOD_SUBMITTED, requireComment: false, variant: 'approve' }],
        AHOD: [{ label: 'Submit for review', toStatus: IReportStatus.HOD_SUBMITTED, requireComment: false, variant: 'approve' }],
    },
    [IReportStatus.HOD_SUBMITTED]: {
        GROUP_HEAD: [
            { label: 'Approve', toStatus: IReportStatus.GH_APPROVED, requireComment: false, variant: 'approve' },
            { label: 'Request changes', toStatus: IReportStatus.GH_CHANGE_REQUESTED, requireComment: true, variant: 'reject' },
        ],
    },
    [IReportStatus.GH_CHANGE_REQUESTED]: {
        HOD: [{ label: 'Resubmit', toStatus: IReportStatus.HOD_SUBMITTED, requireComment: false, variant: 'approve' }],
        AHOD: [{ label: 'Resubmit', toStatus: IReportStatus.HOD_SUBMITTED, requireComment: false, variant: 'approve' }],
    },
    [IReportStatus.GH_APPROVED]: {
        CAMPUS_PASTOR: [
            { label: 'Approve', toStatus: IReportStatus.CP_APPROVED, requireComment: false, variant: 'approve' },
            { label: 'Request changes', toStatus: IReportStatus.CP_CHANGE_REQUESTED, requireComment: true, variant: 'reject' },
        ],
    },
    [IReportStatus.CP_CHANGE_REQUESTED]: {
        GROUP_HEAD: [
            { label: 'Re-approve', toStatus: IReportStatus.GH_APPROVED, requireComment: false, variant: 'approve' },
            { label: 'Push back to HOD', toStatus: IReportStatus.GH_CHANGE_REQUESTED, requireComment: true, variant: 'reject' },
        ],
    },
    [IReportStatus.CP_APPROVED]: {
        GSP: [
            { label: 'Approve (final)', toStatus: IReportStatus.GSP_APPROVED, requireComment: false, variant: 'approve' },
            { label: 'Request changes', toStatus: IReportStatus.GSP_CHANGE_REQUESTED, requireComment: true, variant: 'reject' },
        ],
    },
    [IReportStatus.GSP_CHANGE_REQUESTED]: {
        CAMPUS_PASTOR: [{ label: 'Re-submit to GSP', toStatus: IReportStatus.CP_APPROVED, requireComment: false, variant: 'approve' }],
    },
    [IReportStatus.GSP_APPROVED]: {}, // terminal — no actions
};

// ─── Headless-GH routing (no Group Head) ──────────────────────────────────────
// When a department has no active Group Head the backend collapses the GH tier and
// the Campus Pastor becomes the first reviewer. The transitions differ from the
// normal table (Approve jumps straight to CP_APPROVED; a returned report comes
// back to the HOD, not a non-existent GH), so these entries REPLACE — not merge
// with — the normal entries for the two affected statuses. We detect the skip from
// the report's backend-authoritative `awaitingRole`, never from group membership.
const SKIPPED_GH_ACTIONS: Partial<Record<IReportStatus, Partial<Record<LogicalRole, ReportAction[]>>>> = {
    [IReportStatus.HOD_SUBMITTED]: {
        CAMPUS_PASTOR: [
            { label: 'Approve', toStatus: IReportStatus.CP_APPROVED, requireComment: false, variant: 'approve' },
            { label: 'Request changes', toStatus: IReportStatus.CP_CHANGE_REQUESTED, requireComment: true, variant: 'reject' },
        ],
    },
    [IReportStatus.CP_CHANGE_REQUESTED]: {
        HOD: [{ label: 'Resubmit', toStatus: IReportStatus.HOD_SUBMITTED, requireComment: false, variant: 'approve' }],
        AHOD: [{ label: 'Resubmit', toStatus: IReportStatus.HOD_SUBMITTED, requireComment: false, variant: 'approve' }],
    },
};

// True when the GH tier was skipped for this report — i.e. the report is awaiting a
// role that the normal table doesn't serve at this status. `awaitingRole` is the
// backend's source of truth; when it's absent (pre-rollout) this is always false so
// every report reads as normal-flow and nothing changes.
export function isGhTierSkipped(status: IReportStatus | string | undefined, awaitingRole?: AwaitingRole): boolean {
    return (
        (status === IReportStatus.HOD_SUBMITTED && awaitingRole === 'CAMPUS_PASTOR') ||
        (status === IReportStatus.CP_CHANGE_REQUESTED && awaitingRole === 'HOD')
    );
}

export function actionsFor(
    status: IReportStatus | string | undefined,
    role: LogicalRole | null,
    awaitingRole?: AwaitingRole
): ReportAction[] {
    if (!status || !role) return [];
    const table = isGhTierSkipped(status, awaitingRole) ? SKIPPED_GH_ACTIONS : ACTIONS;
    return table[status as IReportStatus]?.[role] ?? [];
}

// ─── Role flag → logical role ───────────────────────────────────────────────
// Accepts the boolean flags exposed by useRole(). Resolved highest-authority-first
// so a user only ever resolves to a single logical role.
export interface RoleFlags {
    isHOD?: boolean;
    isAHOD?: boolean;
    isGroupHead?: boolean;
    isCampusPastor?: boolean; // useRole() already folds campus coordinators into this
    isGSP?: boolean;
}

export function toLogicalRole(flags: RoleFlags): LogicalRole | null {
    if (flags.isGSP) return 'GSP';
    if (flags.isCampusPastor) return 'CAMPUS_PASTOR';
    if (flags.isGroupHead) return 'GROUP_HEAD';
    if (flags.isAHOD) return 'AHOD';
    if (flags.isHOD) return 'HOD';
    return null;
}

// ─── Transition error handling ──────────────────────────────────────────────
// Maps the /transition error codes (§4.3) into UI intent. Callers decide whether
// to refetch detail, refresh the list, hide the action, or show inline validation.
export interface TransitionErrorInfo {
    code: number | string;
    message: string;
    isValidation: boolean; // 422 — invalid toStatus / comment < 20
    isForbidden: boolean; // 403 — wrong role / not in group; hide the action
    shouldRefresh: boolean; // 400 / 404 / 409 — state moved or gone; refetch
}

const TRANSITION_MESSAGES: Record<number, string> = {
    422: 'Please provide a comment of at least 20 characters.',
    400: 'This report has already moved on. Refreshing…',
    403: 'You no longer have permission to act on this report.',
    404: 'This report could not be found. Refreshing the list…',
    409: 'Someone else just updated this report. Refreshing…',
};

export function transitionErrorMessage(err: unknown): TransitionErrorInfo {
    const code = (err as { status?: number | string })?.status ?? 0;
    const numeric = typeof code === 'number' ? code : 0;
    const message = extractApiError(err, TRANSITION_MESSAGES[numeric] ?? 'Could not update the report. Please try again.');
    return {
        code,
        message,
        isValidation: numeric === 422,
        isForbidden: numeric === 403,
        shouldRefresh: numeric === 400 || numeric === 404 || numeric === 409,
    };
}

// Client-side guard mirroring the backend's comment requirement.
export const TRANSITION_COMMENT_MIN = 20;

// Unique-per-attempt key for the Idempotency-Key header. Avoids the `uuid`
// package, which throws in React Native without a crypto.getRandomValues polyfill.
export const makeIdempotencyKey = (): string =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// ─── departmentName → reportType fallback ───────────────────────────────────
// The backend now stamps `reportType` onto each report document, so prefer that.
// This map is only a fallback for entry points that don't carry it through yet.
export const DEPARTMENT_TO_REPORT_TYPE: Record<string, string> = {
    'Children Ministry': 'ChildCareReport',
    'Ushery Board': 'AttendanceReport',
    PCU: 'GuestReport',
    'Traffic & Security': 'SecurityReport',
    'Digital Surveillance Security': 'SecurityReport',
    'COZA Transfer Service': 'TransferReport',
    'Programme Coordination': 'ServiceReport',
    'Witty Inventions': 'WittyReport',
    'COZA Internship': 'InternshipReport',
    'Public Relations Unit (PRU)': 'PruReport',
    'Welfare and Special Needs Assignment': 'WelfareReport',
    Protocol: 'ProtocolReport',
};

export function resolveReportType(params: { reportType?: string; departmentName?: string }): string | undefined {
    return params.reportType ?? (params.departmentName ? DEPARTMENT_TO_REPORT_TYPE[params.departmentName] : undefined);
}

// ─── Canonical report-pipeline departments (backend-validated) ──────────────
// The backend only accepts these exact `departmentName` spellings (case-sensitive)
// for departments that participate in the HOD→GH→CP→GSP pipeline, and pairs each
// 1:1 with a `reportType` enum value accepted by createDepartment/updateDepartment.
// Use this — not DEPARTMENT_TO_REPORT_TYPE above — as the source of truth when
// creating/editing a department, so the name can never drift from what the
// backend will actually seed reports for. ("Digital Surveillance Security" is a
// pre-existing department name that predates this validated list — see
// DEPARTMENT_TO_REPORT_TYPE — and is intentionally NOT offered here for new departments.)
export const REPORT_PIPELINE_DEPARTMENTS: { departmentName: string; reportType: string }[] = [
    { departmentName: 'Children Ministry', reportType: 'ChildCareReport' },
    { departmentName: 'Ushery Board', reportType: 'AttendanceReport' },
    { departmentName: 'PCU', reportType: 'GuestReport' },
    { departmentName: 'Traffic & Security', reportType: 'SecurityReport' },
    { departmentName: 'COZA Transfer Service', reportType: 'TransferReport' },
    { departmentName: 'Programme Coordination', reportType: 'ServiceReport' },
    { departmentName: 'COZA Internship', reportType: 'InternshipReport' },
    { departmentName: 'Welfare and Special Needs Assignment', reportType: 'WelfareReport' },
    { departmentName: 'Witty Inventions', reportType: 'WittyReport' },
    { departmentName: 'Public Relations Unit (PRU)', reportType: 'PruReport' },
    { departmentName: 'Protocol', reportType: 'ProtocolReport' },
];
