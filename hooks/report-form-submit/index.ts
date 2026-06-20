import { router } from 'expo-router';

import useRole from '@hooks/role';
import useModal from '@hooks/modal/useModal';
import { useTransitionReportMutation } from '@store/services/grouphead';
import { AwaitingRole, IReportStatus } from '@store/types';
import {
    actionsFor,
    makeIdempotencyKey,
    resolveReportType,
    toLogicalRole,
    transitionErrorMessage,
} from '@constants/report-actions';

type UpdateTrigger = (body: any) => { unwrap: () => Promise<any> } | Promise<{ data?: unknown; error?: any }>;

interface ReportFormParams {
    _id?: string;
    status?: IReportStatus | string;
    reportType?: string;
    departmentName?: string;
    // Backend-authoritative role this report is waiting on — needed to detect the
    // headless-GH path, where a HOD resubmits directly from CP_CHANGE_REQUESTED.
    awaitingRole?: AwaitingRole;
}

/**
 * Centralises the HOD data-save + workflow-submit flow shared by every department
 * report form. Saves report data via the legacy update endpoint **without** a
 * `status` (the backend no longer reads it), then — when the current role/status
 * permits — submits or resubmits the report via the unified `/transition` endpoint.
 */
export function useReportFormSubmit(updateReport: UpdateTrigger, params: ReportFormParams) {
    const { isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP, user } = useRole();
    const role = toLogicalRole({ isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP });
    const reportType = resolveReportType({ reportType: params.reportType, departmentName: params.departmentName });
    const { setModalState } = useModal();
    const [transitionReport, { isLoading: isTransitioning }] = useTransitionReportMutation();

    // Only HOD/AHOD move the report into review; everyone else just saves data.
    const submitAction = actionsFor(
        (params.status as IReportStatus) ?? IReportStatus.DRAFT,
        role,
        params.awaitingRole
    ).find(a => a.toStatus === IReportStatus.HOD_SUBMITTED);

    const submit = async (values: any) => {
        delete (values as any).__EXPO_ROUTER_key;
        // Strip workflow fields — status is no longer written via this endpoint.
        const { status: _status, pastorComment: _pastorComment, ...payload } = values;

        const res = await (updateReport({ ...payload, userId: user?.userId }) as Promise<{
            data?: unknown;
            error?: any;
        }>);

        if (res && 'error' in res && res.error) {
            setModalState({
                defaultRender: true,
                status: 'error',
                message: res.error?.data?.message || 'Something went wrong!',
            });
            return;
        }

        if (submitAction && params._id) {
            try {
                await transitionReport({
                    reportId: params._id,
                    reportType,
                    toStatus: submitAction.toStatus,
                    idempotencyKey: makeIdempotencyKey(),
                }).unwrap();
            } catch (err) {
                setModalState({ status: 'error', message: transitionErrorMessage(err).message });
                return;
            }
        }

        setModalState({
            defaultRender: true,
            status: 'success',
            message: submitAction ? 'Report submitted for review' : 'Report updated',
        });
        router.back();
    };

    return { submit, isTransitioning, role, reportType, submitAction };
}
