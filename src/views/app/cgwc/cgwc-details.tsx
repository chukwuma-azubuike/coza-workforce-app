import React from 'react';
import useRole from '../../../hooks/role';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { IReportTypes } from '../export';
import Carousel from 'react-native-snap-carousel';
import { Alert, Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, Divider, Text } from 'native-base';
import { MyCGWCAttendance } from './attendance';
import CGWCHeader from './components/header';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScrollContainer from '../../../components/composite/scroll-container';
import { useGetCGWCByIdQuery } from '../../../store/services/cgwc';
import Loading from '../../../components/atoms/loading';

const CGWCDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const {
        isCampusPastor,
        isGlobalPastor,
        isQcHOD,
        user: { _id: userId },
    } = useRole();
    const navigation = props.navigation;
    const params = props.route.params as { cgwcId: string };
    const cgwcId = params?.cgwcId;

    const goToExport = () => {
        navigation.navigate('Export Data', { type: IReportTypes.ATTENDANCE });
    };

    const CarouselItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
        const handlePress = () => {
            Alert.alert('Pressed');
        };

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
                <View key={index} style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{item.title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const data = [
        { title: 'Item 1' },
        { title: 'Item 2' },
        { title: 'Item 3' },
        { title: 'Item 4' },
        { title: 'Item 5' },
    ];

    const { width } = Dimensions.get('window');
    const scrollOffsetY = React.useRef<Animated.Value>(new Animated.Value(0)).current;

    const {
        data: cgwc,
        isLoading,
        isFetching,
        isSuccess,
    } = useGetCGWCByIdQuery(cgwcId, { refetchOnMountOrArgChange: true });

    return (
        <SafeAreaView
            edges={['bottom', 'left', 'right']}
            style={{ flex: 1, flexDirection: 'column', paddingBottom: 100 }}
        >
            <If condition={isLoading || isFetching}>
                <Loading />
            </If>
            <If condition={(!isLoading || !isFetching) && !!cgwc}>
                <CGWCHeader
                    navigation={navigation}
                    scrollOffsetY={scrollOffsetY}
                    title={cgwc?.name || 'CGWC October 2023'}
                />
                <ScrollContainer scrollOffsetY={scrollOffsetY}>
                    <Box mt={2}>
                        <Carousel
                            data={data}
                            loop={true}
                            autoplay={true}
                            sliderWidth={width}
                            itemWidth={width - 120}
                            autoplayInterval={3000}
                            renderItem={CarouselItem}
                            inactiveSlideOpacity={0.6}
                        />
                    </Box>
                    <Box px={1}>
                        <Divider mt={6} mb={1} />
                        <MyCGWCAttendance cgwcId={cgwcId} userId={userId} />
                    </Box>
                    <If condition={isCampusPastor || isGlobalPastor || isQcHOD}>
                        <StaggerButtonComponent
                            buttons={[
                                {
                                    color: 'green.600',
                                    iconName: 'download-outline',
                                    handleClick: goToExport,
                                    iconType: 'ionicon',
                                },
                            ]}
                        />
                    </If>
                </ScrollContainer>
            </If>
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
        backgroundColor: 'gray',
        borderRadius: 4,
        height: 200,
        elevation: 5,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});
