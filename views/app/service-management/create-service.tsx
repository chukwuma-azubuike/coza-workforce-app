import React from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import ViewWrapper from '@components/layout/viewWrapper';
import Loading from '@components/atoms/loading';
import { IServiceFormValues } from '@store/types';
import {
    getEmptyServiceFormValues,
    getServiceVariant,
    SERVICE_FORM_CONFIG,
    toServiceFormValues,
} from '@utils/service-form';
import ServiceForm from './components/service-form';
import CongressBanner, { useCongressWindow } from './components/congress-banner';
import useServiceActions, { parseServiceParam } from './use-service-actions';

/** Keep a date inside the picker's bounds, so the form never holds a date the picker can't show. */
const clamp = (date: Date, min?: Date, max?: Date) => (min && date < min ? min : max && date > max ? max : date);

/**
 * Create a regular service, or — given a `CongressId` — a congress session. Given a `service` it
 * duplicates that one onto the next slot: the next day for a session, the next week for a service.
 */
const CreateService: React.FC = () => {
    const params = useLocalSearchParams<{ CongressId?: string; service?: string }>();
    const source = React.useMemo(() => parseServiceParam(params.service), [params.service]);
    const congressId = params.CongressId;
    const variant = getServiceVariant(source, congressId);
    const noun = SERVICE_FORM_CONFIG[variant].noun;

    const { setOptions } = useNavigation();
    const { save, isSaving } = useServiceActions();
    const { congress, isLoading, startDate, endDate } = useCongressWindow(congressId);

    React.useLayoutEffect(() => {
        setOptions({ title: source ? `Duplicate ${noun.toLowerCase()}` : `New ${noun.toLowerCase()}` });
    }, [setOptions, source, noun]);

    const today = dayjs().startOf('day').toDate();
    const minimumDate = startDate && startDate > today ? startDate : today;

    const initialValues = React.useMemo<IServiceFormValues>(() => {
        if (source) {
            const values = toServiceFormValues(source, variant === 'congress-session' ? 1 : 7);
            return { ...values, serviceDate: clamp(new Date(values.serviceDate), minimumDate, endDate).toISOString() };
        }
        return { ...getEmptyServiceFormValues(variant), serviceDate: minimumDate.toISOString() };
        // The bounds only settle once the congress loads, and the form waits for that.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, variant, isLoading]);

    const handleSubmit = React.useCallback(
        (values: IServiceFormValues) => save(values, { congressId }),
        [save, congressId]
    );

    return (
        <ViewWrapper scroll noPadding>
            <View className="w-full px-4 pt-4">
                {isLoading ? (
                    <Loading cover className="flex-1" />
                ) : (
                    <ServiceForm
                        mode="create"
                        variant={variant}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        isSubmitting={isSaving}
                        minimumDate={minimumDate}
                        maximumDate={endDate}
                        context={
                            <CongressBanner
                                congress={congress}
                                caption={source ? `Copy of ${source.name}` : undefined}
                            />
                        }
                    />
                )}
            </View>
        </ViewWrapper>
    );
};

export default React.memo(CreateService);

CreateService.displayName = 'CreateService';
