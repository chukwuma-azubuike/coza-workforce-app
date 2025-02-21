import React from 'react';
import { Icon } from '@rneui/base';
import { Center, Flex, HStack, Text, VStack } from 'native-base';
import { THEME_CONFIG } from '@config/appConfig';
import { CountUp } from 'use-count-up';
import Loading from '@components/atoms/loading';
import { TouchableOpacity } from 'react-native';
import { ROLES } from '@hooks/role';
import { useNavigation } from '@react-navigation/native';

export interface ITeamAttendanceSummary {
    departmentUsers?: number;
    attendance?: number;
    tickets?: number;
    isLoading?: boolean;
}

export const TeamAttendanceSummary: React.FC<ITeamAttendanceSummary> = React.memo(props => {
    const { departmentUsers, attendance, isLoading } = props;
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Attendance' as never, { route: 'teamAttendance' } as never);
    };

    return (
        <Center>
            {isLoading ? (
                <Loading style={{ height: 40, width: 40 }} />
            ) : (
                <TouchableOpacity delayPressIn={0} activeOpacity={0.6} onPress={handlePress} accessibilityRole="button">
                    <HStack alignItems="baseline">
                        <Flex alignItems="center" flexDirection="row">
                            <Icon color={THEME_CONFIG.primaryLight} name="people-outline" type="ionicon" size={18} />
                            <Text ml={2} fontSize="md" _dark={{ color: 'gray.400' }} _light={{ color: 'gray.600' }}>
                                Members clocked in:
                            </Text>
                        </Flex>

                        <Flex alignItems="baseline" flexDirection="row">
                            <Text fontWeight="semibold" color="primary.500" fontSize="4xl" ml={1}>
                                <CountUp isCounting duration={2} end={attendance || 0} />
                            </Text>
                            <Text
                                fontSize="md"
                                fontWeight="semibold"
                                _dark={{ color: 'gray.400' }}
                                _light={{ color: 'gray.600' }}
                            >
                                /<CountUp isCounting duration={2} end={departmentUsers || 0} />
                            </Text>
                        </Flex>
                    </HStack>
                </TouchableOpacity>
            )}
        </Center>
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
    const { navigate } = useNavigation<any>();

    const handleNavigation = (role: ROLES[] | ROLES) => () => {
        return navigate('Attendance', isGH ? undefined : { role });
    };

    return (
        <Center>
            <HStack alignItems="center" space={10}>
                <TouchableOpacity activeOpacity={0.6} onPress={handleNavigation([ROLES.HOD, ROLES.AHOD])}>
                    <VStack alignItems="center">
                        <Flex alignItems="baseline" flexDirection="row">
                            <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>
                                <CountUp isCounting duration={2} end={leadersAttendance || 0} />
                            </Text>
                            <Text
                                fontWeight="semibold"
                                _light={{ color: 'gray.600' }}
                                _dark={{ color: 'gray.400' }}
                                fontSize="md"
                            >{`/${leaderUsers || 0}`}</Text>
                        </Flex>
                        <Flex alignItems="center" flexDirection="row">
                            <Icon color={THEME_CONFIG.primary} name="people-outline" type="ionicon" size={18} />
                            <Text _light={{ color: 'gray.600' }} _dark={{ color: 'gray.400' }} fontSize="md" ml={2}>
                                Leaders present
                            </Text>
                        </Flex>
                    </VStack>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.6} onPress={handleNavigation(ROLES.worker)}>
                    <VStack alignItems="center">
                        <Flex alignItems="baseline" flexDirection="row">
                            <Text fontWeight="semibold" color="primary.600" fontSize="4xl" ml={1}>
                                <CountUp isCounting duration={2} end={workersAttendance || 0} />
                            </Text>
                            <Text
                                fontWeight="semibold"
                                _light={{ color: 'gray.600' }}
                                _dark={{ color: 'gray.400' }}
                                fontSize="md"
                            >{`/${workerUsers || 0}`}</Text>
                        </Flex>
                        <Flex alignItems="center" flexDirection="row">
                            <Icon color={THEME_CONFIG.primary} type="material-community" name="crowd" size={18} />
                            <Text _light={{ color: 'gray.600' }} _dark={{ color: 'gray.400' }} fontSize="md" ml={2}>
                                Workers present
                            </Text>
                        </Flex>
                    </VStack>
                </TouchableOpacity>
            </HStack>
        </Center>
    );
});
