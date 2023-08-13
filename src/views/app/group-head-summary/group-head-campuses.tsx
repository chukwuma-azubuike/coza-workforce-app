import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Center, Stack } from 'native-base';
import React from 'react';
import { SmallCardComponent } from '../../../components/composite/card';
import ErrorBoundary from '../../../components/composite/error-boundary';
import { FlatListSkeleton } from '../../../components/layout/skeleton';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { useCustomBackNavigation } from '../../../hooks/navigation';
import useRole from '../../../hooks/role';
import { useGetGHCampusByIdQuery } from '../../../store/services/campus';
import Utils from '../../../utils';

const GroupHeadCampuses: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { navigate } = useNavigation();

    const handlePress = (elm: any) => {
        navigate('Group head departments' as never, { ...elm } as never);
    };

    const { user } = useRole();

    const { data, isLoading, isFetching, isSuccess } = useGetGHCampusByIdQuery(user.userId);

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
                <Center>
                    <Stack py={3} mb={4} flexDirection="row" flex={1} flexWrap="wrap">
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
                    </Stack>
                </Center>
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default GroupHeadCampuses;
