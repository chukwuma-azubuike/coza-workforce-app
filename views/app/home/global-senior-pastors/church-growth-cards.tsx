import React from 'react';
import { StatCardComponent } from '@components/composite/card';
import ViewWrapper from '@components/layout/viewWrapper';
import { IGSPReport } from '@store/services/reports';
import { View } from 'react-native';

interface IChurchGrowthCardsProps {
    isLoading?: boolean;
    guestAttendance?: IGSPReport['guestAttendance'];
    serviceAttendance?: IGSPReport['serviceAttendance'];
}

const ChurchGrowthCards: React.FC<IChurchGrowthCardsProps> = ({ isLoading, guestAttendance, serviceAttendance }) => {
    return (
        <ViewWrapper scroll noPadding refreshing={isLoading}>
            <View className="flex-row flex-wrap">
                <StatCardComponent
                    // percent
                    label="Men"
                    // suffix="+12"
                    iconType="ionicon"
                    iconName="man-outline"
                    isLoading={isLoading}
                    value={serviceAttendance?.menAttendance}
                />
                <StatCardComponent
                    // percent
                    label="Women"
                    // suffix="+12"
                    iconName="woman-outline"
                    iconType="ionicon"
                    isLoading={isLoading}
                    value={serviceAttendance?.womenAttendance}
                />
                <StatCardComponent
                    // percent
                    label="Teenagers"
                    // suffix="+17"
                    iconName="child"
                    iconType="font-awesome"
                    isLoading={isLoading}
                    value={serviceAttendance?.teenagerAttendance}
                />
                <StatCardComponent
                    // percent
                    label="Children"
                    // suffix="+12"
                    iconName="child"
                    iconType="font-awesome"
                    isLoading={isLoading}
                    value={serviceAttendance?.childrenAttendance}
                />
                <StatCardComponent
                    // percent
                    label="First timers"
                    // suffix="+22"
                    iconName="badge"
                    iconType="simple-line-icon"
                    isLoading={isLoading}
                    value={guestAttendance?.firstTimer}
                />
                <StatCardComponent
                    // percent
                    label="New Converts"
                    // suffix="+32"
                    iconName="person-add-outline"
                    iconType="ionicon"
                    isLoading={isLoading}
                    value={guestAttendance?.newConvert}
                />
            </View>
        </ViewWrapper>
    );
};

export default React.memo(ChurchGrowthCards);
