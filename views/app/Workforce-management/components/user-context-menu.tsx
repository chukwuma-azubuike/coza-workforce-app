import React, { memo, ReactNode } from 'react';
import { View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { Text } from '~/components/ui/text';
import { router } from 'expo-router';
import { IUser } from '~/store/types';
import ErrorBoundary from '~/components/composite/error-boundary';
import StatusTag from '~/components/atoms/status-tag';
import AvatarComponent from '~/components/atoms/avatar';
import Utils from '~/utils';
import useRole from '~/hooks/role';
import { AVATAR_FALLBACK_URL } from '~/constants';

const UserContextMenu: React.FC<{ children: ReactNode; user: IUser }> = ({ children, user }) => {
    const { leaderRoleIds, isQC } = useRole();
    const isHOD = leaderRoleIds && user.roleId === leaderRoleIds[1];
    const isAHOD = leaderRoleIds && user.roleId === leaderRoleIds[0];

    const issueTicket = () => {
        router.push({ pathname: '/tickets/issue-ticket', params: { type: 'INDIVIDUAL', ...user } as any });
    };

    return (
        <ErrorBoundary>
            {!isQC ? (
                children
            ) : (
                <ContextMenu.Root>
                    <ContextMenu.Trigger className="w-full">{children}</ContextMenu.Trigger>
                    <ContextMenu.Content className="!z-40">
                        <ContextMenu.Preview backgroundColor={{ dark: 'black', light: 'white' }}>
                            <View className="py-3 flex-row w-full justify-between items-center gap-3">
                                <View className="items-center gap-2 flex-row flex-1">
                                    <AvatarComponent
                                        alt="profile-pic"
                                        imageUrl={user?.pictureUrl || AVATAR_FALLBACK_URL}
                                    />
                                    <View className="flex-1">
                                        <Text className="font-bold">
                                            {Utils.capitalizeFirstChar(user?.firstName)}{' '}
                                            {Utils.capitalizeFirstChar(user?.lastName)}
                                        </Text>
                                        <Text className="text-base text-muted-foreground">{user?.email}</Text>
                                    </View>
                                </View>
                                {(isHOD || isAHOD) && (
                                    <StatusTag capitalise={false}>
                                        {isHOD ? 'HOD' : isAHOD ? 'AHOD' : ('' as any)}
                                    </StatusTag>
                                )}
                                {/* TODO: Suspend rendering worker status until fixed from backend */}
                                {/* <StatusTag>{user?.status}</StatusTag> */}
                            </View>
                        </ContextMenu.Preview>
                        <ContextMenu.Item key="1" onSelect={issueTicket}>
                            <ContextMenu.ItemTitle>Issue ticket</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon
                                ios={{
                                    name: 'ticket', // required
                                    pointSize: 16,
                                    scale: 'medium',
                                    weight: 'semibold',
                                    // can also be a color string. Requires iOS 15+
                                    hierarchicalColor: {
                                        dark: 'orange',
                                        light: 'orange',
                                    },
                                }}
                            />
                        </ContextMenu.Item>
                    </ContextMenu.Content>
                </ContextMenu.Root>
            )}
        </ErrorBoundary>
    );
};

export default memo(UserContextMenu);
