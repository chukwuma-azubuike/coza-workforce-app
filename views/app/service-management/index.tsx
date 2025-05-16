import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { AddButtonComponent } from '@components/atoms/button';
import { AllService } from './list';
import { IService } from '@store/types';
import { router, useLocalSearchParams } from 'expo-router';

const ServiceManagement: React.FC = () => {
    const updatedListItem = useLocalSearchParams as any as IService;
    const gotoService = () => {
        router.push('/service-management/create-service');
    };

    return (
        <ViewWrapper>
            <AllService updatedListItem={updatedListItem} />
            <AddButtonComponent onPress={gotoService} />
        </ViewWrapper>
    );
};

export default React.memo(ServiceManagement);
