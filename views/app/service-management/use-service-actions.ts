import React from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import useModal from '@hooks/modal/useModal';
import { useCreateServiceMutation, useDeleteServiceMutation, useUpdateServiceMutation } from '@store/services/services';
import { IService, IServiceFormValues } from '@store/types';
import { getServiceCongressId, getServiceVariant, SERVICE_FORM_CONFIG, toServicePayload } from '@utils/service-form';

const errorMessage = (error: unknown) =>
    (error as any)?.data?.data || (error as any)?.data?.message || 'Oops something went wrong';

/** Route params for the edit screen. The whole record rides along as JSON so types survive the trip. */
export const serviceEditParams = (service: IService, congressId?: string) => ({
    service: JSON.stringify(service),
    ...(congressId || getServiceCongressId(service) ? { CongressId: congressId || getServiceCongressId(service) } : {}),
});

export const parseServiceParam = (value?: string | string[]): IService | undefined => {
    try {
        const raw = Array.isArray(value) ? value[0] : value;
        return raw ? (JSON.parse(raw) as IService) : undefined;
    } catch {
        return undefined;
    }
};

/**
 * Create, update, duplicate and delete for regular services and congress sessions alike. Congress
 * sessions only differ by carrying their congress id.
 */
const useServiceActions = () => {
    const { setModalState } = useModal();
    const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
    const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
    const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

    const save = React.useCallback(
        async (values: IServiceFormValues, { serviceId, congressId }: { serviceId?: string; congressId?: string }) => {
            const noun = SERVICE_FORM_CONFIG[congressId ? 'congress-session' : 'service'].noun;
            const payload = toServicePayload(values, congressId);
            const result = serviceId
                ? await updateService({ _id: serviceId, ...payload })
                : await createService(payload);

            if ('error' in result) {
                setModalState({ message: errorMessage(result.error), status: 'error' });
                return false;
            }

            setModalState({ message: `${noun} ${serviceId ? 'updated' : 'created'}`, status: 'success' });
            router.back();
            return true;
        },
        [createService, updateService, setModalState]
    );

    /** Asks first. Resolves true only once the service is actually gone. */
    const remove = React.useCallback(
        (service: IService) =>
            new Promise<boolean>(resolve => {
                const noun = SERVICE_FORM_CONFIG[getServiceVariant(service)].noun;

                Alert.alert(
                    `Delete ${service.name}?`,
                    `This ${noun.toLowerCase()} and its schedule will be removed permanently.`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                                const result = await deleteService(service._id);

                                if ('error' in result) {
                                    setModalState({ message: errorMessage(result.error), status: 'error' });
                                    return resolve(false);
                                }

                                setModalState({ message: `${noun} deleted`, status: 'success' });
                                resolve(true);
                            },
                        },
                    ]
                );
            }),
        [deleteService, setModalState]
    );

    const edit = React.useCallback((service: IService, congressId?: string) => {
        router.push({ pathname: '/service-management/update-service', params: serviceEditParams(service, congressId) });
    }, []);

    const duplicate = React.useCallback((service: IService, congressId?: string) => {
        router.push({ pathname: '/service-management/create-service', params: serviceEditParams(service, congressId) });
    }, []);

    /** Edit / Duplicate / Delete for a list row. */
    const showActions = React.useCallback(
        (service: IService, congressId?: string) => {
            const actions = [
                { label: 'Edit', run: () => edit(service, congressId) },
                { label: 'Duplicate', run: () => duplicate(service, congressId) },
                { label: 'Delete', run: () => remove(service) },
            ];

            if (Platform.OS === 'ios') {
                return ActionSheetIOS.showActionSheetWithOptions(
                    {
                        title: service.name,
                        options: ['Cancel', ...actions.map(({ label }) => label)],
                        cancelButtonIndex: 0,
                        destructiveButtonIndex: actions.length,
                    },
                    index => index > 0 && actions[index - 1]?.run()
                );
            }

            // Android alerts hold three buttons at most, so dismissal is by tapping outside.
            Alert.alert(
                service.name,
                undefined,
                actions.map(({ label, run }) => ({ text: label, onPress: run })),
                { cancelable: true }
            );
        },
        [edit, duplicate, remove]
    );

    return {
        save,
        remove,
        edit,
        duplicate,
        showActions,
        isSaving: isCreating || isUpdating,
        isDeleting,
    };
};

export default useServiceActions;
