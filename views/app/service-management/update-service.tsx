import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import ViewWrapper from '@components/layout/viewWrapper';
import Loading from '@components/atoms/loading';
import { EmptyState } from '~/components/ui/empty-state';
import { IServiceFormValues } from '@store/types';
import { getServiceCongressId, getServiceVariant, SERVICE_FORM_CONFIG, toServiceFormValues } from '@utils/service-form';
import ServiceForm from './components/service-form';
import CongressBanner, { useCongressWindow } from './components/congress-banner';
import useServiceActions, { parseServiceParam } from './use-service-actions';

/** Edit (or delete) a regular service or a congress session. */
const UpdateService: React.FC = () => {
    const params = useLocalSearchParams<{ CongressId?: string; service?: string }>();
    const service = React.useMemo(() => parseServiceParam(params.service), [params.service]);
    const congressId = params.CongressId || getServiceCongressId(service);
    const variant = getServiceVariant(service, congressId);
    const noun = SERVICE_FORM_CONFIG[variant].noun;

    const { setOptions } = useNavigation();
    const { save, remove, isSaving, isDeleting } = useServiceActions();
    const { congress, isLoading, startDate, endDate } = useCongressWindow(congressId);

    React.useLayoutEffect(() => {
        setOptions({ title: `Edit ${noun.toLowerCase()}` });
    }, [setOptions, noun]);

    const initialValues = React.useMemo(() => service && toServiceFormValues(service), [service]);

    const handleSubmit = React.useCallback(
        (values: IServiceFormValues) => save(values, { serviceId: service?._id, congressId }),
        [save, service?._id, congressId]
    );

    const handleDelete = React.useCallback(async () => {
        if (service && (await remove(service))) router.back();
    }, [remove, service]);

    if (!service || !initialValues) {
        return (
            <ViewWrapper>
                <EmptyState
                    title={`${noun} not found`}
                    description="Go back to the list and open it again."
                    action={{ label: 'Go back', onPress: () => router.back() }}
                />
            </ViewWrapper>
        );
    }

    return (
        <ViewWrapper scroll noPadding>
            <View className="w-full px-4 pt-4">
                {isLoading ? (
                    <Loading cover className="flex-1" />
                ) : (
                    <ServiceForm
                        mode="edit"
                        variant={variant}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        isSubmitting={isSaving}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                        minimumDate={startDate}
                        maximumDate={endDate}
                        context={<CongressBanner congress={congress} />}
                    />
                )}
            </View>
        </ViewWrapper>
    );
};

export default React.memo(UpdateService);

UpdateService.displayName = 'UpdateService';
