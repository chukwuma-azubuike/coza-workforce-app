import { Text } from '~/components/ui/text';
import React from 'react';
import { THEME_CONFIG } from '@config/appConfig';
import { CountUp } from 'use-count-up';
import Loading from '@components/atoms/loading';
import { TouchableOpacity, View } from 'react-native';
import { ROLES } from '@hooks/role';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Icon } from '@rneui/themed';

export interface ITeamAttendanceSummary {
    departmentUsers?: number;
    attendance?: number;
    tickets?: number;
    isLoading?: boolean;
}

export const TeamAttendanceSummary: React.FC<ITeamAttendanceSummary> = React.memo(props => {
    const { departmentUsers, attendance, isLoading } = props;

    const handlePress = () => {
        router.push({ pathname: '/attendance', params: { route: 'teamAttendance' } });
    };

    return (
        <View className="items-center">
            {isLoading ? (
                <Loading style={{ height: 40, width: 40 }} />
            ) : (
                <TouchableOpacity delayPressIn={0} activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
                    <View className="items-baseline flex-row">
                        <View className="items-center flex-row">
                            <Ionicons
                                color={THEME_CONFIG.primaryLight}
                                name="people-outline"
                                type="ionicon"
                                size={18}
                            />
                            <Text className="ml-2 text-muted-foreground">Members clocked in:</Text>
                        </View>

                        <View className="items-baseline flex-row">
                            <Text className="font-bold text-primary/70 dark:text-purple-600 text-5xl ml-1">
                                <CountUp isCounting duration={2} end={attendance || 0} />
                            </Text>
                            <Text className="font-semibold text-muted-foreground">
                                /<CountUp isCounting duration={2} end={departmentUsers || 0} />
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
});

export interface ITeamAttendanceSummary {
    leadersAttendance?: number;
    workersAttendance?: number;
    workerUsers?: number;
    leaderUsers?: number;
    isLoading?: boolean;
    isGH?: boolean;
}

export const CampusAttendanceSummary: React.FC<ITeamAttendanceSummary> = React.memo(props => {
    const { leaderUsers, leadersAttendance, workerUsers, workersAttendance, isGH } = props;

    const handleNavigation = (role: ROLES[] | ROLES) => () => {
        return router.push({ pathname: '/attendance', params: isGH ? undefined : { role } });
    };

    return (
        <View className="items-center py-2">
            <View className="items-center gap-10 flex-row">
                <TouchableOpacity activeOpacity={0.6} onPress={handleNavigation([ROLES.HOD, ROLES.AHOD])}>
                    <View className="items-center">
                        <View className="items-baseline flex-row">
                            <Text className="font-semibold text-primary text-5xl ml-1">
                                <CountUp isCounting duration={2} end={leadersAttendance || 0} />
                            </Text>
                            <Text className="font-semibold text-2xl text-muted-foreground">{`/${
                                leaderUsers || 0
                            }`}</Text>
                        </View>
                        <View className="items-center flex-row">
                            <Ionicons color={THEME_CONFIG.primary} name="people-outline" size={18} />
                            <Text className="text-muted-foreground ml-2">Leaders present</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.6} onPress={handleNavigation(ROLES.worker)}>
                    <View className="items-center">
                        <View className="items-center flex-row">
                            <Text className="font-semibold text-primary text-5xl ml-1">
                                <CountUp isCounting duration={2} end={workersAttendance || 0} />
                            </Text>
                            <Text className="font-semibold text-muted-foreground text-2xl ml-1">{`/${workerUsers || 0}`}</Text>
                        </View>
                        <View className="items-center flex-row">
                            <Icon color={THEME_CONFIG.primary} type="material-community" name="crowd" size={18} />
                            <Text className="text-muted-foreground ml-2">Workers present</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
});
