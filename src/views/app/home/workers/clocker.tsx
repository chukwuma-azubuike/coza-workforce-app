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

const Clocker: React.FC = () => {
    const [deviceCoordinates, setDeviceCoordinates] = useState<GeoCoordinates>(null as unknown as GeoCoordinates);

    const {
        user: { department, campus },
    } = useRole();

    const { data: latestService, refetch: refetchService } = useGetLatestServiceQuery(campus?._id as string);

    const {
        data: attendanceReport,
        isLoading: attendanceReportLoading,
        refetch: attendanceReportRefetch,
    } = useGetDepartmentAttendanceReportQuery({
        serviceId: latestService?._id as string,
        departmentId: department._id,
    });

    const {
        data: leadersAttendance,
        refetch: refetchLeaders,
        isLoading: leadersLoading,
    } = useGetLeadersAttendanceReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus._id,
    });

    const {
        data: workersAttendance,
        refetch: refetchWorkers,
        isLoading: workersLoading,
    } = useGetWorkersAttendanceReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus._id,
    });

    const { data: tickets, refetch: refetchTickets } = useGetCampusTicketReportQuery({
        serviceId: latestService?._id as string,
        campusId: campus._id,
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

    const campusCoordinates = {
        latitude: data?.coordinates.lat,
        longitude: data?.coordinates.long,
    };

    const { isInRange, distance } = useGeoLocation({
        deviceCoordinates,
        rangeToClockIn: data?.rangeToClockIn as number,
        campusCoordinates: campusCoordinates as ICampusCoordinates,
    });

    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                setDeviceCoordinates(position.coords);
            },
            error => {},
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [deviceCoordinates?.latitude, deviceCoordinates?.longitude, data?.coordinates.lat]);

    const { isAHOD, isHOD, isCampusPastor, user } = useRole();

    const vh = Dimensions.get('window').height;

    const heightOffset = vh > 835 ? vh - 380 : vh > 800 ? vh - 300 : vh - 300;

    return (
        <Center px={4} pt={8} _dark={{ bg: 'black' }}>
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
            {!user ? (
                <Loading />
            ) : (
                <If condition={!isCampusPastor}>
                    <VStack h={heightOffset} alignItems="center" justifyContent="space-between">
                        <ClockButton deviceCoordinates={deviceCoordinates} isInRange={!!isInRange} />
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
