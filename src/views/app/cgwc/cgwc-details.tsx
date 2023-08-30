import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import useRole from '../../../hooks/role';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import If from '../../../components/composite/if-container';
import StaggerButtonComponent from '../../../components/composite/stagger';
import { IReportTypes } from '../export';
import Carousel from 'react-native-snap-carousel';
import { Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, Divider, Text } from 'native-base';
import TopNav from '../home/top-nav';
import { MyAttendance } from './attendance';

const CGWCDetails: React.FC<NativeStackScreenProps<ParamListBase>> = props => {
    const { isQC, isAHOD, isHOD, isCampusPastor, isGlobalPastor, isQcHOD } = useRole();
    const navigation = props.navigation;

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
    const { width } = Dimensions.get('window'); // Get the screen width

    return (
        <ViewWrapper scroll noPadding>
            <TopNav {...navigation} />
            <Text textAlign="center" fontSize="2xl" bold pt={3} pb={4}>
                CGWC - September 2023
            </Text>
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
            <Box px={1}>
                <Divider my={5} />
                <Box px={2}>
                    <MyAttendance />
                </Box>
                {/* <Box height={300} width="100%" bg="gray.500"></Box> */}
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
        </ViewWrapper>
    );
};

export default CGWCDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        // marginHorizontal: 10,
    },
    item: {
        backgroundColor: 'gray',
        borderRadius: 4,
        height: 200,
        elevation: 5, // Add shadow for a modern effect
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333', // Customize text color
    },
});
