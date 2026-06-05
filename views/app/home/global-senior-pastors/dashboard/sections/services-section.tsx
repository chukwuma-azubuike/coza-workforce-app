import React from 'react';
import dayjs from 'dayjs';
import { useGetGspServicesQuery } from '@store/services/gsp-dashboard';
import { THEME_CONFIG } from '@config/appConfig';
import Section from '../components/section';
import { SectionCard, SectionEmpty, SectionError, SectionSkeleton } from '../components/states';
import LeagueTable, { LeagueRow } from '../components/league-table';
import { IUseGspFilters } from '../use-gsp-filters';
import { gspRoutes } from '../routes';
import { formatCompactNumber } from '../lib';

interface ServicesSectionProps {
    filters: IUseGspFilters;
    onCheckCompleteness: () => void;
}

/** Compare every service held in the window side-by-side (e.g. all Sundays). */
const ServicesSection: React.FC<ServicesSectionProps> = ({ filters, onCheckCompleteness }) => {
    const { data, isLoading, isError, refetch } = useGetGspServicesQuery(filters.params);

    const win = {
        startDate: filters.window.start,
        endDate: filters.window.end,
        campusId: filters.isGlobal ? undefined : filters.campusId,
    };

    const rows: LeagueRow[] = React.useMemo(
        () =>
            (data?.services ?? []).map(s => ({
                id: s.serviceId,
                label: s.label,
                value: s.churchAttendanceTotal,
                secondary: `${dayjs.unix(s.serviceTime).format('MMM D')} · ${s.campusesReporting} campuses · ${formatCompactNumber(
                    s.firstTimers
                )} FT`,
                color: THEME_CONFIG.primary,
            })),
        [data]
    );

    const isEmpty = !isLoading && !isError && rows.length === 0;

    return (
        <Section
            title="Services"
            subtitle="Attendance per service this period"
            actionLabel={rows.length > 6 ? 'See all' : undefined}
            onActionPress={() => gspRoutes.services(win)}
        >
            <SectionCard>
                {isLoading ? (
                    <SectionSkeleton rows={4} />
                ) : isError ? (
                    <SectionError onRetry={refetch} />
                ) : isEmpty ? (
                    <SectionEmpty message="No services with approved reports this period." onCheckCompleteness={onCheckCompleteness} />
                ) : (
                    <LeagueTable rows={rows} maxRows={6} />
                )}
            </SectionCard>
        </Section>
    );
};

export default React.memo(ServicesSection);
