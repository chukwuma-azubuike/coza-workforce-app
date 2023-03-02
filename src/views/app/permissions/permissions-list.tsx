import { useNavigation } from '@react-navigation/native';
import { HStack, Text, VStack } from 'native-base';
import React, { memo, useMemo } from 'react';
import { TouchableNativeFeedback } from 'react-native';
import AvatarComponent from '../../../components/atoms/avatar';
import StatusTag from '../../../components/atoms/status-tag';
import FlatListComponent, { IFlatListColumn } from '../../../components/composite/flat-list';
import { THEME_CONFIG } from '../../../config/appConfig';
import { IPermission } from '../../../store/types';
import Utils from '../../../utils';
// import PermissionStats from './permission-stats';

interface IPermissionListRowProps extends IPermission {
    type: 'own' | 'team' | 'campus';
    '0'?: string;
    '1'?: IPermission[];
}

const PermissionListRow: React.FC<IPermissionListRowProps> = props => {
    const navigation = useNavigation();

    const { type } = props;

    return (
        <>
            {props[1]?.map((elm, idx) => {
                const handlePress = () => {
                    navigation.navigate('Permission Details' as never, elm as never);
                };

                const {
                    requestor: {
                        lastName,
                        firstName,
                        pictureUrl,
                        department: { departmentName },
                    },
                    description,
                    category,
                    status,
                } = elm;

                return (
                    <TouchableNativeFeedback
                        disabled={false}
                        delayPressIn={0}
                        onPress={handlePress}
                        accessibilityRole="button"
                        background={TouchableNativeFeedback.Ripple(THEME_CONFIG.veryLightGray, false, 220)}
                    >
                        <HStack py={2} flex={1} key={idx} w="full" alignItems="center" justifyContent="space-between">
                            <HStack space={3} alignItems="center">
                                <AvatarComponent imageUrl={pictureUrl} />
                                <VStack justifyContent="space-between">
                                    <Text bold>
                                        {type === 'own'
                                            ? Utils.capitalizeFirstChar(category)
                                            : type === 'team'
                                            ? `${Utils.capitalizeFirstChar(firstName)} ${Utils.capitalizeFirstChar(
                                                  lastName
                                              )}`
                                            : `${Utils.capitalizeFirstChar(firstName)} ${Utils.capitalizeFirstChar(
                                                  lastName
                                              )} (${Utils.capitalizeFirstChar(departmentName)})`}
                                    </Text>
                                    <Text fontSize="sm" color="gray.400">
                                        {Utils.truncateString(description)}
                                    </Text>
                                </VStack>
                            </HStack>
                            <StatusTag>{status}</StatusTag>
                        </HStack>
                    </TouchableNativeFeedback>
                );
            })}
        </>
    );
};

const MyPermissionsList: React.FC = memo(() => {
    const myPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="own" {..._} key={key} />,
        },
    ];

    const memoizedData = useMemo(() => Utils.groupListByKey([], 'dateCreated'), []);

    return (
        <>
            {/* <PermissionStats total={5} pending={1} declined={0} approved={4} /> */}
            <FlatListComponent
                data={memoizedData}
                columns={myPermissionsColumns}
                // isLoading={isLoading || isFetching}
                // refreshing={isLoading || isFetching}
            />
        </>
    );
});

const MyTeamPermissionsList: React.FC = memo(() => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="team" {..._} key={key} />,
        },
    ];

    const memoizedData = useMemo(() => Utils.groupListByKey([], 'category'), []);

    return (
        <>
            {/* <PermissionStats total={21} pending={2} declined={4} approved={15} /> */}
            <FlatListComponent columns={teamPermissionsColumns} data={memoizedData} />
        </>
    );
});

const CampusPermissions: React.FC = memo(() => {
    const teamPermissionsColumns: IFlatListColumn[] = [
        {
            dataIndex: 'dateCreated',
            render: (_: IPermission, key) => <PermissionListRow type="campus" {..._} key={key} />,
        },
    ];

    const memoizedData = useMemo(() => Utils.groupListByKey([], 'status'), []);

    return (
        <>
            {/* <PermissionStats total={67} pending={17} declined={15} approved={35} /> */}
            <FlatListComponent columns={teamPermissionsColumns} data={memoizedData} />
        </>
    );
});

export { MyPermissionsList, MyTeamPermissionsList, CampusPermissions };
