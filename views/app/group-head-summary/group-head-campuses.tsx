import { View } from "react-native";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SmallCardComponent } from '@components/composite/card';
import ErrorBoundary from '@components/composite/error-boundary';
import { FlatListSkeleton } from '@components/layout/skeleton';
import ViewWrapper from '@components/layout/viewWrapper';
import { useCustomBackNavigation } from '@hooks/navigation';
import useRole from '@hooks/role';
import { useGetGHCampusByIdQuery } from '@store/services/campus';
import Utils from '@utils/index';

const GroupHeadCampuses: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigate } = useNavigation();

    const handlePress = (elm: any) => {
        navigate('Group Head Departments' as never, { ...elm } as never);
    };

    const { user, isGroupHead } = useRole();

    const { refetch, data, isLoading, isFetching, isSuccess } = useGetGHCampusByIdQuery(user.userId);

    const Departmentlist = React.useMemo(
        () =>
            Utils.sortStringAscending(
                data?.campuses.map(item => ({
                    ...item,
                    value: item.departmentCount,
                    _id: item.id,
                    title: item.campusName,
                })),
                'title'
            ),
        [data]
    );

    useCustomBackNavigation({ targetRoute: 'More' });

    return (
        <ErrorBoundary>
            <ViewWrapper scroll>
                <View>
                    <View mb={4} flexDirection="row" flex={1} flexWrap="wrap" className="py-3">
                        {isLoading || isFetching ? (
                            <FlatListSkeleton count={6} />
                        ) : (
                            <>
                                {Departmentlist?.map((item, index) => (
                                    <SmallCardComponent
                                        key={index}
                                        label={item.title}
                                        value={item.value}
                                        onPress={() => handlePress(item)}
                                    />
                                ))}
                            </>
                        )}
                    </View>
                </View>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GroupHeadCampuses;
