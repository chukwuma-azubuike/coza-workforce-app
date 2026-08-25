import React from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import ViewWrapper from '@components/layout/viewWrapper';
import ReportStatusPill from '@components/composite/report-status-pill';
import ReviewHistory from '@components/composite/review-history';
import { useGetGhReportDetailQuery } from '@store/services/grouphead';
import { cn } from '~/lib/utils';

// ─── Screen shell ───────────────────────────────────────────────────────────
// Consistent chrome for every report form: a header (service date + status pill)
// over a padded, scrollable, keyboard-aware body. Surfaces the full review
// history right up top, so the HOD sees what every reviewer said before they
// start editing. The HOD-facing report-fetch endpoints don't return
// reviewHistory yet, so this fetches it directly from the same `/gh/reports/:id`
// detail endpoint the GH/CP/GSP approvals screen already uses — if the backend
// denies a role/ownership check, the query just fails quietly and nothing renders.
export const ReportFormShell: React.FC<{
    updatedAt?: string | number;
    status?: string;
    reportId?: string;
    reportType?: string;
    children: React.ReactNode;
}> = ({ updatedAt, status, reportId, reportType, children }) => {
    const { data: detail } = useGetGhReportDetailQuery(
        { reportId: reportId as string, reportType },
        { skip: !reportId }
    );

    return (
        <ViewWrapper scroll avoidKeyboard noPadding>
            <View className="px-4 pt-3 pb-12 gap-4">
                <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-muted-foreground">
                        {dayjs(updatedAt || undefined).format('DD MMMM, YYYY')}
                    </Text>
                    {status ? <ReportStatusPill status={status} size="sm" /> : null}
                </View>
                <ReviewHistory history={detail?.reviewHistory} />
                {children}
            </View>
        </ViewWrapper>
    );
};

// ─── Section card ───────────────────────────────────────────────────────────
export const FormSection: React.FC<{ title?: string; description?: string; children: React.ReactNode }> = ({
    title,
    description,
    children,
}) => (
    <Card className="p-4 gap-4">
        {title ? (
            <View className="gap-0.5">
                <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</Text>
                {description ? <Text className="!text-[11px] text-muted-foreground">{description}</Text> : null}
            </View>
        ) : null}
        {children}
    </Card>
);

// ─── Field wrapper ──────────────────────────────────────────────────────────
export const Field: React.FC<{ label: string; error?: string; hint?: string; children: React.ReactNode }> = ({
    label,
    error,
    hint,
    children,
}) => (
    <View className="gap-1.5">
        <Text className="!text-[13px] font-semibold text-foreground">{label}</Text>
        {children}
        {error ? (
            <Text className="!text-[11px] text-red-500">{error}</Text>
        ) : hint ? (
            <Text className="!text-[11px] text-muted-foreground">{hint}</Text>
        ) : null}
    </View>
);

interface FieldProps {
    label: string;
    value?: string | number;
    onChangeText?: (v: string) => void;
    isDisabled?: boolean;
    placeholder?: string;
    error?: string;
    hint?: string;
}

export const NumberField: React.FC<FieldProps> = ({ label, value, onChangeText, isDisabled, placeholder = '0', error, hint }) => (
    <Field label={label} error={error} hint={hint}>
        <Input
            placeholder={placeholder}
            inputMode="numeric"
            keyboardType="numeric"
            isDisabled={isDisabled}
            value={`${value ?? ''}`}
            onChangeText={onChangeText}
        />
    </Field>
);

export const TextField: React.FC<FieldProps & { autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' }> = ({
    label,
    value,
    onChangeText,
    isDisabled,
    placeholder,
    autoCapitalize,
    error,
    hint,
}) => (
    <Field label={label} error={error} hint={hint}>
        <Input
            placeholder={placeholder}
            isDisabled={isDisabled}
            autoCapitalize={autoCapitalize}
            value={`${value ?? ''}`}
            onChangeText={onChangeText}
        />
    </Field>
);

export const TextAreaField: React.FC<FieldProps> = ({ label, value, onChangeText, isDisabled, placeholder, error, hint }) => (
    <Field label={label} error={error} hint={hint}>
        <Textarea
            placeholder={placeholder}
            isDisabled={isDisabled}
            value={value ? `${value}` : ''}
            onChangeText={onChangeText}
        />
    </Field>
);

// ─── Read-only computed stat strip (e.g. live totals) ───────────────────────
export const TotalChip: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({
    label,
    value,
    className,
}) => (
    <View className={cn('flex-1 rounded-xl bg-primary/10 dark:bg-primary/20 p-3 items-center', className)}>
        <Text className="text-3xl font-extrabold leading-none text-primary">{value}</Text>
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary mt-1">{label}</Text>
    </View>
);

// ─── Submit button ──────────────────────────────────────────────────────────
export const SubmitButton: React.FC<{ label: string; isLoading?: boolean; onPress: () => void }> = ({
    label,
    isLoading,
    onPress,
}) => (
    <Button className="h-12 rounded-xl" isLoading={isLoading} onPress={onPress}>
        {label}
    </Button>
);

// Compute the conventional HOD submit-button label from current status.
export const submitLabelForStatus = (status?: string): string => {
    if (status === 'GH_CHANGE_REQUESTED') return 'Resubmit';
    if (!status) return 'Submit';
    return 'Update';
};

// ─── Param helpers ──────────────────────────────────────────────────────────
// Reports with nested data travel through expo-router as a JSON `data` string
// (nested arrays/objects don't survive plain param serialization). These helpers
// let any form decode that uniformly and guard nested fields against a value
// that arrived mangled (e.g. a stringified array).
export const readReportParams = <T,>(raw: { data?: string } & Record<string, any>): T => {
    return raw?.data ? (JSON.parse(raw.data) as T) : (raw as unknown as T);
};

export const coerceArray = <T,>(value: any, fallback: T[]): T[] => {
    let v = value;
    if (typeof v === 'string') {
        try {
            v = JSON.parse(v);
        } catch {
            v = undefined;
        }
    }
    return Array.isArray(v) && v.length ? (v as T[]) : fallback;
};
