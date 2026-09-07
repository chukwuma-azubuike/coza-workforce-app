import React from 'react';
import { IService } from '@store/types';
import { useGetServicesQuery } from '@store/services/services';
import WorkForceSummary from '~/views/app/home/global-senior-pastors/workforce-summary';

/**
 * Legacy single-service workforce summary, retained as a GSP drill-down from the
 * Global Dashboard. Fetches the service list the summary's pickers depend on.
 */
const ServiceReportScreen: React.FC = () => {
    const { data: services, isSuccess } = useGetServicesQuery({});
    return <WorkForceSummary services={(services as IService[]) ?? []} servicesIsSuccess={isSuccess} />;
};

export default ServiceReportScreen;
