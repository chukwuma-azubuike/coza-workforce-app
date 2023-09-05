import React from 'react';
import useRole from '@hooks/role';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import Carousel from 'react-native-snap-carousel';
import { Animated, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, Divider, Stack, Text } from 'native-base';
import { MyCGWCAttendance } from './attendance';
import CGWCHeader from './components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScrollContainer from '@components/composite/scroll-container';
import { useGetCGWCByIdQuery, useGetCGWCInstantMessagesQuery } from '@store/services/cgwc';
import Loading from '@components/atoms/loading';
import { CGWCReportSummary } from './report';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import useMediaQuery from '@hooks/media-query';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import { ICGWCInstantMessage } from '@store/types';

const CGWCDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const {
        isCampusPastor,
        isGlobalPastor,
        isQcHOD,
        isHOD,
        isGroupHead,
        isAHOD,
        isSuperAdmin,
        user: { _id: userId, campus },
    } = useRole();
    const { isMobile } = useMediaQuery();
    const navigation = props.navigation;
    const params = props.route.params as { CGWCId: string };
    const CGWCId = params?.CGWCId;

    const isLeader = isCampusPastor || isGlobalPastor || isHOD || isAHOD || isSuperAdmin || isGroupHead;
    const goToExport = () => {
        navigation.navigate('Export Data', { type: IReportTypes.ATTENDANCE });
    };

    const CarouselItem: React.FC<{ item: ICGWCInstantMessage; index: number }> = ({ item, index }) => {
        const handlePress = () => {
            navigation.navigate('CGWC Resources', item);
        };

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
                <View key={index} style={styles.itemContainer}>
                    <View style={[styles.item, { height: isMobile ? ScreenHeight / 4 : ScreenHeight / 3 }]}>
                        <Image resizeMode="cover" style={styles.backgroundImage} source={{ uri: item.imageUrl }} />
                        <View style={styles.imageOverlay} />
                        <View style={styles.itemTextContainer}>
                            <Text style={styles.itemText}>{item.title}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const { width } = Dimensions.get('window');
    const scrollOffsetY = React.useRef<Animated.Value>(new Animated.Value(0)).current;

    const { data: latestService, isLoading: latestServiceIsLoading } = useGetLatestServiceQuery(campus?._id as string, {
        skip: !userId,
        refetchOnMountOrArgChange: true,
    });

    const {
        data: sessions,
        refetch: refetchSessions,
        isLoading: isLoadingSessions,
        isFetching: isFetchingSessions,
    } = useGetServicesQuery(
        {
            CGWCId,
            page: 1,
            limit: 30,
        },
        {
            refetchOnFocus: true,
            refetchOnReconnect: true,
            refetchOnMountOrArgChange: true,
        }
    );

    const {
        data: cgwc,
        isLoading,
        isFetching,
        isSuccess,
    } = useGetCGWCByIdQuery(CGWCId, { refetchOnMountOrArgChange: true });

    const {
        data: messages,
        isLoading: messagesIsLoading,
        isFetching: messagesIsFetching,
    } = useGetCGWCInstantMessagesQuery({ CGWCId });

    const data = [
        {
            messageLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            title: 'Welcome to CGWC October 2023',
            imageUrl: 'https://i.ibb.co/7Jgmgvt/COZA-96.webp',
        },
        {
            messageLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            title: 'Recharge your spirit man',
            imageUrl: 'https://i.ibb.co/ScJtBCZ/MG-0793.webp',
        },
        {
            messageLink: 'https://research.nhm.org/pdfs/10840/10840.pdf',
            title: 'Itinerary',
            imageUrl: 'https://i.ibb.co/P9Z8JDh/MG-0778.webp',
        },
        {
            messageLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            title: 'Uniform Chart',
            imageUrl: 'https://i.ibb.co/FDBSDGP/COZA-84.webp',
        },
        {
            messageLink: 'https://research.nhm.org/pdfs/10840/10840.pdf',
            title: 'Resources',
            imageUrl: 'https://i.ibb.co/02mHVgp/COZA-20.webp',
        },
    ] as ICGWCInstantMessage[];

    const gotoCreateInstantMessage = () => {
        navigation.navigate('Create Instant Message', { CGWCId });
    };

    const gotoCreateSession = () => {
        navigation.navigate('Create CGWC session', { CGWCId });
    };

    const allButtons = [
        {
            color: 'blue.400',
            iconType: 'entypo',
            iconName: 'new-message',
            handleClick: gotoCreateInstantMessage,
        },
        {
            color: 'blue.600',
            iconType: 'font-awesome',
            iconName: 'calendar-plus-o',
            handleClick: gotoCreateSession,
        },
    ];

    useScreenFocus({
        onFocus: () => {
            refetchSessions();
        },
    });

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, flexDirection: 'column' }}>
            <ViewWrapper noPadding>
                <If condition={isLoading || isFetching}>
                    <Loading />
                </If>
                <If condition={!isLoading && !isFetching && !!cgwc}>
                    <CGWCHeader title={cgwc?.name || ''} navigation={navigation} scrollOffsetY={scrollOffsetY} />
                    <ScrollContainer scrollOffsetY={scrollOffsetY}>
                        <Box mt={2}>
                            <Carousel<ICGWCInstantMessage>
                                data={data}
                                loop={true}
                                autoplay={true}
                                sliderWidth={width}
                                autoplayInterval={3000}
                                renderItem={CarouselItem}
                                inactiveSlideOpacity={0.6}
                                itemWidth={ScreenWidth * 0.8}
                            />
                        </Box>
                        <Box px={1}>
                            <Divider mt={6} mb={1} />
                            <Stack flexDirection={['column', 'row']} justifyContent="space-between" flex={1}>
                                <MyCGWCAttendance sessions={sessions || []} CGWCId={CGWCId} userId={userId} />
                                <If condition={isLeader}>
                                    {!isMobile && <Divider mt={3} mb={2} orientation="vertical" />}
                                    <CGWCReportSummary
                                        CGWCId={CGWCId}
                                        sessions={sessions || []}
                                        latestService={latestService}
                                        title={isCampusPastor ? 'Campus Report' : 'Team Report'}
                                    />
                                </If>
                            </Stack>
                            <Divider mt={6} mb={1} />
                        </Box>
                        <If condition={isCampusPastor || isGlobalPastor || isQcHOD}>
                            <StaggerButtonComponent
                                buttons={[
                                    {
                                        color: 'green.600',
                                        iconType: 'ionicon',
                                        handleClick: goToExport,
                                        iconName: 'download-outline',
                                    },
                                ]}
                            />
                        </If>
                    </ScrollContainer>
                    <If condition={isSuperAdmin}>
                        <StaggerButtonComponent buttons={allButtons as unknown as any} />
                    </If>
                </If>
            </ViewWrapper>
        </SafeAreaView>
    );
};

export default CGWCDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {},
    item: {
        elevation: 5,
        backgroundColor: 'transparent',
    },
    imageOverlay: {
        padding: 4,
        opacity: 0.4,
        width: '100%',
        height: '100%',
        borderRadius: 8,
        position: 'absolute',
        backgroundColor: '#000',
    },
    itemTextContainer: {
        bottom: 20,
        width: '80%',
        position: 'absolute',
    },
    itemText: {
        left: 20,
        opacity: 1,
        zIndex: 10,
        fontSize: 20,
        textAlign: 'left',
        flexWrap: 'wrap',
        fontWeight: '500',
        color: '#fff',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        position: 'absolute',
    },
});
