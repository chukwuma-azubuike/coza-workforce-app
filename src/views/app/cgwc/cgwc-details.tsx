import React from 'react';
import useRole from '@hooks/role';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import Carousel from 'react-native-snap-carousel';
import { Alert, Animated, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import RatingComponent from '@components/composite/rating';
import assertCGWCActive from '@utils/assertCGWCActive';

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
    const params = props.route.params as { CGWCId: string; rating: number };
    const CGWCId = params?.CGWCId;

    const isLeader = isCampusPastor || isGlobalPastor || isHOD || isAHOD || isSuperAdmin || isGroupHead;
    const goToExport = () => {
        navigation.navigate('Export Data', { type: IReportTypes.ATTENDANCE });
    };

    const carouselHeight = isMobile ? ScreenHeight / 4 : ScreenHeight / 3;

    const CarouselItem: React.FC<{ item: ICGWCInstantMessage; index: number }> = ({ item, index }) => {
        const handlePress = () => {
            if (!!item?.messageLink) {
                navigation.navigate('CGWC Resources', item);
            }
        };

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
                <View key={index} style={styles.itemContainer}>
                    <View style={[styles.item, { height: carouselHeight }]}>
                        <Image resizeMode="cover" style={styles.backgroundImage} source={{ uri: item.imageUrl }} />
                        <View style={styles.imageOverlay} />
                        <View style={styles.itemTextContainer}>
                            <Text style={styles.itemText}>{item.title}</Text>
                            <Text italic style={styles.itemTextMessage}>
                                {item.message}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const { width } = Dimensions.get('window');
    const scrollOffsetY = React.useRef<Animated.Value>(new Animated.Value(0)).current;

    const { data: latestService } = useGetLatestServiceQuery(campus?._id as string, {
        skip: !userId,
        refetchOnMountOrArgChange: true,
    });

    const { data: sessions, refetch: refetchSessions } = useGetServicesQuery(
        {
            CGWCId,
            page: 1,
            limit: 30,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: cgwc, isLoading, isFetching } = useGetCGWCByIdQuery(CGWCId, { refetchOnMountOrArgChange: true });

    const {
        data: messages,
        refetch: refetchMessages,
        isLoading: messagesIsLoading,
    } = useGetCGWCInstantMessagesQuery({ cgwcId: CGWCId });

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
            if (isGlobalPastor) {
                return navigation.navigate('CGWC Report', { CGWCId });
            }
            refetchSessions();
            refetchMessages();
        },
    });

    const handleFeedbackPress = () => {
        if (!!cgwc) {
            if (!assertCGWCActive(cgwc)) {
                return navigation.navigate('CGWC Feedback', { CGWCId });
            }
            Alert.alert('CGWC Feedback', 'You will only be able to give your feedback on the last day of CGWC');
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, flexDirection: 'column' }}>
            <ViewWrapper noPadding>
                <If condition={isLoading || isFetching || messagesIsLoading}>
                    <Loading />
                </If>
                <If condition={!isLoading && !isFetching && !!cgwc}>
                    <CGWCHeader title={cgwc?.name || ''} navigation={navigation} scrollOffsetY={scrollOffsetY} />
                    <ScrollContainer scrollOffsetY={scrollOffsetY}>
                        <Box mt={2}>
                            <Carousel<ICGWCInstantMessage>
                                loop={true}
                                autoplay={true}
                                sliderWidth={width}
                                data={messages || []}
                                autoplayInterval={3000}
                                renderItem={CarouselItem}
                                inactiveSlideOpacity={0.6}
                                itemWidth={ScreenWidth * 0.8}
                                style={{ minHeight: carouselHeight }}
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
                        <Box mt={6}>
                            <Text bold px={3} fontSize="lg">
                                Give Feedback
                            </Text>
                            <View style={{ marginBottom: 220, width: '100%' }}>
                                <TouchableOpacity onPress={handleFeedbackPress} activeOpacity={0.9}>
                                    <RatingComponent isDisabled defaultRating={params?.rating || 0} />
                                </TouchableOpacity>
                            </View>
                        </Box>
                    </ScrollContainer>
                    <If condition={isSuperAdmin}>
                        <StaggerButtonComponent buttons={allButtons as unknown as any} />
                    </If>
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
                </If>
            </ViewWrapper>
        </SafeAreaView>
    );
};

export default React.memo(CGWCDetails);

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
    itemTextMessage: {
        left: 20,
        opacity: 1,
        zIndex: 10,
        fontSize: 14,
        textAlign: 'left',
        flexWrap: 'wrap',
        fontWeight: '300',
        color: '#fff',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        position: 'absolute',
    },
});
