import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '~/components/composite/date-time-picker';
import DateTimePickerLegend from '~/components/composite/date-time-picker/date-picker';
import FormErrorMessage from '~/components/ui/error-message';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';
import { IServiceFormValues, IServiceFormVariant, RANGES_TO_CLOKIN } from '@store/types';
import { ServiceFormSchema } from '@utils/schemas';
import { applyServicePreset, SERVICE_FORM_CONFIG, SERVICE_TYPE_OPTIONS } from '@utils/service-form';
import { cn } from '~/lib/utils';

export interface IServiceFormProps {
    variant: IServiceFormVariant;
    mode: 'create' | 'edit';
    initialValues: IServiceFormValues;
    onSubmit: (values: IServiceFormValues) => Promise<unknown> | void;
    isSubmitting?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
    /** Sits above the form, e.g. which congress a session belongs to. */
    context?: React.ReactNode;
}

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
    <View className="gap-4 rounded-2xl border border-border p-4">
        <View className="gap-1">
            <Text className="font-semibold text-lg">{title}</Text>
            {!!hint && <Text className="text-sm text-muted-foreground">{hint}</Text>}
        </View>
        {children}
    </View>
);

const SegmentedControl: React.FC<{
    value: string;
    options: { id: string; label: string }[];
    onChange: (value: string) => void;
}> = ({ value, options, onChange }) => (
    <View className="flex-row rounded-full border border-border p-1">
        {options.map(option => {
            const selected = option.id === value;
            return (
                <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onChange(option.id)}
                    className={cn('flex-1 items-center rounded-full py-3', selected && 'bg-primary')}
                >
                    <Text className={cn('font-medium', selected ? 'text-white' : 'text-muted-foreground')}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const TIME_ROWS: { field: keyof IServiceFormValues; label: string }[][] = [
    [
        { field: 'clockInStartTime', label: 'Clock-in opens' },
        { field: 'serviceTime', label: 'Starts' },
    ],
    [
        { field: 'leadersLateStartTime', label: 'Leaders late from' },
        { field: 'workersLateStartTime', label: 'Workers late from' },
    ],
    [{ field: 'serviceEndTime', label: 'Ends' }],
];

/**
 * The one form behind creating and editing both regular services and congress sessions. What
 * differs between the two lives in `SERVICE_FORM_CONFIG`; what differs between create and edit is
 * only the initial values and the actions at the bottom.
 */
const ServiceForm: React.FC<IServiceFormProps> = ({
    variant,
    mode,
    initialValues,
    onSubmit,
    isSubmitting,
    onDelete,
    isDeleting,
    minimumDate,
    maximumDate,
    context,
}) => {
    const config = SERVICE_FORM_CONFIG[variant];
    const noun = config.noun.toLowerCase();

    return (
        <Formik<IServiceFormValues>
            validateOnChange
            initialValues={initialValues}
            validationSchema={ServiceFormSchema}
            onSubmit={async values => {
                await onSubmit(values);
            }}
        >
            {({
                values,
                errors,
                touched,
                submitCount,
                handleChange,
                handleSubmit,
                setFieldValue,
                setValues,
            }: FormikProps<IServiceFormValues>) => {
                // Pickers never mark themselves touched, so an error shows once the field holds a value
                // (e.g. an end time before the start) or a submit has been attempted.
                const fieldError = (field: keyof IServiceFormValues) =>
                    submitCount > 0 || touched[field] || !!values[field] ? errors[field] : undefined;

                // Presets only seed a new service; retagging an existing one keeps the times already set.
                const handleTag = (tag: string) =>
                    mode === 'create'
                        ? setValues(applyServicePreset(variant, tag, values), true)
                        : setFieldValue('tag', tag, true);
                const setField = (field: keyof IServiceFormValues) => (value: Date) =>
                    setFieldValue(field, value as unknown as string, true);

                return (
                    <View className="w-full gap-4 pb-12">
                        {context}

                        <Section title="Details">
                            <View className="gap-2">
                                <Label>{config.noun} tag</Label>
                                <PickerSelect
                                    valueKey="id"
                                    labelKey="value"
                                    items={config.tags}
                                    value={values.tag}
                                    placeholder={`Select ${noun} tag`}
                                    onValueChange={handleTag}
                                />
                                {!!fieldError('tag') && <FormErrorMessage>{fieldError('tag')}</FormErrorMessage>}
                                {mode === 'create' && Object.keys(config.presets).length > 0 && (
                                    <Text className="text-sm text-muted-foreground">
                                        Picking a tag fills in its usual name and times.
                                    </Text>
                                )}
                            </View>
                            <View className="gap-2">
                                <Label>{config.noun} name</Label>
                                <Input
                                    value={values.name}
                                    placeholder={`${config.noun} name`}
                                    onChangeText={handleChange('name')}
                                />
                                {!!fieldError('name') && <FormErrorMessage>{fieldError('name')}</FormErrorMessage>}
                            </View>
                            <View className="gap-2">
                                <Label>Campus scope</Label>
                                <SegmentedControl
                                    value={values.serviceType}
                                    options={SERVICE_TYPE_OPTIONS}
                                    onChange={value => setFieldValue('serviceType', value, true)}
                                />
                                <Text className="text-sm text-muted-foreground">
                                    {values.serviceType === 'global'
                                        ? 'Global: every campus clocks in to this one.'
                                        : values.serviceType === 'local'
                                          ? 'Local: each campus holds its own.'
                                          : 'Choose whether every campus shares this, or each holds its own.'}
                                </Text>
                                {!!fieldError('serviceType') && (
                                    <FormErrorMessage>{fieldError('serviceType')}</FormErrorMessage>
                                )}
                            </View>
                            <View className="gap-2">
                                <Label>Clock-in range</Label>
                                <PickerSelect
                                    valueKey="id"
                                    labelKey="label"
                                    items={RANGES_TO_CLOKIN}
                                    value={values.rangeToClockIn}
                                    placeholder="Select clock-in range"
                                    onValueChange={value => setFieldValue('rangeToClockIn', value, true)}
                                />
                                {!!fieldError('rangeToClockIn') && (
                                    <FormErrorMessage>{fieldError('rangeToClockIn')}</FormErrorMessage>
                                )}
                            </View>
                        </Section>

                        <Section
                            title="Schedule"
                            hint="Anyone clocking in after their late time is marked late. Clock-in closes when it ends."
                        >
                            <DateTimePickerLegend
                                mode="date"
                                label={`${config.noun} date`}
                                minimumDate={minimumDate}
                                maximumDate={maximumDate}
                                placeholder={`Select ${noun} date`}
                                error={fieldError('serviceDate')}
                                touched
                                value={values.serviceDate || undefined}
                                initialValue={values.serviceDate || undefined}
                                onConfirm={setField('serviceDate')}
                            />
                            {TIME_ROWS.map(row => (
                                <View key={row.map(({ field }) => field).join()} className="flex-row gap-4">
                                    {row.map(({ field, label }) => (
                                        <DateTimePicker
                                            key={field}
                                            mode="time"
                                            label={label}
                                            placeholder="Select time"
                                            touched
                                            error={fieldError(field)}
                                            initialValue={values[field]}
                                            onConfirm={setField(field)}
                                        />
                                    ))}
                                    {row.length === 1 && <View className="flex-1" />}
                                </View>
                            ))}
                        </Section>

                        <Button
                            className="mt-2"
                            isLoading={isSubmitting}
                            disabled={isDeleting}
                            loadingText={mode === 'create' ? `Creating ${noun}...` : 'Saving...'}
                            icon={
                                <Ionicons name={mode === 'create' ? 'add' : 'save-outline'} size={20} color="white" />
                            }
                            onPress={() => handleSubmit()}
                        >
                            {mode === 'create' ? `Create ${noun}` : 'Save changes'}
                        </Button>
                        {mode === 'edit' && !!onDelete && (
                            <Button
                                variant="ghost"
                                isLoading={isDeleting}
                                disabled={isSubmitting}
                                loadingText="Deleting..."
                                textClassName="text-destructive"
                                onPress={onDelete}
                            >
                                {`Delete ${noun}`}
                            </Button>
                        )}
                    </View>
                );
            }}
        </Formik>
    );
};

export default React.memo(ServiceForm);
