import React, { memo } from 'react';
import useInfiniteData from '@hooks/fetch-more-data/use-infinite-data';
import { useGetServicesQuery } from '@store/services/services';
import { IService } from '@store/types';
import SectionListComponent from '~/components/composite/section-list';
import ErrorBoundary from '~/components/composite/error-boundary';
import ServiceCard from './components/service-card';
import useServiceActions from './use-service-actions';

const AllService: React.FC = memo(() => {
    const { data, isLoading, isFetchingNextPage, fetchNextPage, refetch, hasNextPage } = useInfiniteData(
        { limit: 10 },
        useGetServicesQuery,
        '_id'
    );
    const { edit, showActions } = useServiceActions();

    const cardProps = React.useMemo(
        () => ({
            onEdit: (service: IService) => edit(service),
            onActions: (service: IService) => showActions(service),
        }),
        [edit, showActions]
    );

    return (
        <ErrorBoundary>
            <SectionListComponent
                data={data}
                field="serviceTime"
                headerDateFormat="MMMM, YYYY"
                refetch={refetch}
                itemHeight={92}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                column={ServiceCard as unknown as React.FC<IService>}
                fetchNextPage={fetchNextPage}
                extraProps={cardProps}
                emptyMessage="No services yet"
                isFetchingNextPage={isFetchingNextPage}
            />
        </ErrorBoundary>
    );
});

export { AllService };
