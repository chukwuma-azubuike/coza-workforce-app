import { IReportStatus } from '@store/types';
import type { LogicalRole } from './report-actions';

export type ReportStatusTone = 'pending' | 'change-requested' | 'approved' | 'cp-returned' | 'cp-approved' | 'gsp-approved' | 'info';

export interface IReportStatusMeta {
    tone: ReportStatusTone;
    label: string;
    accentClass: string;
    containerClass: string;
    dotClass: string;
    textClass: string;
}

export const REPORT_STATUS_META: Record<string, IReportStatusMeta> = {
    [IReportStatus.HOD_SUBMITTED]: {
        tone: 'pending',
        label: 'Pending',
        accentClass: 'bg-amber-600',
        containerClass: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700 dark:text-amber-400',
    },
    [IReportStatus.GH_CHANGE_REQUESTED]: {
        tone: 'change-requested',
        label: 'Change Requested',
        accentClass: 'bg-yellow-500',
        containerClass: 'bg-[#FFF4D6] dark:bg-yellow-900/20 border border-[#F0D080] dark:border-yellow-700',
        dotClass: 'bg-[#D4860A]',
        textClass: 'text-[#7A4F01] dark:text-yellow-400',
    },
    [IReportStatus.GH_APPROVED]: {
        tone: 'approved',
        label: 'Approved (With CP)',
        accentClass: 'bg-blue-500',
        containerClass: 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-700 dark:text-blue-400',
    },
    [IReportStatus.CP_CHANGE_REQUESTED]: {
        tone: 'cp-returned',
        label: 'CP Returned',
        accentClass: 'bg-red-500',
        containerClass: 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        dotClass: 'bg-red-500',
        textClass: 'text-red-700 dark:text-red-400',
    },
    [IReportStatus.CP_APPROVED]: {
        tone: 'cp-approved',
        label: 'CP Approved',
        accentClass: 'bg-indigo-500',
        containerClass: 'bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800',
        dotClass: 'bg-indigo-500',
        textClass: 'text-indigo-700 dark:text-indigo-400',
    },
    [IReportStatus.GSP_CHANGE_REQUESTED]: {
        tone: 'change-requested',
        label: 'GSP Returned',
        accentClass: 'bg-orange-500',
        containerClass: 'bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700 dark:text-orange-400',
    },
    [IReportStatus.GSP_APPROVED]: {
        tone: 'gsp-approved',
        label: 'GSP Approved',
        accentClass: 'bg-green-600',
        containerClass: 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        dotClass: 'bg-green-600',
        textClass: 'text-green-700 dark:text-green-400',
    },
    [IReportStatus.DRAFT]: {
        tone: 'info',
        label: 'Draft',
        accentClass: 'bg-zinc-400',
        containerClass: 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
        dotClass: 'bg-zinc-400',
        textClass: 'text-zinc-600 dark:text-zinc-400',
    },
    // legacy fallbacks
    [IReportStatus.PENDING]: {
        tone: 'pending',
        label: 'Pending',
        accentClass: 'bg-amber-600',
        containerClass: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700 dark:text-amber-400',
    },
    [IReportStatus.SUBMITTED]: {
        tone: 'approved',
        label: 'Submitted',
        accentClass: 'bg-blue-500',
        containerClass: 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-700 dark:text-blue-400',
    },
    [IReportStatus.GSP_SUBMITTED]: {
        tone: 'cp-approved',
        label: 'GSP Submitted',
        accentClass: 'bg-indigo-500',
        containerClass: 'bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800',
        dotClass: 'bg-indigo-500',
        textClass: 'text-indigo-700 dark:text-indigo-400',
    },
    [IReportStatus.APPROVED]: {
        tone: 'gsp-approved',
        label: 'Approved',
        accentClass: 'bg-green-600',
        containerClass: 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        dotClass: 'bg-green-600',
        textClass: 'text-green-700 dark:text-green-400',
    },
    [IReportStatus.REVIEW_REQUESTED]: {
        tone: 'change-requested',
        label: 'Review Requested',
        accentClass: 'bg-yellow-500',
        containerClass: 'bg-[#FFF4D6] dark:bg-yellow-900/20 border border-[#F0D080] dark:border-yellow-700',
        dotClass: 'bg-[#D4860A]',
        textClass: 'text-[#7A4F01] dark:text-yellow-400',
    },
};

export function getReportStatusMeta(status: string): IReportStatusMeta {
    return (
        REPORT_STATUS_META[status] ?? {
            tone: 'info',
            label: status,
            accentClass: 'bg-zinc-400',
            containerClass: 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
            dotClass: 'bg-zinc-400',
            textClass: 'text-zinc-600 dark:text-zinc-400',
        }
    );
}

// ─── Tone palette (for building role-aware overrides) ───────────────────────
// Each entry is the full meta for a visual tone, used as the colour base when
// we override just the label for a specific role.
const TONE_META: Record<string, Omit<IReportStatusMeta, 'label'>> = {
    // ⚡ amber — "this role needs to act right now"
    actionable: {
        tone: 'pending',
        accentClass: 'bg-amber-600',
        containerClass: 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-700 dark:text-amber-400',
    },
    // ↩ orange — "sent back / waiting on someone else"
    returned: {
        tone: 'change-requested',
        accentClass: 'bg-orange-500',
        containerClass: 'bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700 dark:text-orange-400',
    },
    // → blue — "in pipeline, moving forward"
    pipeline: {
        tone: 'approved',
        accentClass: 'bg-blue-500',
        containerClass: 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-700 dark:text-blue-400',
    },
    // ↗ indigo — "forwarded, past this role"
    forwarded: {
        tone: 'cp-approved',
        accentClass: 'bg-indigo-500',
        containerClass: 'bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800',
        dotClass: 'bg-indigo-500',
        textClass: 'text-indigo-700 dark:text-indigo-400',
    },
    // ✓ green — terminal approval
    done: {
        tone: 'gsp-approved',
        accentClass: 'bg-green-600',
        containerClass: 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        dotClass: 'bg-green-600',
        textClass: 'text-green-700 dark:text-green-400',
    },
    // — gray — not started / not yet in this role's pipeline
    idle: {
        tone: 'info',
        accentClass: 'bg-zinc-400',
        containerClass: 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
        dotClass: 'bg-zinc-400',
        textClass: 'text-zinc-600 dark:text-zinc-400',
    },
};

const m = (label: string, toneKey: keyof typeof TONE_META): IReportStatusMeta => {
    const t = TONE_META[toneKey]!;
    return { label, tone: t.tone, accentClass: t.accentClass, containerClass: t.containerClass, dotClass: t.dotClass, textClass: t.textClass };
};

// ─── Role-aware status interpretations ─────────────────────────────────────
// Answers "what does this status mean for ME right now?" per role.
// ⚡ actionable (amber) = this role must act. Idle (gray) = not at their stage.
type RoleStatusMap = Partial<Record<string, IReportStatusMeta>>;

const ROLE_STATUS_MAP: Partial<Record<LogicalRole, RoleStatusMap>> = {
    HOD: {
        [IReportStatus.DRAFT]:                m('Not started',        'idle'),
        [IReportStatus.HOD_SUBMITTED]:         m('Under GH review',    'pipeline'),
        [IReportStatus.GH_CHANGE_REQUESTED]:   m('Changes needed',     'actionable'),  // ⚡
        [IReportStatus.GH_APPROVED]:           m('With Campus Pastor', 'forwarded'),
        [IReportStatus.CP_CHANGE_REQUESTED]:   m('Changes needed',     'actionable'),  // ⚡ GH may push back
        [IReportStatus.CP_APPROVED]:           m('With GSP',           'forwarded'),
        [IReportStatus.GSP_CHANGE_REQUESTED]:  m('Changes needed',     'actionable'),  // ⚡
        [IReportStatus.GSP_APPROVED]:          m('Fully approved',     'done'),
    },
    AHOD: {
        [IReportStatus.DRAFT]:                m('Not started',        'idle'),
        [IReportStatus.HOD_SUBMITTED]:         m('Under GH review',    'pipeline'),
        [IReportStatus.GH_CHANGE_REQUESTED]:   m('Changes needed',     'actionable'),
        [IReportStatus.GH_APPROVED]:           m('With Campus Pastor', 'forwarded'),
        [IReportStatus.CP_CHANGE_REQUESTED]:   m('Changes needed',     'actionable'),
        [IReportStatus.CP_APPROVED]:           m('With GSP',           'forwarded'),
        [IReportStatus.GSP_CHANGE_REQUESTED]:  m('Changes needed',     'actionable'),
        [IReportStatus.GSP_APPROVED]:          m('Fully approved',     'done'),
    },
    GROUP_HEAD: {
        [IReportStatus.DRAFT]:                m('Not submitted',      'idle'),
        [IReportStatus.HOD_SUBMITTED]:         m('Needs your review',  'actionable'),  // ⚡
        [IReportStatus.GH_CHANGE_REQUESTED]:   m('Awaiting HOD',       'returned'),
        [IReportStatus.GH_APPROVED]:           m('Forwarded to CP',    'forwarded'),
        [IReportStatus.CP_CHANGE_REQUESTED]:   m('Returned by CP',     'actionable'),  // ⚡
        [IReportStatus.CP_APPROVED]:           m('With GSP',           'forwarded'),
        [IReportStatus.GSP_CHANGE_REQUESTED]:  m('GSP returned to CP', 'idle'),
        [IReportStatus.GSP_APPROVED]:          m('Fully approved',     'done'),
    },
    CAMPUS_PASTOR: {
        [IReportStatus.DRAFT]:                m('Pending',            'idle'),
        [IReportStatus.HOD_SUBMITTED]:         m('Pending',            'idle'),
        [IReportStatus.GH_CHANGE_REQUESTED]:   m('Pending',            'idle'),
        [IReportStatus.GH_APPROVED]:           m('Needs your review',  'actionable'),  // ⚡
        [IReportStatus.CP_CHANGE_REQUESTED]:   m('Changes requested',  'returned'),
        [IReportStatus.CP_APPROVED]:           m('Forwarded to GSP',   'forwarded'),
        [IReportStatus.GSP_CHANGE_REQUESTED]:  m('Re-submit to GSP',   'actionable'),  // ⚡
        [IReportStatus.GSP_APPROVED]:          m('Fully approved',     'done'),
    },
    GSP: {
        [IReportStatus.DRAFT]:                m('Pending',            'idle'),
        [IReportStatus.HOD_SUBMITTED]:         m('Pending',            'idle'),
        [IReportStatus.GH_CHANGE_REQUESTED]:   m('Pending',            'idle'),
        [IReportStatus.GH_APPROVED]:           m('Pending',            'idle'),
        [IReportStatus.CP_CHANGE_REQUESTED]:   m('Pending',            'idle'),
        [IReportStatus.CP_APPROVED]:           m('Awaiting your review', 'actionable'), // ⚡
        [IReportStatus.GSP_CHANGE_REQUESTED]:  m('Changes requested',  'returned'),
        [IReportStatus.GSP_APPROVED]:          m('Approved',           'done'),
    },
};

// Legacy value normalisation — map old statuses to v2 equivalents before lookup.
const LEGACY_NORM: Partial<Record<string, IReportStatus>> = {
    [IReportStatus.PENDING]:          IReportStatus.HOD_SUBMITTED,
    [IReportStatus.SUBMITTED]:        IReportStatus.GH_APPROVED,
    [IReportStatus.GSP_SUBMITTED]:    IReportStatus.CP_APPROVED,
    [IReportStatus.APPROVED]:         IReportStatus.GSP_APPROVED,
    [IReportStatus.REVIEW_REQUESTED]: IReportStatus.GH_CHANGE_REQUESTED,
};

/**
 * Returns status display metadata contextualised for the current user's role.
 * ⚡ Actionable states render amber to signal "you need to act."
 *    Idle states render gray — "not at your stage yet."
 * Falls back to the global `getReportStatusMeta` when no override exists.
 */
export function getRoleAwareStatusMeta(
    status: string,
    role: LogicalRole | null | undefined
): IReportStatusMeta {
    if (!role) return getReportStatusMeta(status);
    const normalised = LEGACY_NORM[status] ?? (status as IReportStatus);
    return ROLE_STATUS_MAP[role]?.[normalised] ?? getReportStatusMeta(status);
}
