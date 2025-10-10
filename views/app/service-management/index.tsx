import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import ErrorBoundary from '~/components/composite/error-boundary';
import { AddButtonComponent } from '@components/atoms/button';
import { AllService } from './list';
import { router } from 'expo-router';

const ServiceManagement: React.FC = () => {
    const gotoService = () => {
        router.push('/service-management/create-service');
    };

    return (
        <ErrorBoundary>
            <ViewWrapper className="flex-1">
                <AllService />
                <AddButtonComponent className="!bottom-24 !right-8" onPress={gotoService} />
            </ViewWrapper>
        </ErrorBoundary>
    );
};

export default React.memo(ServiceManagement);
