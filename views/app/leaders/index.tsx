import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { AddButtonComponent } from '@components/atoms/button';
import { IService } from '@store/types';
import { router, useLocalSearchParams } from 'expo-router';

const Leaders: React.FC = () => {
    const updatedListItem = useLocalSearchParams<IService>();

    const gotoService = () => {
        router.push({ pathname: '/assign-group-head', params: updatedListItem as any });
    };

    return (
        <ViewWrapper className="flex-1">
            <AddButtonComponent onPress={gotoService} />
        </ViewWrapper>
    );
};

export default React.memo(Leaders);
