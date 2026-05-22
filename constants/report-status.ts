import { IReportStatus } from '@store/types';

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
