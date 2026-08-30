import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Formik, FormikProps } from 'formik';
import * as Haptics from 'expo-haptics';
import RNDatePicker from 'react-native-date-picker';

import { Text } from '~/components/ui/text';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import FormErrorMessage from '~/components/ui/error-message';
import { cn } from '~/lib/utils';
import { Guest, ICreateReminderPayload, IRoastReminder } from '~/store/types';
import { useCreateReminderMutation, useUpdateReminderMutation } from '~/store/services/roast-engagement';
import { localTimezone } from '~/hooks/roast-engagement';
import { useMirrorTarget } from '~/hooks/roast-engagement/use-reminder-mirror';
import {
    ALARM_FALLBACK_PROVIDER,
    MIRROR_LABELS,
    MIRROR_PROVIDER,
    availableProviders,
    resolveMirrorTarget,
} from '~/utils/device-mirror';
import { ReminderFormValidationSchema } from '../utils/validation';
import { availableQuickTimes, quickTimeKeyFor } from './quick-times';

dayjs.extend(relativeTime);

interface IReminderFormValues {
    guestId: string;
    dueAt: string;
    note: string;
}

/**
 * "Also add to my phone" — the one control here whose options depend on the time above it.
 *
 * `value` is the worker's *intent* and is handed straight back out unchanged. What the
 * chips reflect is `resolveMirrorTarget(value, dueAt)`: the provider that will actually be
 * written. The two differ in exactly one case — an alarm preference on a reminder more
 * than a day out — and rendering the intent there would show "Alarm" selected on a
 * reminder that is about to get a calendar entry.
 *
 * Extracted from the sheet's render prop rather than inlined into it, because it is the
 * only part of that tree with logic of its own and it was five indents deep.
 */
const MirrorPicker: React.FC<{
    dueAt: string;
    value: MIRROR_PROVIDER | null;
    onChange: (provider: MIRROR_PROVIDER | null) => void;
    /** An alarm already on the clock for this reminder, for content that has since changed. */
    strandedAlarm?: boolean;
}> = ({ dueAt, value, onChange, strandedAlarm }) => {
    const resolved = resolveMirrorTarget(value, dueAt);
    const fellBack = value === MIRROR_PROVIDER.ANDROID_ALARM && resolved === ALARM_FALLBACK_PROVIDER;

    return (
        <View className="gap-2 pt-2">
            <Text className="!text-xs text-muted-foreground">Also add to my phone</Text>

            <View className="flex-row flex-wrap gap-2">
                {[null, ...availableProviders(dueAt)].map(provider => {
                    const isSelected = resolved === provider;

                    return (
                        <TouchableOpacity
                            key={provider ?? 'none'}
                            activeOpacity={0.6}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            onPress={() => {
                                Haptics.selectionAsync();
                                onChange(provider);
                            }}
                            className={cn(
                                'h-10 px-4 rounded-full border justify-center',
                                isSelected ? 'bg-primary border-primary' : 'border-border'
                            )}
                        >
                            <Text className={cn('!text-sm', isSelected && 'text-primary-foreground dark:text-white')}>
                                {provider ? MIRROR_LABELS[provider] : 'Just Roast'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* The fallback is announced. A standing preference that quietly does something
                else is indistinguishable, from the worker's side, from one that is broken. */}
            {fellBack && (
                <Text className="!text-[11px] text-amber-600 dark:text-amber-500">
                    An alarm can&apos;t hold a date, so it only works for something due within a day. This one goes to
                    your calendar instead.
                </Text>
            )}

            {/* Disclosed, because the leftover is the worker's to deal with and they will
                otherwise meet it at the old time with no idea where it came from. */}
            {strandedAlarm && (
                <Text className="!text-[11px] text-amber-600 dark:text-amber-500">
                    {resolved === MIRROR_PROVIDER.ANDROID_ALARM
                        ? "Saving sets a new alarm at the new time. The one already on your clock stays there — Roast can't remove it, so dismiss that one yourself."
                        : "The alarm you set earlier stays on your clock at the old time. Roast can't remove it, so dismiss that one yourself."}
                </Text>
            )}

            {/* Said plainly, because the alternative is a worker editing the copy on their
                phone and wondering why Roast never heard about it. */}
            {!!resolved && (
                <Text className="!text-[11px] text-muted-foreground">
                    {resolved === MIRROR_PROVIDER.ANDROID_ALARM
                        ? "Your clock app will ring. Roast can't cancel that alarm later — you'll dismiss it yourself."
                        : "A copy, not a link. Changes you make there won't reach Roast."}
                </Text>
            )}
        </View>
    );
};

interface ReminderSheetProps {
    visible: boolean;
    guest: Pick<Guest, '_id' | 'firstName' | 'lastName'>;
    /** Present → edit. Absent → create. The two differ by four lines; splitting them would drift. */
    reminder?: IRoastReminder;
    onClose: () => void;
    onSaved?: (reminder: IRoastReminder) => void;
}

/**
 * Set a reminder on a guest (US-2.1), and edit one (US-2.5).
 *
 * Built on `Modal` + `Animated` rather than reanimated: `entering` / `exiting` / `layout`
 * props trigger a native `dispatchGetDisplayList` NPE on Android under Fabric in this app,
 * with no JS stack to debug from. `Animated` transforms are a different subsystem and are
 * safe. See `05_UX_SPEC.md §9` — this ban applies to every new screen in the feature.
 */
const ReminderSheet: React.FC<ReminderSheetProps> = ({ visible, guest, reminder, onClose, onSaved }) => {
    const isEditing = !!reminder;
    const slideAnim = useRef(new Animated.Value(400)).current;
    const [pickerOpen, setPickerOpen] = useState(false);
    const formikRef = useRef<FormikProps<IReminderFormValues>>(null);

    /**
     * Bumped every time the sheet is *opened*, and used as the Formik `key`.
     *
     * `enableReinitialize` alone does not reset this form: `initialValues` for a new
     * reminder is the same `{ dueAt: '', note: '' }` every time, so Formik correctly
     * decides nothing has changed and keeps whatever was last typed. Closing the sheet
     * after setting a reminder and opening it on the next guest would then show the
     * previous guest's note and their chosen time already selected.
     *
     * Keyed on open rather than on `visible`, so the remount does not blank the fields
     * mid-slide-out on the way *closed*.
     */
    const [openSession, setOpenSession] = useState(0);

    /** Write-only. Its only job is to re-render so the clock-relative text is re-read. */
    const [, setClockTick] = useState(0);

    const [createReminder, { isLoading: creating }] = useCreateReminderMutation();
    const [updateReminder, { isLoading: updating }] = useUpdateReminderMutation();
    const isSaving = creating || updating;

    const { applyMirror, mirrorDefault, mirrorFor } = useMirrorTarget();

    /**
     * Which device store this reminder also goes to, if any.
     *
     * Seeded from the worker's default on a new reminder, and from what this reminder is
     * *actually* mirrored to when editing — so opening an edit sheet does not silently
     * re-apply a default the worker had turned off for this one.
     *
     * Held **unresolved**, as the intent rather than the outcome: an alarm preference on a
     * reminder pushed out to Saturday and then pulled back to tonight is an alarm again.
     * `resolveMirrorTarget` applies the horizon at render and at save, against the due
     * time as it stands at that moment.
     */
    const [mirrorTarget, setMirrorTarget] = useState<MIRROR_PROVIDER | null>(null);

    useEffect(() => {
        if (visible) {
            setMirrorTarget(reminder ? mirrorFor(reminder._id) : mirrorDefault);
        }
        // Read once per open. Re-seeding whenever the ledger changes would overwrite a
        // choice the worker has just made in this very sheet.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, reminder?._id]);

    /**
     * Recomputed each time the sheet opens, never at mount.
     *
     * The chips are relative to now, and a sheet mounted at 17:00 and opened at 19:00
     * would otherwise still be offering "this evening" for a time two hours gone.
     */
    const quickTimes = useMemo(() => (visible ? availableQuickTimes() : []), [visible]);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: visible ? 0 : 400,
            useNativeDriver: true,
            bounciness: 4,
        }).start();
    }, [visible, slideAnim]);

    useEffect(() => {
        if (visible) {
            setOpenSession(session => session + 1);
        }
    }, [visible]);

    /**
     * Keeps the "When" section honest about a clock that keeps moving.
     *
     * Every judgement under that heading is relative to *now* — whether the chosen time
     * has passed, and the "in 6 minutes" line under it — but Formik only validates on
     * change, blur and submit. A sheet left open on a time six minutes out therefore goes
     * on claiming the time is fine, and on saying "in 6 minutes", long after both stopped
     * being true; the worker only finds out when the server rejects the save.
     *
     * Re-rendering re-reads the clock, and `validateForm` re-runs the `is-future` test
     * against it. Thirty seconds is fine enough to catch the boundary and coarse enough to
     * be free.
     */
    useEffect(() => {
        if (!visible) {
            return;
        }

        const interval = setInterval(() => {
            setClockTick(tick => tick + 1);
            formikRef.current?.validateForm();
        }, 30_000);

        return () => clearInterval(interval);
    }, [visible]);

    const initialValues: IReminderFormValues = {
        guestId: guest._id,
        dueAt: reminder?.dueAt ?? '',
        note: reminder?.note ?? '',
    };

    const handleSubmit = async (values: IReminderFormValues) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            if (isEditing) {
                const saved = await updateReminder({
                    _id: reminder._id,
                    dueAt: values.dueAt,
                    note: values.note.trim(),
                }).unwrap();

                await applyMirror(saved, resolveMirrorTarget(mirrorTarget, values.dueAt));
                onSaved?.(saved);
            } else {
                const payload: ICreateReminderPayload = {
                    guestId: values.guestId,
                    dueAt: values.dueAt,
                    note: values.note.trim(),
                    // Recorded as at creation so the reminder still displays at the time
                    // the worker meant after they travel — the instant is absolute, the
                    // intent was local.
                    timezone: localTimezone(),
                };

                const saved = await createReminder(payload).unwrap();
                await applyMirror(saved, resolveMirrorTarget(mirrorTarget, values.dueAt));
                onSaved?.(saved);
            }

            onClose();
        } catch {
            // The mutation's own error state renders inline; nothing to do here but keep
            // the sheet open so the worker does not lose what they typed.
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Formik<IReminderFormValues>
                enableReinitialize
                validateOnChange
                innerRef={formikRef}
                key={`${reminder?._id ?? 'new'}:${openSession}`}
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={ReminderFormValidationSchema}
            >
                {({ values, errors, touched, setFieldValue, setFieldTouched, handleSubmit: submit }) => {
                    // Matched against the chips that are actually rendered — see
                    // `quickTimeKeyFor`. Passing nothing recomputes them against a later
                    // clock and the selection silently drops off after a minute.
                    const selectedKey = quickTimeKeyFor(values.dueAt, quickTimes);
                    const remaining = 280 - values.note.length;

                    const chooseTime = (date: Date) => {
                        Haptics.selectionAsync();

                        // Touched first and **without validating**, then the value *with*.
                        // Formik validates against the state it can see at the moment it
                        // is called, and `setFieldValue` has not re-rendered yet — so
                        // marking touched second re-runs validation against the previous
                        // `dueAt` and leaves the error from the old value on screen under
                        // the new one.
                        setFieldTouched('dueAt', true, false);
                        setFieldValue('dueAt', date.toISOString(), true);
                    };

                    return (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View className="flex-1 justify-end bg-black/40">
                                    <TouchableWithoutFeedback>
                                        <Animated.View
                                            style={{ transform: [{ translateY: slideAnim }] }}
                                            className="bg-background rounded-t-3xl"
                                        >
                                            <View className="items-center pt-3 pb-1">
                                                <View className="w-10 h-1 rounded-full bg-muted" />
                                            </View>

                                            <View className="px-5 pt-3 pb-2">
                                                <Text className="!text-base font-bold text-foreground">
                                                    {isEditing ? 'Edit reminder' : 'Remind me about'} {guest.firstName}
                                                </Text>
                                            </View>

                                            <Separator />

                                            <View className="px-5 pt-4 gap-2">
                                                <Text className="!text-xs text-muted-foreground">When</Text>

                                                <View className="flex-row flex-wrap gap-2">
                                                    {quickTimes.map(option => {
                                                        const isSelected = selectedKey === option.key;

                                                        return (
                                                            <TouchableOpacity
                                                                key={option.key}
                                                                activeOpacity={0.6}
                                                                onPress={() => chooseTime(option.date)}
                                                                className={cn(
                                                                    'h-10 px-4 rounded-full border justify-center',
                                                                    isSelected
                                                                        ? 'bg-primary border-primary'
                                                                        : 'border-border'
                                                                )}
                                                            >
                                                                <Text
                                                                    className={cn(
                                                                        '!text-sm',
                                                                        isSelected &&
                                                                            'text-primary-foreground dark:text-white'
                                                                    )}
                                                                >
                                                                    {option.label}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}

                                                    <TouchableOpacity
                                                        activeOpacity={0.6}
                                                        onPress={() => setPickerOpen(true)}
                                                        className={cn(
                                                            'h-10 px-4 rounded-full border justify-center',
                                                            values.dueAt && !selectedKey
                                                                ? 'bg-primary border-primary'
                                                                : 'border-border'
                                                        )}
                                                    >
                                                        <Text
                                                            className={cn(
                                                                '!text-sm',
                                                                values.dueAt &&
                                                                    !selectedKey &&
                                                                    'text-primary-foreground dark:text-white'
                                                            )}
                                                        >
                                                            {values.dueAt && !selectedKey
                                                                ? dayjs(values.dueAt).format('ddd D MMM, h:mm A')
                                                                : 'Pick a time'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Validated inline rather than on submit — US-2.1 asks for the
                                                    block to be visible at the moment the time is chosen, not
                                                    after the worker has finished writing the note. */}
                                                {!!errors.dueAt && !!touched.dueAt && (
                                                    <FormErrorMessage>{errors.dueAt}</FormErrorMessage>
                                                )}

                                                {!!values.dueAt && !errors.dueAt && (
                                                    <Text className="!text-xs text-muted-foreground">
                                                        {dayjs(values.dueAt).format('dddd D MMMM, h:mm A')} ·{' '}
                                                        {dayjs(values.dueAt).fromNow()}
                                                    </Text>
                                                )}

                                                {/* Offered only once a time exists, because what the phone
                                                    can hold depends on it — the Android alarm cannot carry a
                                                    date and so is only shown for something due today. */}
                                                {!!values.dueAt && !errors.dueAt && (
                                                    <MirrorPicker
                                                        dueAt={values.dueAt}
                                                        value={mirrorTarget}
                                                        onChange={setMirrorTarget}
                                                        strandedAlarm={
                                                            !!reminder &&
                                                            mirrorFor(reminder._id) === MIRROR_PROVIDER.ANDROID_ALARM &&
                                                            (values.dueAt !== reminder.dueAt ||
                                                                values.note.trim() !== reminder.note)
                                                        }
                                                    />
                                                )}
                                            </View>

                                            <View className="px-5 pt-4 pb-2 gap-2">
                                                <Text className="!text-xs text-muted-foreground">Note</Text>
                                                <Textarea
                                                    value={values.note}
                                                    onChangeText={text => setFieldValue('note', text)}
                                                    onBlur={() => setFieldTouched('note', true)}
                                                    placeholder="Call back about the baptism class"
                                                    numberOfLines={3}
                                                    maxLength={280}
                                                    className="min-h-[80px]"
                                                />
                                                <View className="flex-row items-center justify-between">
                                                    {!!errors.note && !!touched.note ? (
                                                        <FormErrorMessage>{errors.note}</FormErrorMessage>
                                                    ) : (
                                                        <Text className="!text-[11px] text-muted-foreground">
                                                            This is what the notification will say.
                                                        </Text>
                                                    )}
                                                    {remaining < 60 && (
                                                        <Text className="!text-[11px] text-muted-foreground">
                                                            {remaining}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>

                                            <View className="flex-row gap-3 px-5 pt-2 pb-8">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onPress={onClose}
                                                    disabled={isSaving}
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="flex-1"
                                                    onPress={submit as any}
                                                    isLoading={isSaving}
                                                    loadingText={isEditing ? 'Saving' : 'Setting'}
                                                    size="sm"
                                                >
                                                    {isEditing ? 'Save changes' : 'Set reminder'}
                                                </Button>
                                            </View>

                                            <RNDatePicker
                                                modal
                                                mode="datetime"
                                                open={pickerOpen}
                                                // Clamped to now. Editing an overdue
                                                // reminder opens on a date that is
                                                // already below `minimumDate`, which the
                                                // picker resolves by scrolling to a value
                                                // it will not then let you confirm.
                                                date={
                                                    values.dueAt && Date.parse(values.dueAt) > Date.now()
                                                        ? new Date(values.dueAt)
                                                        : new Date()
                                                }
                                                // The picker itself refuses the past, so the
                                                // inline message below is a backstop for a
                                                // sheet left open, not the primary guard.
                                                minimumDate={new Date()}
                                                onConfirm={date => {
                                                    setPickerOpen(false);
                                                    chooseTime(date);
                                                }}
                                                onCancel={() => setPickerOpen(false)}
                                            />
                                        </Animated.View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    );
                }}
            </Formik>
        </Modal>
    );
};

export default ReminderSheet;
