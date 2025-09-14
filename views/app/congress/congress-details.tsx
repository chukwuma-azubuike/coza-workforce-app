import { Text } from '~/components/ui/text';
import React from 'react';
import useRole from '@hooks/role';
import If from '@components/composite/if-container';
import StaggerButtonComponent from '@components/composite/stagger';
import { IReportTypes } from '../export';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Alert, Animated, Dimensions, Image, StyleSheet, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { MyCongressAttendance } from './congress-attendance';
import ScrollContainer from '@components/composite/scroll-container';
import Loading from '@components/atoms/loading';
import { CongressReportSummary } from './report';
import { useGetLatestServiceQuery, useGetServicesQuery } from '@store/services/services';
import { ScreenHeight } from '@rneui/base';
import useMediaQuery from '@hooks/media-query';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import { ICongressInstantMessage } from '@store/types';
import RatingComponent from '@components/composite/rating';
import assertCongressActive from '@utils/assertCongressActive';
import { Separator } from '~/components/ui/separator';
import { useGetCongressByIdQuery, useGetCongressInstantMessagesQuery } from '~/store/services/congress';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const width = Dimensions.get('window').width;

const CongressDetails: React.FC = () => {
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

    const params = useLocalSearchParams() as unknown as { congressId: string; rating: number; name: string };
    const CGWCId = params?.congressId;

    const { setOptions } = useNavigation();

    setOptions({
        title: params.name,
    });

    const isLeader = isCampusPastor || isGlobalPastor || isHOD || isAHOD || isSuperAdmin || isGroupHead;
    const goToExport = () => {
        router.push({ pathname: '/export-data', params: { type: IReportTypes.ATTENDANCE } });
    };

    const carouselHeight = isMobile ? ScreenHeight / 4 : ScreenHeight / 3;

    const ref = React.useRef<ICarouselInstance>(null);

    const CarouselItem: React.FC<{ item: ICongressInstantMessage; index: number }> = ({ item, index }) => {
        const handlePress = () => {
            if (!!item?.messageLink) {
                router.push({ pathname: '/congress/congress-resources', params: item as any });
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
                            <Text className="italic line-clamp-4">{item.message}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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

    const {
        data: congress,
        isLoading,
        isFetching,
    } = useGetCongressByIdQuery(CGWCId, { refetchOnMountOrArgChange: true });

    const {
        data: messages = [],
        refetch: refetchMessages,
        isLoading: messagesIsLoading,
    } = useGetCongressInstantMessagesQuery({ cgwcId: CGWCId });

    const gotoCreateInstantMessage = () => {
        router.push({ pathname: '/congress/create-instant-message', params: { CongressId: CGWCId } });
    };

    const gotoCreateSession = () => {
        router.push({ pathname: '/service-management/create-congress-session', params: { CongressId: CGWCId } });
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
                return router.push({ pathname: '/congress/congress-report', params: { CGWCId } });
            }
            refetchSessions();
            refetchMessages();
        },
    });

    const handleFeedbackPress = () => {
        if (!!congress) {
            if (!assertCongressActive(congress)) {
                return router.push({ pathname: '/congress/congress-feedback', params: { CGWCId } });
            }
            Alert.alert('Congress Feedback', 'You will only be able to give your feedback on the last day of Congress');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ViewWrapper noPadding className="flex-1">
                <If condition={isLoading || isFetching || messagesIsLoading}>
                    <Loading cover className="flex-1" />
                </If>
                <If condition={!isLoading && !isFetching && !!congress}>
                    <ScrollContainer scrollOffsetY={scrollOffsetY}>
                        <View className="min-w-[5rem] min-h-[4rem]">
                            <Carousel
                                ref={ref}
                                width={width}
                                data={messages}
                                height={width / 1.8}
                                autoPlayInterval={3000}
                                autoPlay={messages.length > 1}
                                renderItem={CarouselItem as any}
                            />
                        </View>
                        <View className="px-1">
                            <Separator className="mt-6 mb-1" />
                            <View className="md:flex-row justify-between flex-1">
                                <View>
                                    <MyCongressAttendance
                                        sessions={sessions || []}
                                        CongressId={CGWCId}
                                        userId={userId}
                                    />
                                </View>
                                <View>
                                    <If condition={isLeader}>
                                        {!isMobile && <Separator orientation="vertical" className="mt-3 mb-2" />}
                                        <CongressReportSummary
                                            CongressId={CGWCId}
                                            sessions={sessions || []}
                                            latestService={latestService}
                                            title={isCampusPastor ? 'Campus Report' : 'Team Report'}
                                        />
                                    </If>
                                </View>
                            </View>
                            <Separator className="mt-3 mb-1" />
                        </View>
                        <View className="mt-3">
                            <Text className="font-bold px-3 text-xl">Give Feedback</Text>
                            <View style={{ marginBottom: 60, width: '100%' }}>
                                <TouchableOpacity onPress={handleFeedbackPress} activeOpacity={0.6}>
                                    <RatingComponent
                                        isDisabled
                                        defaultRating={params?.rating || 0}
                                        onFinishRating={handleFeedbackPress}
                                    />
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
                            color: 'bg-green-600',
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
    itemContainer: {
        padding: 4,
    },
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
        width: '90%',
        paddingLeft: 20,
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
