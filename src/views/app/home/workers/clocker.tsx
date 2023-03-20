import React, { useState } from 'react';
import { Center, VStack } from 'native-base';
import ClockButton from './clock-button';
import Timer from './timer';
import CampusLocation from './campus-location';
import ClockStatistics from './clock-statistics';
import { CampusAttendanceSummary, TeamAttendanceSummary } from '../campus-pastors/attendance-summary';
import useGeoLocation from '../../../../hooks/geo-location';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import { Dimensions } from 'react-native';
import useRole from '../../../../hooks/role';
import If from '../../../../components/composite/if-container';
import { HomeContext } from '..';
import {
    ICampusCoordinates,
    useGetDepartmentAttendanceReportQuery,
    useGetLeadersAttendanceReportQuery,
    useGetWorkersAttendanceReportQuery,
} from '../../../../store/services/attendance';
import { CampusTicketSummary } from '../campus-pastors/ticket-summary';
import Loading from '../../../../components/atoms/loading';
import { useGetLatestServiceQuery } from '../../../../store/services/services';
import useScreenFocus from '../../../../hooks/focus';
import { useGetCampusTicketReportQuery } from '../../../../store/services/tickets';
import { useGetCampusByIdQuery } from '../../../../store/services/campus';
import ErrorBoundary from '../../../../components/composite/error-boundary';

const Clocker: React.FC = () => {
    const [deviceCoordinates, setDeviceCoordinates] = useState<GeoCoordinates>(null as unknown as GeoCoordinates);

    const {
        isAHOD,
        isHOD,
        isCampusPastor,
        user: { department, campus, userId },
    } = useRole();

    const { data: latestService, refetch: refetchService } = useGetLatestServiceQuery(campus?._id as string);

    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
        error: attendanceReportError,
    } = useGetDepartmentAttendanceReportQuery({
        serviceId: latestService?._id as string,
        departmentId: department?._id,
    });

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isLoading: leadersLoading,
    } = useGetLeadersAttendanceReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus?._id,
    });

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isLoading: workersLoading,
    } = useGetWorkersAttendanceReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus?._id,
    });

    const { data: tickets, refetch: refetchTickets } = useGetCampusTicketReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus?._id,
    });

    useScreenFocus({
        onFocus: () => {
            refetchService();
            refetchLeaders();
            refetchWorkers();
            refetchTickets();
            attendanceReportRefetch();
        },
    });

    const {
        latestService: { data },
    } = React.useContext(HomeContext);

    const { data: campusData } = useGetCampusByIdQuery(campus?._id);

    const selectCoordinateRef = React.useMemo(() => {
        if (data?.isGlobalService) return data?.coordinates;

        return campusData?.coordinates;
    }, [data, campusData]);

    const campusCoordinates = {
        latitude: selectCoordinateRef?.lat,
        longitude: selectCoordinateRef?.long,
    };

    const { isInRange, distance } = useGeoLocation({
        deviceCoordinates,
        rangeToClockIn: data?.rangeToClockIn as number,
        campusCoordinates: campusCoordinates as ICampusCoordinates,
    });

    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                setDeviceCoordinates(position?.coords);
            },
            error => {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [deviceCoordinates?.latitude, deviceCoordinates?.longitude, data?.coordinates.lat]);

    const vh = Dimensions.get('window').height;

    const heightOffset = vh > 835 ? vh - 380 : vh > 800 ? vh - 360 : vh - 300;

    return (
        <Center pt={8} _dark={{ bg: 'black' }}>
            <Timer />
            <If condition={isCampusPastor}>
                <CampusAttendanceSummary
                    leadersAttendance={leadersAttendance?.attendance}
                    workersAttendance={workersAttendance?.attendance}
                    leaderUsers={leadersAttendance?.leaderUsers}
                    workerUsers={workersAttendance?.workerUsers}
                />
                <CampusTicketSummary tickets={tickets} />
            </If>
            {!userId ? (
                <Loading />
            ) : (
                <If condition={!isCampusPastor}>
                    <VStack h={heightOffset} alignItems="center" justifyContent="space-between">
                        <ErrorBoundary>
                            <ClockButton deviceCoordinates={deviceCoordinates} isInRange={!!isInRange} />
                        </ErrorBoundary>
                        <CampusLocation />
                        <If condition={isAHOD || isHOD}>
                            <TeamAttendanceSummary
                                isLoading={attendanceReportLoading}
                                attendance={attendanceReport?.attendance}
                                departmentUsers={attendanceReport?.departmentUsers}
                            />
                        </If>
                        <ClockStatistics />
                    </VStack>
                </If>
            )}
        </Center>
    );
};

export default Clocker;
