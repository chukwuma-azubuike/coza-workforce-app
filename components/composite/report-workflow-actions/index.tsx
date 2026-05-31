import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import ReportCommentSheet from '@components/composite/report-comment-sheet';
import useRole from '@hooks/role';
import useModal from '@hooks/modal/useModal';
import { useTransitionReportMutation } from '@store/services/grouphead';
import { IReportStatus } from '@store/types';
import { actionsFor, makeIdempotencyKey, toLogicalRole, transitionErrorMessage, ReportAction } from '@constants/report-actions';

interface ReportWorkflowActionsProps {
    reportId?: string;
    reportType?: string;
    status?: IReportStatus | string;
    // Latest note per stage, surfaced to the reviewing role for context.
    ghComment?: string | null;
    pastorComment?: string | null;
    gspComment?: string | null;
}

const NoteCard: React.FC<{ label: string; comment: string }> = ({ label, comment }) => (
    <View className="rounded-2xl border border-border bg-muted-background p-4 gap-1.5">
        <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</Text>
        <Text className="!text-[13px] text-foreground leading-snug">"{comment}"</Text>
    </View>
);

/**
 * Drives the per-report review actions for the Campus Pastor and GSP roles via the
 * unified /transition endpoint. HOD submit/resubmit stays in the report forms (it
 * must save report data first); this component renders nothing for HOD/AHOD/GH.
 */
const ReportWorkflowActions: React.FC<ReportWorkflowActionsProps> = ({
    reportId,
    reportType,
    status,
    ghComment,
    pastorComment,
    gspComment,
}) => {
    const { isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP } = useRole();
    const role = toLogicalRole({ isHOD, isAHOD, isGroupHead, isCampusPastor, isGSP });
    const { setModalState } = useModal();

    const [pendingCommentAction, setPendingCommentAction] = useState<ReportAction | null>(null);
    const [transition, { isLoading }] = useTransitionReportMutation();

    const actions = useMemo(() => actionsFor(status as IReportStatus, role), [status, role]);

    const isReviewer = role === 'CAMPUS_PASTOR' || role === 'GSP';
    const isHodLike = role === 'HOD' || role === 'AHOD';

    // HOD/AHOD don't act here (the form's own button saves data + resubmits), but
    // they should see why the report came back. Render just the return note.
    if (isHodLike) {
        if (status === IReportStatus.GH_CHANGE_REQUESTED && ghComment) {
            return (
                <View className="gap-4">
                    <NoteCard label="Group Head requested changes" comment={ghComment} />
                </View>
            );
        }
        return null;
    }

    if (!isReviewer || !reportId) return null;

    const runAction = async (action: ReportAction, comment?: string) => {
        try {
            await transition({
                reportId,
                reportType,
                toStatus: action.toStatus,
                comment,
                idempotencyKey: makeIdempotencyKey(),
            }).unwrap();
            setPendingCommentAction(null);
            setModalState({ status: 'success', message: `Report ${action.variant === 'approve' ? 'approved' : 'returned'}` });
            router.back();
        } catch (err) {
            const info = transitionErrorMessage(err);
            setPendingCommentAction(null);
            setModalState({ status: info.isValidation ? 'info' : 'error', message: info.message });
            if (info.shouldRefresh) router.back();
        }
    };

    const onActionPress = (action: ReportAction) => {
        if (action.requireComment) {
            setPendingCommentAction(action);
            return;
        }
        runAction(action);
    };

    // Surface the relevant upstream note for the reviewing role.
    const noteForRole =
        role === 'CAMPUS_PASTOR' && status === IReportStatus.GSP_CHANGE_REQUESTED && gspComment
            ? { label: 'GSP requested changes', comment: gspComment }
            : role === 'GSP' && pastorComment
              ? { label: 'Campus Pastor note', comment: pastorComment }
              : ghComment && role === 'CAMPUS_PASTOR'
                ? { label: 'Group Head note', comment: ghComment }
                : null;

    return (
        <View className="gap-4">
            {noteForRole && <NoteCard label={noteForRole.label} comment={noteForRole.comment} />}

            {actions.length > 0 && (
                <View className="flex-row gap-3">
                    {actions.map(action => (
                        <Button
                            key={action.toStatus + action.label}
                            variant={action.variant === 'approve' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            disabled={isLoading}
                            isLoading={isLoading}
                            startIcon={
                                <Ionicons
                                    name={action.variant === 'approve' ? 'checkmark' : 'create-outline'}
                                    size={15}
                                    color={action.variant === 'approve' ? 'white' : '#71717a'}
                                />
                            }
                            onPress={() => onActionPress(action)}
                        >
                            {action.label}
                        </Button>
                    ))}
                </View>
            )}

            <ReportCommentSheet
                visible={pendingCommentAction !== null}
                title={pendingCommentAction?.label ?? 'Request Changes'}
                placeholder="Explain what needs to be changed…"
                submitLabel={pendingCommentAction?.label ?? 'Submit'}
                isLoading={isLoading}
                onClose={() => setPendingCommentAction(null)}
                onSubmit={comment => pendingCommentAction && runAction(pendingCommentAction, comment)}
            />
        </View>
    );
};

export default ReportWorkflowActions;
