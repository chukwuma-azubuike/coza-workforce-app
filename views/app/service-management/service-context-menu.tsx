import React, { memo, ReactNode, useCallback } from 'react';
import { Alert, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { Text } from '~/components/ui/text';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { IService } from '~/store/types';
import StatusTag from '../../../components/atoms/status-tag';
import { useDeleteServiceMutation } from '~/store/services/services';
import useModal from '~/hooks/modal/useModal';
import ErrorBoundary from '~/components/composite/error-boundary';

const ServiceContextMenu: React.FC<{ children: ReactNode; service: IService }> = ({ children, service }) => {
    const [deleteService] = useDeleteServiceMutation();

    const handleNagivate = () => {
        router.push({ pathname: '/service-management/update-service', params: service as any });
    };

    const { setModalState } = useModal();

    const handleDelete = useCallback(() => {
        Alert.alert(`Delete ${service.name}`, 'This action is permanent', [
            {
                text: 'Cancel',
                style: 'default',
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const result = await deleteService(service._id);

                        if ('data' in result) {
                            setModalState({
                                message: 'Service deleted',
                                status: 'success',
                            });
                        }

                        if ('error' in result) {
                            setModalState({
                                message: (result.error as any)?.data?.data || 'Oops something went wrong',
                                status: 'error',
                            });
                        }
                    } catch (error) {}
                },
            },
        ]);
    }, [service?._id, service?.name]);

    return (
        <ErrorBoundary>
            <ContextMenu.Root>
                <ContextMenu.Trigger className="w-full">{children}</ContextMenu.Trigger>
                <ContextMenu.Content className="!z-40">
                    <ContextMenu.Preview backgroundColor={{ dark: 'black', light: 'white' }}>
                        <View className="px-2 py-1 items-center gap-4 justify-between flex-row w-full">
                            <View className="items-center gap-3 flex-1">
                                <View className="justify-between">
                                    <Text className="font-bold">{service?.name}</Text>
                                    <Text className="text-sm">
                                        {`${dayjs(service?.serviceTime).format('DD-MM-YYYY')} - ${dayjs(
                                            service?.serviceTime
                                        ).format('h:mm A')}`}
                                    </Text>
                                </View>
                            </View>
                            <StatusTag>
                                {service?.isGlobalService ? ('Global Service' as any) : 'Local Service'}
                            </StatusTag>
                        </View>
                    </ContextMenu.Preview>

                    {/* <ContextMenu.Label key="actions">Actions</ContextMenu.Label> */}
                    <ContextMenu.Item key="1" onSelect={handleNagivate}>
                        <ContextMenu.ItemTitle>Edit</ContextMenu.ItemTitle>
                        <ContextMenu.ItemIcon
                            ios={{
                                name: 'pencil', // required
                                pointSize: 16,
                                weight: 'semibold',
                                scale: 'medium',
                                // can also be a color string. Requires iOS 15+
                                hierarchicalColor: {
                                    dark: 'white',
                                    light: 'black',
                                },
                            }}
                        />
                    </ContextMenu.Item>

                    <ContextMenu.Item key="2" onSelect={handleDelete}>
                        <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                        <ContextMenu.ItemIcon
                            ios={{
                                name: 'trash', // required
                                pointSize: 16,
                                scale: 'medium',
                                weight: 'semibold',
                                // can also be a color string. Requires iOS 15+
                                hierarchicalColor: {
                                    dark: 'red',
                                    light: 'red',
                                },
                            }}
                        />
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Root>
        </ErrorBoundary>
    );
};

export default memo(ServiceContextMenu);
