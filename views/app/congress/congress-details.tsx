import { Text } from '~/components/ui/text';
import React from 'react';
import useRole from '@hooks/role';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import Carousel from 'react-native-snap-carousel';
import { Alert, Animated, Dimensions, Image, StyleSheet, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { MyCongressAttendance } from './attendance';
import CongressHeader from './components/header';
import ScrollContainer from '@components/composite/scroll-container';
import Loading from '@components/atoms/loading';
import { CongressReportSummary } from './report';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import useMediaQuery from '@hooks/media-query';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import { ICongressInstantMessage } from '@store/types';
import RatingComponent from '@components/composite/rating';
import assertCongressActive from '@utils/assertCongressActive';
import { Separator } from '~/components/ui/separator';
import { useGetCongressByIdQuery, useGetCongressInstantMessagesQuery } from '~/store/services/congress';

const CongressDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
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
    const params = props.route.params as { CongressId: string; rating: number };
    const CongressId = params?.CongressId;

    const isLeader = isCampusPastor || isGlobalPastor || isHOD || isAHOD || isSuperAdmin || isGroupHead;
    const goToExport = () => {
        navigation.navigate('Export Data', { type: IReportTypes.ATTENDANCE });
    };

    const carouselHeight = isMobile ? ScreenHeight / 4 : ScreenHeight / 3;

    const CarouselItem: React.FC<{ item: ICongressInstantMessage; index: number }> = ({ item, index }) => {
        const handlePress = () => {
            if (!!item?.messageLink) {
                navigation.navigate('Congress Resources', item);
            }
        };

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
                <View key={index} style={styles.itemContainer}>
                    <View style={[styles.item, { height: carouselHeight }]}>
                        <Image resizeMode="cover" style={styles.backgroundImage} source={{ uri: item.imageUrl }} />
                        <View style={styles.imageOverlay} />
                        <View style={styles.itemTextContainer}>
                            <Text>{item.title}</Text>
                            <Text className="italic">{item.message}</Text>
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
            CongressId,
            page: 1,
            limit: 30,
        },
        {
            refetchOnMountOrArgChange: true,
        }
    );

    const { data: congress, isLoading, isFetching } = useGetCongressByIdQuery(CongressId, { refetchOnMountOrArgChange: true });

    const {
        data: messages,
        refetch: refetchMessages,
        isLoading: messagesIsLoading,
    } = useGetCongressInstantMessagesQuery({ cgwcId: CongressId });

    const gotoCreateInstantMessage = () => {
        navigation.navigate('Create Instant Message', { CongressId });
    };

    const gotoCreateSession = () => {
        navigation.navigate('Create Congress session', { CongressId });
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
                return navigation.navigate('Congress Report', { CongressId });
            }
            refetchSessions();
            refetchMessages();
        },
    });

    const handleFeedbackPress = () => {
        if (!!congress) {
            if (!assertCongressActive(congress)) {
                return navigation.navigate('Congress Feedback', { CongressId });
            }
            Alert.alert('Congress Feedback', 'You will only be able to give your feedback on the last day of Congress');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ViewWrapper noPadding>
                <If condition={isLoading || isFetching || messagesIsLoading}>
                    <Loading />
                </If>
                <If condition={!isLoading && !isFetching && !!congress}>
                    <CongressHeader title={congress?.name || ''} navigation={navigation} scrollOffsetY={scrollOffsetY} />
                    <ScrollContainer scrollOffsetY={scrollOffsetY}>
                        <View mt={2}>
                            <Carousel<ICongressInstantMessage>
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
                        </View>
                        <View className="px-1">
                            <Separator className="mt-6 mb-1" />
                            <View flexDirection={['column', 'row']} justifyContent="space-between" flex={1}>
                                <View style={{ width: isMobile ? '100%' : '50%' }}>
                                    <MyCongressAttendance sessions={sessions || []} CongressId={CongressId} userId={userId} />
                                </View>
                                <View style={{ width: isMobile ? '100%' : '50%', flex: 1 }}>
                                    <If condition={isLeader}>
                                        {!isMobile && <Separator mt={3} mb={2} orientation="vertical" />}
                                        <CongressReportSummary
                                            CongressId={CongressId}
                                            sessions={sessions || []}
                                            latestService={latestService}
                                            title={isCampusPastor ? 'Campus Report' : 'Team Report'}
                                        />
                                    </If>
                                </View>
                            </View>
                            <Separator mt={6} mb={1} />
                        </View>
                        <View mt={6}>
                            <Text fontSize="lg" className="font-bold px-3">
                                Give Feedback
                            </Text>
                            <View style={{ marginBottom: 60, width: '100%' }}>
                                <TouchableOpacity onPress={handleFeedbackPress} activeOpacity={0.9}>
                                    <RatingComponent isDisabled defaultRating={params?.rating || 0} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollContainer>
                </If>
            </ViewWrapper>
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
        </SafeAreaView>
    );
};

export default React.memo(CongressDetails);

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
